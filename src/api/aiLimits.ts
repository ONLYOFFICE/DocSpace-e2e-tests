import { APIRequestContext, test } from "@playwright/test";
import Apisystem from "./apisystem";

// "Total" = portal limit, "Global" = common per-user limit,
// "Custom" = individual limit of one user (set in Contacts).
export type AiLimitScope = "Total" | "Global" | "Custom";
export type AiLimitPeriod = "Day" | "Week" | "Month" | "Lifetime";

export type AiLimit = {
  id: number;
  scope: AiLimitScope;
  amountValue: number;
  currency: string;
  period: AiLimitPeriod;
  enabled?: boolean;
  usage?: {
    periodStart: string;
    periodEnd: string;
    amountConsumed: number;
    amountAvailable: number;
    quantityConsumed: number;
  };
};

// The UI and POST/participants endpoints reject amounts below US$1, but an
// existing limit can be lowered further via PUT by id. A sub-dollar limit is
// what blocks AI on the very first request (the server pre-estimates the
// request cost against the remaining limit).
const MIN_CREATE_AMOUNT = 1;

const SERVICE_LIMIT_PATH = "/api/2.0/portal/payment/servicelimit";

export class AiLimitsApi {
  private apiContext: APIRequestContext;
  private portalSetupApi: Apisystem;

  constructor(apiContext: APIRequestContext, portalSetupApi: Apisystem) {
    this.apiContext = apiContext;
    this.portalSetupApi = portalSetupApi;
  }

  private get portalBaseUrl(): string {
    return this.portalSetupApi.portalBaseUrl;
  }

  private get headers() {
    const ownerToken = this.portalSetupApi.getOwnerAuthToken();
    if (!ownerToken) {
      throw new Error(
        "Portal authentication token is not set. Please authenticate first.",
      );
    }
    return {
      Authorization: `Bearer ${ownerToken}`,
      Accept: "application/json",
    };
  }

  private async request(
    method: "get" | "post" | "put" | "delete",
    path: string,
    data?: object,
  ) {
    const response = await this.apiContext[method](
      `${this.portalBaseUrl}${path}`,
      { headers: this.headers, data, timeout: 60000 },
    );
    if (!response.ok()) {
      throw new Error(
        `${method.toUpperCase()} ${path} failed: ${response.status()} ${await response.text()}`,
      );
    }
    const body = await response.json().catch(() => ({}));
    return body.response;
  }

  // Returns null when the scope has no limit yet.
  private async getScopeLimit(
    scope: "total" | "global",
  ): Promise<AiLimit | null> {
    const response = await this.apiContext.get(
      `${this.portalBaseUrl}${SERVICE_LIMIT_PATH}/${scope}`,
      { headers: this.headers, timeout: 60000 },
    );
    if (!response.ok()) {
      return null;
    }
    const limit = (await response.json()).response;
    return limit?.id ? limit : null;
  }

  async getPortalLimit() {
    return this.getScopeLimit("total");
  }

  async getUserLimit() {
    return this.getScopeLimit("global");
  }

  // Effective limit for the user: the individual ("Custom") one if set,
  // otherwise the common per-user ("Global") one.
  async getEffectiveUserLimit(userId: string): Promise<AiLimit | null> {
    const user = await this.request("get", `/api/2.0/people/${userId}`);
    return user?.aiServicesLimit ?? null;
  }

  private async updateLimit(id: number, data: object) {
    return this.request("put", SERVICE_LIMIT_PATH, { id, ...data });
  }

  // POST is create-only (409 for a scope that already has a limit), so an
  // existing limit is updated via PUT. PUT carries no period - the period is
  // applied only when the limit is created.
  private async upsertScopeLimit(
    scope: "Total" | "Global",
    amount: number,
    period: AiLimitPeriod,
  ) {
    const getLimit = () =>
      scope === "Total" ? this.getPortalLimit() : this.getUserLimit();

    let limit = await getLimit();
    if (!limit) {
      await this.request("post", SERVICE_LIMIT_PATH, {
        scope,
        amountValue: Math.max(amount, MIN_CREATE_AMOUNT),
        period,
      });
      if (amount >= MIN_CREATE_AMOUNT) {
        return;
      }
      limit = await getLimit();
      if (!limit) {
        throw new Error(`${scope} limit was not created`);
      }
    } else if (limit.period !== period) {
      throw new Error(
        `${scope} limit already exists with period "${limit.period}", cannot switch to "${period}" via PUT`,
      );
    }

    await this.updateLimit(limit.id, { amountValue: amount, enabled: true });
  }

  async setPortalLimit(amount: number, period: AiLimitPeriod = "Day") {
    await test.step(`Set portal AI limit to US$${amount} per ${period}`, () =>
      this.upsertScopeLimit("Total", amount, period));
  }

  async setUserLimit(amount: number, period: AiLimitPeriod = "Day") {
    await test.step(`Set per-user AI limit to US$${amount} per ${period}`, () =>
      this.upsertScopeLimit("Global", amount, period));
  }

  async disablePortalLimit() {
    await test.step("Disable portal AI limit", async () => {
      const limit = await this.getPortalLimit();
      if (limit) {
        await this.updateLimit(limit.id, { enabled: false });
      }
    });
  }

  async disableUserLimit() {
    await test.step("Disable per-user AI limit", async () => {
      const limit = await this.getUserLimit();
      if (limit) {
        await this.updateLimit(limit.id, { enabled: false });
      }
    });
  }

  async setIndividualLimit(
    userId: string,
    amount: number,
    period: AiLimitPeriod = "Day",
  ) {
    await test.step(`Set individual AI limit to US$${amount} per ${period}`, async () => {
      await this.request("put", `${SERVICE_LIMIT_PATH}/participants`, {
        userIds: [userId],
        amountValue: Math.max(amount, MIN_CREATE_AMOUNT),
        period,
      });
      if (amount >= MIN_CREATE_AMOUNT) {
        return;
      }
      const limit = await this.getEffectiveUserLimit(userId);
      if (limit?.scope !== "Custom") {
        throw new Error(
          `Individual limit was not created for user ${userId} (got scope "${limit?.scope}")`,
        );
      }
      await this.updateLimit(limit.id, { amountValue: amount, enabled: true });
    });
  }

  // Same as "Set to default" in Contacts. Deletes only a "Custom" limit -
  // for a user without one the effective limit is the common "Global" one,
  // and deleting it would drop the per-user limit for everybody.
  async resetIndividualLimit(userId: string) {
    await test.step("Reset individual AI limit to default", async () => {
      const limit = await this.getEffectiveUserLimit(userId);
      if (limit?.scope === "Custom") {
        await this.request("delete", `${SERVICE_LIMIT_PATH}/${limit.id}`);
      }
    });
  }
}

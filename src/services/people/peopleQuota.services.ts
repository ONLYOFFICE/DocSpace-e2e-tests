import { test, APIRequestContext } from "@playwright/test";
import { TokenStore, Role } from "../token-store";

export enum QuotaPlan {
  Minimal = "minimal",
  Default = "default",
  OverSize = "oversize",
}

export const quotaPlanToBytes: Record<QuotaPlan, number> = {
  [QuotaPlan.Minimal]: 104857600,
  [QuotaPlan.Default]: 524288000,
  [QuotaPlan.OverSize]: 3298534883328,
};

export class PeopleQuotaApi {
  private request: APIRequestContext;
  private tokenStore: TokenStore;

  constructor(request: APIRequestContext, tokenStore: TokenStore) {
    this.request = request;
    this.tokenStore = tokenStore;
  }

  private getToken(role: Role) {
    return this.tokenStore.getToken(role);
  }

  private get portalDomain() {
    return this.tokenStore.portalDomain;
  }

  async changeUserQuotaLimit(
    role: Role,
    data: { userIds: string[]; quota: QuotaPlan },
  ) {
    return test.step("Change a user quota limit", async () => {
      const userData = {
        userIds: data.userIds,
        quota: quotaPlanToBytes[data.quota],
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/userquota`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async resetUserQuotaLimit(role: Role, data: { userIds: string[] }) {
    return test.step("Reset a user quota limit", async () => {
      const userData = {
        userIds: data.userIds,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/resetquota`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async changeUserQuotaLimitWithoutAutorization(data: {
    userIds: string[];
    quota: QuotaPlan;
  }) {
    return test.step("Change a user quota limit", async () => {
      const userData = {
        userIds: data.userIds,
        quota: quotaPlanToBytes[data.quota],
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/userquota`,
        {
          data: userData,
        },
      );
      return response;
    });
  }

  async resetUserQuotaLimitWithoutAutorization(data: { userIds: string[] }) {
    return test.step("Reset a user quota limit", async () => {
      const userData = {
        userIds: data.userIds,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/resetquota`,
        {
          data: userData,
        },
      );
      return response;
    });
  }
}

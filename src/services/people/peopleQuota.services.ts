import { test, APIRequestContext } from "@playwright/test";
import { TokenStore, Role } from "../token-store";

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
    data: { userIds: string[]; quota: number },
  ) {
    return test.step("Change a user quota limit", async () => {
      const userData = {
        userIds: data.userIds,
        quota: data.quota,
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
}

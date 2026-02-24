import { test, APIRequestContext } from "@playwright/test";
import { TokenStore, Role } from "../token-store";

export class SettingsApi {
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

  async userquotasettings(
    role: Role,
    data: { defaultQuota: number; enableQuota: boolean },
  ) {
    return test.step("Set user quota settings", async () => {
      const userData = {
        enableQuota: data.enableQuota,
        defaultQuota: data.defaultQuota,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/settings/userquotasettings`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async roomquotasettings(
    role: Role,
    data: { defaultQuota: number; enableQuota: boolean },
  ) {
    return test.step("Set room quota settings", async () => {
      const userData = {
        defaultQuota: data.defaultQuota,
        enableQuota: data.enableQuota,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/settings/roomquotasettings`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async aiagentquotasettings(
    role: Role,
    data: { defaultQuota: number; enableQuota: boolean },
  ) {
    return test.step("Set AI agent quota settings", async () => {
      const userData = {
        defaultQuota: data.defaultQuota,
        enableQuota: data.enableQuota,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/settings/aiagentquotasettings`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: userData,
        },
      );
      return response;
    });
  }
}

// TODO: add services and write tests

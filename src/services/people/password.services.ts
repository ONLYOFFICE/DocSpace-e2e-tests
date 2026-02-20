import { test, APIRequestContext } from "@playwright/test";
import { TokenStore, Role } from "../token-store";

export class PasswordApi {
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

  async remindAUserPassword(role: Role, data: { email: string }) {
    return test.step("Remind a user password", async () => {
      const userData = {
        email: data.email,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/password`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: userData,
        },
      );
      return response;
    });
  }
}
// TODO: PUT /api/2.0/people/:userid/password - need to get the confirm link from the link in the email

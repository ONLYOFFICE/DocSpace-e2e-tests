import { test, APIRequestContext } from "@playwright/test";
import { TokenStore, Role } from "../token-store";

export enum UserStatus {
  Active = 1,
  Disabled = 2,
}

export class UserStatusApi {
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

  async changeUserStatus(
    role: Role,
    status: UserStatus,
    data: {
      userIds: string[];
      resendAll: boolean;
    },
  ) {
    return test.step(`${role} change user status`, async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/status/${status}`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data,
        },
      );
      return response;
    });
  }

  async changeUserStatusWithoutAuthorization(
    status: UserStatus,
    data: {
      userIds: string[];
      resendAll: boolean;
    },
  ) {
    return test.step("Change user status", async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/status/${status}`,
        {
          data,
        },
      );
      return response;
    });
  }

  async getPlofilesByStatus(role: Role, status: UserStatus) {
    return test.step(`${role} returns a list of profiles filtered by the user status`, async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/status/${status}`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );
      return response;
    });
  }
}

/*
TODO: It's impossible to write tests for the
PUT /api/2.0/people/activationstatus/:activationstatus method,
since it's triggered by clicking a link in an email. We can't retrieve the email.
*/

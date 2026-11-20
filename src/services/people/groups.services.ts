import { test, expect, APIRequestContext } from "@playwright/test";
import { TokenStore, Role } from "../token-store";

export class GroupsApi {
  private request: APIRequestContext;
  private tokenStore: TokenStore;

  constructor(request: APIRequestContext, tokenStore: TokenStore) {
    this.request = request;
    this.tokenStore = tokenStore;
  }

  private get portalBaseUrl() {
    return this.tokenStore.portalBaseUrl;
  }

  private headers(role: Role) {
    return { Authorization: `Bearer ${this.tokenStore.getToken(role)}` };
  }

  // The first member is the group manager
  async create(role: Role, groupName: string, memberIds: string[]) {
    return test.step(`${role} create group ${groupName}`, async () => {
      const response = await this.request.post(
        `${this.portalBaseUrl}/api/2.0/group`,
        {
          headers: this.headers(role),
          data: { groupName, groupManager: memberIds[0], members: memberIds },
        },
      );
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      return body.response.id as string;
    });
  }
}

import { APIRequestContext } from "@playwright/test";

class People {
  apiContext: APIRequestContext;

  portalDomain: string = "";

  adminUserId: string = "";

  authToken: string = "";

  constructor(apiContext: APIRequestContext) {
    this.apiContext = apiContext;
  }

  setAuthToken(authToken: string) {
    this.authToken = authToken;
  }

  setPortalDomain(portalDomain: string) {
    this.portalDomain = portalDomain;
  }

  setAdminUserId(adminUserId: string) {
    this.adminUserId = adminUserId;
  }

  async activateAdminUser() {
  const response = await this.apiContext.put(
    `https://${this.portalDomain}/api/2.0/people/activationstatus/Activated`,
    {
      headers: { Authorization: `Bearer ${this.authToken}` },
      data: { userIds: [this.adminUserId] },
    },
  );

    const body = await response.json();
    if (!response.ok()) {
      throw new Error(
        `Failed to activate admin user: ${response.status()} - ${body.error || body.message}`,
      );
    }

    return body;
  }
}

export default People;

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

    const body = await response.json().catch(() => null);

    if (!response.ok()) {
      console.warn(
        "Admin activation failed",
        this.portalDomain,
        response.status(),
        body?.error || body?.message || "",
      );
      return { status: response.status(), body };
    }

    return { status: response.status(), body };
  }
}

export default People;

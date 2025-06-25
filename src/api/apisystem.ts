import { APIRequestContext } from "@playwright/test";

import config from "../../config";

class Apisystem {
  apiContext: APIRequestContext;

  portalDomain: string = "";

  adminUserId: string = "";

  portalName: string = "";

  authToken: string = "";

  constructor(apiContext: APIRequestContext) {
    this.apiContext = apiContext;
  }

  setAuthToken(authToken: string) {
    this.authToken = authToken;
  }

  async createPortal(portalNamePrefix = "test-portal") {
    this.portalName = `${portalNamePrefix}-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}`;

    const headers: { [key: string]: string } | undefined = config.DOCSPACE_LOCAL
      ? { Authorization: config.DOCSPACE_AUTH_TOKEN! }
      : undefined;

    const response = await this.apiContext.post(
      `${config.PORTAL_REGISTRATION_URL}/register`,
      {
        data: {
          portalName: this.portalName,
          firstName: "admin-zero",
          lastName: "admin-zero",
          email: config.DOCSPACE_ADMIN_EMAIL,
          password: config.DOCSPACE_ADMIN_PASSWORD,
          language: "en",
        },
        headers,
      },
    );

    const body = await response.json();

    if (!response.ok()) {
      throw new Error(
        `Failed to create portal: ${response.status()} - ${body.error || body.message}`,
      );
    }

    this.portalDomain = config.DOCSPACE_LOCAL
      ? `http://${body.tenant.domain}`
      : `https://${body.tenant.domain}`;
    this.adminUserId = body.tenant.ownerId;

    return body;
  }

  async deletePortal() {
    const domain = this.portalDomain.replace(
      this.portalDomain.split(".")[0],
      "",
    );

    const deleteUrl = `${this.portalDomain}/api/2.0/portal/deleteportalimmediately`;

    await this.apiContext.delete(deleteUrl, {
      headers: { Authorization: `Bearer ${this.authToken}` },
      data: { reference: `${this.portalName}${domain}` },
    });
  }
}

export default Apisystem;

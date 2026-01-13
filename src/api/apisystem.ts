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

  setPortalDomain(portalDomain: string) {
    this.portalDomain = portalDomain;
  }

  setPortalName(portalName: string) {
    this.portalName = portalName;
  }

  async createPortal(portalNamePrefix = "test-portal") {
    const datePrefix = new Date().toISOString().replace(/[:.]/g, "-");
    const randomPrefix = Math.random().toString(36).slice(2, 8);

    this.portalName = `${portalNamePrefix}-${randomPrefix}-${datePrefix}`;

    const response = await this.apiContext.post(
      `${config.PORTAL_REGISTRATION_URL}/register`,
      {
        data: {
          portalName: this.portalName,
          firstName: "admin-zero",
          lastName: "admin-zero",
          email: config.DOCSPACE_OWNER_EMAIL,
          password: config.DOCSPACE_OWNER_PASSWORD,
          language: "en",
        },
      },
    );

    const body = await response.json();

    if (!response.ok()) {
      throw new Error(
        `Failed to create portal: ${response.status()} - ${body.error || body.message}`,
      );
    }

    this.portalDomain = body.tenant.domain;
    this.adminUserId = body.tenant.ownerId;

    return body;
  }

  async deletePortal() {
    const deleteUrl = `https://${this.portalDomain}/api/2.0/portal/deleteportalimmediately`;

    await this.apiContext.delete(deleteUrl, {
      headers: { Authorization: `Bearer ${this.authToken}` },
      data: { reference: `${this.portalName}.onlyoffice.io` },
    });
  }
}

export default Apisystem;

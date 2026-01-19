import { APIRequestContext } from "@playwright/test";
import config from "../../config";
import Auth from "./auth";

class Apisystem {
  apiContext: APIRequestContext;
  portalDomain: string = "";
  adminUserId: string = "";
  portalName: string = "";
  authToken: string = "";

   private auth: Auth

  constructor(apiContext: APIRequestContext,  auth: Auth) {
    this.apiContext = apiContext;
    this.auth = auth;
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

  getOwnerAuthToken(): string {
    return this.auth.authTokenOwner;
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
    if (!this.auth.authTokenOwner) {
      throw new Error("Owner token is missing. Cannot delete portal.");
    }
 
    const deleteUrl = `https://${this.portalDomain}/api/2.0/portal/deleteportalimmediately`;

    const response = await this.apiContext.delete(deleteUrl, {
      headers: { Authorization: `Bearer ${this.auth.authTokenOwner}` },
      data: { reference: `${this.portalName}.onlyoffice.io` },
    });
    const body = await response.json();

    if (!response.ok()) {
    throw new Error(
      `Failed to delete portal: ${response.status()} - ${body.error || body.message}`,
    );
  }
  }
}

export default Apisystem;

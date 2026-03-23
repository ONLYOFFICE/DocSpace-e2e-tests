import { APIRequestContext } from "@playwright/test";
import config from "../../config";
import Auth from "./auth";

class Apisystem {
  apiContext: APIRequestContext;
  portalDomain: string = "";
  adminUserId: string = "";
  portalName: string = "";
  authToken: string = "";

  private auth: Auth;

  constructor(apiContext: APIRequestContext, auth: Auth) {
    this.apiContext = apiContext;
    this.auth = auth;
  }

  get isLocal(): boolean {
    return !!config.LOCAL_PORTAL_DOMAIN;
  }

  get portalBaseUrl(): string {
    const scheme = this.isLocal ? "http" : "https";
    return `${scheme}://${this.portalDomain}`;
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

    const registerUrl = this.isLocal
      ? `http://${config.LOCAL_PORTAL_DOMAIN}/apisystem/portal/register`
      : `${config.PORTAL_REGISTRATION_URL}/register`;

    const response = await this.apiContext.post(registerUrl, {
      data: {
        portalName: this.portalName,
        firstName: "admin-zero",
        lastName: "admin-zero",
        email: config.DOCSPACE_OWNER_EMAIL,
        password: config.DOCSPACE_OWNER_PASSWORD,
        language: "en",
      },
      headers: {
        Origin: `http://${this.portalName}`,
      },
      timeout: 60000,
    });

    const body = await response.json();

    if (!response.ok()) {
      throw new Error(
        `Failed to create portal: ${response.status()} - ${body.error || body.message}`,
      );
    }

    this.portalDomain = this.isLocal
      ? config.LOCAL_PORTAL_DOMAIN
      : body.tenant.domain;
    this.adminUserId = body.tenant.ownerId;

    return body;
  }

  async deletePortal() {
    if (!this.auth.authTokenOwner) {
      throw new Error("Owner token is missing. Cannot delete portal.");
    }

    const deleteUrl = `${this.portalBaseUrl}/api/2.0/portal/deleteportalimmediately`;

    console.log(`[deletePortal] sending DELETE for ${this.portalDomain}`);

    const response = await this.apiContext.delete(deleteUrl, {
      headers: {
        Authorization: `Bearer ${this.auth.authTokenOwner}`,
        Origin: `http://${this.portalName}`,
      },
      data: { reference: `${this.portalName}.onlyoffice.io` },
      timeout: 90000,
    });
    console.log(
      `[deletePortal] got response ${response.status()} for ${this.portalDomain}`,
    );

    if (!response.ok()) {
      throw new Error(
        `Failed to delete portal ${this.portalDomain}: ${response.status()}`,
      );
    }
  }
}

export default Apisystem;

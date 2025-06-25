import { APIRequestContext } from "@playwright/test";

import config from "@/config";

import Apisystem from "./apisystem";
import Auth from "./auth";
import People from "./people";
import File from "./file";

class API {
  apiRequestContext: APIRequestContext;

  portalDomain: string = "";
  adminUserId: string = "";

  apisystem: Apisystem;
  auth: Auth;
  people: People;
  file: File;

  constructor(apiRequestContext: APIRequestContext) {
    this.apiRequestContext = apiRequestContext;
    this.apisystem = new Apisystem(apiRequestContext);
    this.auth = new Auth(apiRequestContext, "");
    this.people = new People(apiRequestContext);
    this.file = new File(apiRequestContext);
  }

  async setup() {
    const portal = await this.apisystem.createPortal("integration-test-portal");

    this.portalDomain = config.DOCSPACE_LOCAL
      ? `http://${portal.tenant.domain}`
      : `https://${portal.tenant.domain}`;
    this.adminUserId = portal.tenant.ownerId;

    this.auth.setPortalDomain(this.portalDomain);

    const authToken = await this.auth.authenticate();

    this.apisystem.setAuthToken(authToken);
    this.people.setAuthToken(authToken);
    this.people.setPortalDomain(this.portalDomain);

    if (!this.adminUserId) {
      const self = await this.people.self();

      this.adminUserId = self.id;
    }

    this.people.setAdminUserId(this.adminUserId);

    this.file.setAuthToken(authToken);
    this.file.setPortalDomain(this.portalDomain);

    await this.people.activateAdminUser();
  }

  async cleanup() {
    await this.apisystem.deletePortal();
  }
}

export default API;

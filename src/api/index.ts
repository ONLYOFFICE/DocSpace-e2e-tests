import { APIRequestContext } from "@playwright/test";

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

    this.portalDomain = portal.tenant.domain;
    this.adminUserId = portal.tenant.ownerId;

    this.auth.setPortalDomain(portal.tenant.domain);

    const authToken = await this.auth.authenticateOwner();

    this.apisystem.setAuthToken(authToken);
    this.people.setAuthToken(authToken);
    this.people.setPortalDomain(portal.tenant.domain);
    this.people.setAdminUserId(portal.tenant.ownerId);

    this.file.setAuthToken(authToken);
    this.file.setPortalDomain(portal.tenant.domain);

    // await this.people.activateAdminUser();
  }

  async cleanup() {
    await this.apisystem.deletePortal();
  }
}

export default API;

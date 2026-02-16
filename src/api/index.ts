import { APIRequestContext } from "@playwright/test";

import Apisystem from "./apisystem";
import Auth from "./auth";
import People from "./people";
import File from "./file";
import { TokenStore } from "../services/token-store";

class API {
  ownerContext: APIRequestContext;
  userContext: APIRequestContext;

  portalDomain: string = "";
  adminUserId: string = "";

  tokenStore: TokenStore;
  apisystem: Apisystem;
  auth: Auth;
  people: People;
  file: File;

  get apiContext(): APIRequestContext {
    return this.ownerContext;
  }

  get apiRequestContext(): APIRequestContext {
    return this.ownerContext;
  }

  constructor(ownerContext: APIRequestContext, userContext: APIRequestContext) {
    this.ownerContext = ownerContext;
    this.userContext = userContext;

    this.tokenStore = new TokenStore();
    this.auth = new Auth(ownerContext, this.tokenStore);
    this.apisystem = new Apisystem(ownerContext, this.auth);
    this.people = new People(userContext);
    this.file = new File(userContext);
  }

  async setup() {
    const portal = await this.apisystem.createPortal("integration-test-portal");

    this.portalDomain = portal.tenant.domain;
    this.adminUserId = portal.tenant.ownerId;

    this.tokenStore.portalDomain = this.portalDomain;
    const ownerToken = await this.auth.authenticateOwner();

    this.people.setPortalDomain(this.portalDomain);
    this.people.setAdminUserId(this.adminUserId);
    this.people.setAuthToken(ownerToken);

    this.file.setPortalDomain(this.portalDomain);
    this.file.setAuthToken(ownerToken);
  }

  async cleanup() {
    await this.apisystem.deletePortal();
  }
}

export default API;

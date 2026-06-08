import { APIRequestContext } from "@playwright/test";

import config from "../../config";
import Apisystem from "./apisystem";
import Auth from "./auth";
import { TokenStore } from "../services/token-store";

class API {
  ownerContext: APIRequestContext;

  portalDomain: string = "";
  adminUserId: string = "";

  tokenStore: TokenStore;
  apisystem: Apisystem;
  auth: Auth;

  get apiContext(): APIRequestContext {
    return this.ownerContext;
  }

  get apiRequestContext(): APIRequestContext {
    return this.ownerContext;
  }

  constructor(ownerContext: APIRequestContext) {
    this.ownerContext = ownerContext;

    this.tokenStore = new TokenStore();
    this.auth = new Auth(ownerContext, this.tokenStore);
    this.apisystem = new Apisystem(ownerContext, this.auth);
  }

  get isLocal(): boolean {
    return !!config.LOCAL_PORTAL_DOMAIN;
  }

  async setup() {
    if (config.REUSED_PORTAL_URL) {
      // Reuse an existing portal
      this.portalDomain = config.REUSED_PORTAL_URL;

      this.tokenStore.portalDomain = this.portalDomain;
      this.tokenStore.newTenantDomain = this.portalDomain;
      this.apisystem.setPortalDomain(this.portalDomain);
      await this.auth.authenticateOwner();
      return;
    }

    const portal = await this.apisystem.createPortal("integration-test-portal");

    this.portalDomain = config.LOCAL_PORTAL_DOMAIN || portal.tenant.domain;
    this.adminUserId = portal.tenant.ownerId;

    this.tokenStore.portalDomain = this.portalDomain;
    this.tokenStore.newTenantDomain = this.apisystem.portalName;
    this.tokenStore.isLocal = this.isLocal;
    await this.auth.authenticateOwner();
  }

  async cleanup() {
    if (config.REUSED_PORTAL_URL) {
      // Never delete a reused portal
      return;
    }
    await this.apisystem.deletePortal();
  }
}

export default API;

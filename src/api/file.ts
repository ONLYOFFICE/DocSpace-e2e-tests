import { APIRequestContext } from "@playwright/test";

class File {
  apiContext: APIRequestContext;

  portalDomain: string = "";

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
}

export default File;

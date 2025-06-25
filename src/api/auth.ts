import { APIRequestContext } from "@playwright/test";

import config from "../../config";

class Auth {
  apiRequestContext: APIRequestContext;

  authToken: string = "";

  portalDomain: string;

  constructor(apiRequestContext: APIRequestContext, portalDomain: string) {
    this.apiRequestContext = apiRequestContext;

    this.portalDomain = portalDomain;
  }

  setPortalDomain(portalDomain: string) {
    this.portalDomain = portalDomain;
  }

  async authenticate() {
    const userName = config.DOCSPACE_ADMIN_EMAIL;
    const password = config.DOCSPACE_ADMIN_PASSWORD;

    const authResponse = await this.apiRequestContext.post(
      `${this.portalDomain}/api/2.0/authentication`,
      {
        data: { userName, password },
      },
    );

    const authBody = await authResponse.json();

    if (!authResponse.ok()) {
      throw new Error(
        `Authentication failed: ${authResponse.status()} - ${authBody.error || authBody.message}`,
      );
    }

    this.authToken = authBody.response.token;

    return this.authToken;
  }
}

export default Auth;

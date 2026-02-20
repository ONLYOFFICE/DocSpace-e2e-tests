import { APIRequestContext } from "@playwright/test";
import config from "../../config";
import { TokenStore, Role } from "../services/token-store";

class Auth {
  apiRequestContext: APIRequestContext;
  private tokenStore: TokenStore;

  constructor(apiRequestContext: APIRequestContext, tokenStore: TokenStore) {
    this.apiRequestContext = apiRequestContext;
    this.tokenStore = tokenStore;
  }

  get authTokenOwner(): string {
    return this.tokenStore.getToken("owner");
  }

  get portalDomain(): string {
    return this.tokenStore.portalDomain;
  }

  async authenticateOwner() {
    const userName = config.DOCSPACE_OWNER_EMAIL;
    const password = config.DOCSPACE_OWNER_PASSWORD;

    const authResponse = await this.apiRequestContext.post(
      `https://${this.portalDomain}/api/2.0/authentication`,
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

    this.tokenStore.setToken("owner", authBody.response.token);

    return this.authTokenOwner;
  }

  async authenticateDocSpaceAdmin() {
    return this.authenticateRole("docSpaceAdmin");
  }

  async authenticateRoomAdmin() {
    return this.authenticateRole("roomAdmin");
  }

  async authenticateUser() {
    return this.authenticateRole("user");
  }

  async authenticateGuest() {
    return this.authenticateRole("guest");
  }

  private async authenticateRole(role: Role) {
    const { email, password } = this.tokenStore.getCredentials(role);

    const authResponse = await this.apiRequestContext.post(
      `https://${this.portalDomain}/api/2.0/authentication`,
      {
        data: { userName: email, password },
      },
    );

    const authBody = await authResponse.json();

    if (!authResponse.ok()) {
      throw new Error(
        `Authentication failed: ${authResponse.status()} - ${authBody.error || authBody.message}`,
      );
    }

    this.tokenStore.setToken(role, authBody.response.token);

    return this.tokenStore.getToken(role);
  }
}

export default Auth;

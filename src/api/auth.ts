import { APIRequestContext } from "@playwright/test";
import config from "../../config";
import { TokenStore, Role } from "../services/token-store";
import { generateTotpCode } from "../utils/helpers/totp";

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
      `${this.tokenStore.portalBaseUrl}/api/2.0/authentication`,
      {
        data: { userName, password },
        headers: {
          Origin: `http://${this.tokenStore.newTenantDomain}`,
        },
        timeout: 60000,
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
      `${this.tokenStore.portalBaseUrl}/api/2.0/authentication`,
      {
        data: { userName: email, password },
        headers: {
          Origin: `http://${this.tokenStore.newTenantDomain}`,
        },
        timeout: 60000,
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

  /**
   * Turns portal TFA off so the fixture's password login can delete the portal.
   * Enabling TFA invalidates the owner's API token, so on 401 the owner logs in
   * again: with a TOTP code from the secret saved at activation, or - when the
   * owner has no app linked (e.g. after "Reset app") - with the secret the
   * password login returns. Throws if TFA could not be turned off.
   */
  async disableOwnerTfa(ownerTfaSecret?: string) {
    if (await this.setTfaNone()) return;

    const login = await this.ownerLoginRequest("/api/2.0/authentication");
    const loginBody = (await login.json()).response ?? {};

    if (loginBody.token) {
      this.tokenStore.setToken("owner", loginBody.token);
    } else {
      const secret: string | undefined = loginBody.tfaKey ?? ownerTfaSecret;
      if (!secret) {
        throw new Error(
          "disableOwnerTfa: TFA is on and the owner TFA secret is unknown",
        );
      }
      await this.authenticateOwnerWithTotp(secret);
    }

    if (!(await this.setTfaNone())) {
      throw new Error("disableOwnerTfa: TFA is still on after owner re-login");
    }
  }

  private async authenticateOwnerWithTotp(secret: string) {
    // A code already used by the test within the current 30s window can be
    // rejected, so the second attempt waits for the next window
    for (let attempt = 1; attempt <= 2; attempt++) {
      const code = generateTotpCode(secret);
      const response = await this.ownerLoginRequest(
        `/api/2.0/authentication/${code}`,
        code,
      );
      const token = response.ok()
        ? (await response.json()).response?.token
        : null;
      if (token) {
        this.tokenStore.setToken("owner", token);
        return;
      }
      if (attempt === 1) {
        const msToNextWindow = 30000 - (Date.now() % 30000) + 1000;
        await new Promise((resolve) => setTimeout(resolve, msToNextWindow));
      } else {
        throw new Error(
          `authenticateOwnerWithTotp: TFA login failed with ${response.status()}`,
        );
      }
    }
  }

  private ownerLoginRequest(path: string, code?: string) {
    return this.apiRequestContext.post(
      `${this.tokenStore.portalBaseUrl}${path}`,
      {
        data: {
          userName: config.DOCSPACE_OWNER_EMAIL,
          password: config.DOCSPACE_OWNER_PASSWORD,
          ...(code && { code }),
        },
        headers: { Origin: `http://${this.tokenStore.newTenantDomain}` },
        timeout: 60000,
      },
    );
  }

  private async setTfaNone(): Promise<boolean> {
    const response = await this.apiRequestContext.put(
      `${this.tokenStore.portalBaseUrl}/api/2.0/settings/tfaapp`,
      {
        headers: { Authorization: `Bearer ${this.authTokenOwner}` },
        data: { type: "none" },
        timeout: 60000,
      },
    );
    return response.ok();
  }
}

export default Auth;

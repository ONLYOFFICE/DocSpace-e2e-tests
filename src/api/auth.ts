import { APIRequestContext } from "@playwright/test";
import config from "../../config";
import { ProfilesApi } from "../services/people/profilesApi.services";

class Auth {
  apiRequestContext: APIRequestContext;
  authTokenOwner: string = "";
  authTokenDocSpaceAdmin: string = "";
  authTokenRoomAdmin: string = "";
  authTokenUser: string = "";
  portalDomain: string;

  private profilesApi?: ProfilesApi;

  constructor(
    apiRequestContext: APIRequestContext,
    portalDomain: string,
    profilesApi?: ProfilesApi,
  ) {
    this.apiRequestContext = apiRequestContext;
    this.portalDomain = portalDomain;
    this.profilesApi = profilesApi;
  }

  setPortalDomain(portalDomain: string) {
    this.portalDomain = portalDomain;
  }

  setProfilesApi(profilesApi: ProfilesApi) {
    this.profilesApi = profilesApi;
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

    this.authTokenOwner = authBody.response.token;

    return this.authTokenOwner;
  }

  async authenticateDocSpaceAdmin() {
    if (!this.profilesApi) {
      throw new Error(
        "ProfilesApi is not provided to Auth; cannot authenticate DocSpace admin",
      );
    }

    const email = this.profilesApi.getDocSpaceAdminEmail();
    const password = this.profilesApi.getDocSpaceAdminPassword();

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

    this.authTokenDocSpaceAdmin = authBody.response.token;

    this.profilesApi.setAuthTokenDocSpaceAdmin(this.authTokenDocSpaceAdmin);

    return this.authTokenDocSpaceAdmin;
  }

  async authenticateRoomAdmin() {
    if (!this.profilesApi) {
      throw new Error(
        "ProfilesApi is not provided to Auth; cannot authenticate Room admin",
      );
    }

    const email = this.profilesApi.getRoomAdminEmail();
    const password = this.profilesApi.getRoomAdminPassword();

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

    this.authTokenRoomAdmin = authBody.response.token;

    this.profilesApi.setAuthTokenRoomAdmin(this.authTokenRoomAdmin);

    return this.authTokenRoomAdmin;
  }

  async authenticateUser() {
    if (!this.profilesApi) {
      throw new Error(
        "ProfilesApi is not provided to Auth; cannot authenticate User",
      );
    }

    const email = this.profilesApi.getUserEmail();
    const password = this.profilesApi.getUserPassword();

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

    this.authTokenUser = authBody.response.token;

    this.profilesApi.setAuthTokenUser(this.authTokenUser);

    return this.authTokenUser;
  }
}

export default Auth;

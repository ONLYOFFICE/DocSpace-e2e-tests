import { APIRequestContext } from "@playwright/test";
import config from "../../config";
import { ProfilesApi, UserStatusApi } from "../services/index";

class Auth {
  apiRequestContext: APIRequestContext;
  authTokenOwner: string = "";
  authTokenDocSpaceAdmin: string = "";
  authTokenRoomAdmin: string = "";
  authTokenUser: string = "";
  portalDomain: string;

  private profilesApi?: ProfilesApi;
  private userStatusApi?: UserStatusApi;

  constructor(
    apiRequestContext: APIRequestContext,
    portalDomain: string,
    profilesApi?: ProfilesApi,
    userStatusApi?: UserStatusApi,
  ) {
    this.apiRequestContext = apiRequestContext;
    this.portalDomain = portalDomain;
    this.profilesApi = profilesApi;
    this.userStatusApi = userStatusApi;
  }

  setPortalDomain(portalDomain: string) {
    this.portalDomain = portalDomain;
  }

  setProfilesApi(profilesApi: ProfilesApi) {
    this.profilesApi = profilesApi;
  }

  setUserStatusApi(api: UserStatusApi) {
    this.userStatusApi = api;
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

  async authenticateDocSpaceAdmin(email?: string, password?: string) {
    if (!email || !password) {
      if (!this.profilesApi || !this.userStatusApi) {
        throw new Error(
          "ProfilesApi or UserStatusApi is not provided to Auth; cannot authenticate DocSpace admin",
        );
      }
    }

    const userEmail = email ?? this.profilesApi!.getDocSpaceAdminEmail();
    const userPassword =
      password ?? this.profilesApi!.getDocSpaceAdminPassword();

    const authResponse = await this.apiRequestContext.post(
      `https://${this.portalDomain}/api/2.0/authentication`,
      { data: { userName: userEmail, password: userPassword } },
    );

    const authBody = await authResponse.json();

    if (!authResponse.ok()) {
      throw new Error(
        `Authentication failed: ${authResponse.status()} - ${JSON.stringify(authBody)}`,
      );
    }

    this.authTokenDocSpaceAdmin = authBody.response.token;

    if (this.profilesApi) {
      this.profilesApi.setAuthTokenDocSpaceAdmin(this.authTokenDocSpaceAdmin);
    }

    if (this.userStatusApi) {
      this.userStatusApi.setAuthTokenDocSpaceAdmin(this.authTokenDocSpaceAdmin);
    }

    return this.authTokenDocSpaceAdmin;
  }

  async authenticateRoomAdmin() {
    if (!this.profilesApi || !this.userStatusApi) {
      throw new Error(
        "ProfilesApi or UserStatusApi is not provided to Auth; cannot authenticate Room admin",
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
    this.userStatusApi.setAuthTokenRoomAdmin(this.authTokenRoomAdmin);

    return this.authTokenRoomAdmin;
  }

  async authenticateUser() {
    if (!this.profilesApi || !this.userStatusApi) {
      throw new Error(
        "ProfilesApi or UserStatusApi is not provided to Auth; cannot authenticate User",
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
    this.userStatusApi.setAuthTokenUser(this.authTokenUser);

    return this.authTokenUser;
  }
}

export default Auth;

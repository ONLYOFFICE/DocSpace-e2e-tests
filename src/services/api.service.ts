import { ProfilesApi, FAKER, UserStatusApi } from "./index";
import { APIRequestContext } from "@playwright/test";

export class ApiSDK {
  private request: APIRequestContext;
  readonly profiles: ProfilesApi;
  readonly userStatus: UserStatusApi;
  readonly faker: FAKER;

  constructor(
    request: APIRequestContext,
    authToken: string,
    authTokenDocSpaceAdmin: string,
    portalDomain: string,
  ) {
    this.request = request;
    this.profiles = new ProfilesApi(
      request,
      authToken,
      authTokenDocSpaceAdmin,
      portalDomain,
    );
    this.userStatus = new UserStatusApi(
      request,
      authToken,
      authTokenDocSpaceAdmin,
      portalDomain,
    );
    this.faker = new FAKER();
  }
}

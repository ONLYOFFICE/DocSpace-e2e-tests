import { AUTH, ProfilesApi, FAKER } from "./index";
import { APIRequestContext } from "@playwright/test";

export class ApiSDK {
  private request: APIRequestContext;
  readonly auth: AUTH;
  readonly profiles: ProfilesApi;
  readonly faker: FAKER;

  constructor(
    request: APIRequestContext,
    authToken: string,
    authTokenDocSpaceAdmin: string,
    portalDomain: string,
  ) {
    this.request = request;
    this.auth = new AUTH(request);
    this.profiles = new ProfilesApi(
      request,
      authToken,
      authTokenDocSpaceAdmin,
      portalDomain,
    );
    this.faker = new FAKER(request);
  }
}

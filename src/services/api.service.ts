import {
  ProfilesApi,
  FAKER,
  UserStatusApi,
  RoomsApi,
  HtmlNormalizer,
} from "./index";
import { APIRequestContext } from "@playwright/test";

export class ApiSDK {
  private request: APIRequestContext;
  readonly profiles: ProfilesApi;
  readonly userStatus: UserStatusApi;
  readonly rooms: RoomsApi;
  readonly faker: FAKER;
  readonly htmlNormalizer: HtmlNormalizer;
  private authApi?: any;

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
    this.rooms = new RoomsApi(
      request,
      authToken,
      authTokenDocSpaceAdmin,
      portalDomain,
    );
    this.faker = new FAKER();
    this.htmlNormalizer = new HtmlNormalizer();
  }

  public updateDocSpaceAdminToken(token: string) {
    this.profiles.setAuthTokenDocSpaceAdmin(token);
    this.userStatus.setAuthTokenDocSpaceAdmin(token);
    this.rooms.setAuthTokenDocSpaceAdmin(token);
  }
}

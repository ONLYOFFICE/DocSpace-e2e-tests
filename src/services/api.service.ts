import { ProfilesApi, FAKER, UserStatusApi, RoomsApi, FilesApi } from "./index";
import { APIRequestContext } from "@playwright/test";

export class ApiSDK {
  private request: APIRequestContext;
  readonly profiles: ProfilesApi;
  readonly userStatus: UserStatusApi;
  readonly rooms: RoomsApi;
  readonly files: FilesApi;
  readonly faker: FAKER;
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
    this.files = new FilesApi(
      request,
      authToken,
      authTokenDocSpaceAdmin,
      portalDomain,
    );
    this.faker = new FAKER();
  }

  public updateDocSpaceAdminToken(token: string) {
    this.profiles.setAuthTokenDocSpaceAdmin(token);
    this.userStatus.setAuthTokenDocSpaceAdmin(token);
    this.rooms.setAuthTokenDocSpaceAdmin(token);
    this.files.setAuthTokenDocSpaceAdmin(token);
  }
}

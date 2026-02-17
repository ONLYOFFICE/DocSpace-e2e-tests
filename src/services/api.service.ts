import {
  ProfilesApi,
  FAKER,
  UserStatusApi,
  RoomsApi,
  FilesApi,
  PasswordApi,
} from "./index";
import { TokenStore } from "./token-store";
import { APIRequestContext } from "@playwright/test";

export class ApiSDK {
  readonly profiles: ProfilesApi;
  readonly userStatus: UserStatusApi;
  readonly rooms: RoomsApi;
  readonly password: PasswordApi;
  readonly files: FilesApi;
  readonly faker: FAKER;

  constructor(request: APIRequestContext, tokenStore: TokenStore) {
    this.profiles = new ProfilesApi(request, tokenStore);
    this.password = new PasswordApi(request, tokenStore);
    this.userStatus = new UserStatusApi(request, tokenStore);
    this.rooms = new RoomsApi(request, tokenStore);
    this.files = new FilesApi(request, tokenStore);
    this.faker = new FAKER();
  }
}

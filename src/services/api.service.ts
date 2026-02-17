import {
  ProfilesApi,
  FAKER,
  UserStatusApi,
  RoomsApi,
  PasswordApi,
} from "./index";
import { TokenStore } from "./token-store";
import { APIRequestContext } from "@playwright/test";

export class ApiSDK {
  readonly profiles: ProfilesApi;
  readonly userStatus: UserStatusApi;
  readonly rooms: RoomsApi;
  readonly password: PasswordApi;
  readonly faker: FAKER;

  constructor(request: APIRequestContext, tokenStore: TokenStore) {
    this.profiles = new ProfilesApi(request, tokenStore);
    this.password = new PasswordApi(request, tokenStore);
    this.userStatus = new UserStatusApi(request, tokenStore);
    this.rooms = new RoomsApi(request, tokenStore);
    this.faker = new FAKER();
  }
}

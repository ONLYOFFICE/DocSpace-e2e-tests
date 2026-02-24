import {
  ProfilesApi,
  FAKER,
  UserStatusApi,
  RoomsApi,
  FilesApi,
  PasswordApi,
  SettingsApi,
  PeopleQuotaApi,
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
  readonly settings: SettingsApi;
  readonly peopleQuota: PeopleQuotaApi;

  constructor(request: APIRequestContext, tokenStore: TokenStore) {
    this.profiles = new ProfilesApi(request, tokenStore);
    this.password = new PasswordApi(request, tokenStore);
    this.userStatus = new UserStatusApi(request, tokenStore);
    this.rooms = new RoomsApi(request, tokenStore);
    this.files = new FilesApi(request, tokenStore);
    this.faker = new FAKER();
    this.settings = new SettingsApi(request, tokenStore);
    this.peopleQuota = new PeopleQuotaApi(request, tokenStore);
  }
}

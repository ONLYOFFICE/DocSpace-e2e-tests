import { AUTH, ProfilesApi, FAKER } from './index';
import { APIRequestContext  } from '@playwright/test';

export class ApiSDK {
    private request: APIRequestContext;
    readonly  auth: AUTH;
    readonly profiles: ProfilesApi;
    readonly faker: FAKER;
    
    constructor(request: APIRequestContext) {
    this.request = request;
    this.auth = new AUTH(request);
    this.profiles = new ProfilesApi(request);
    this.faker = new FAKER(request);
    
  }
}

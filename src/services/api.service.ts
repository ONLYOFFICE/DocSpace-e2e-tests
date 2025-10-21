import { AUTH, ProfilesApi } from './index';
import { APIRequestContext  } from '@playwright/test';

export class ApiSDK {
    private request: APIRequestContext;
    readonly  auth: AUTH;
    readonly profiles: ProfilesApi;
    
    constructor(request: APIRequestContext) {
    this.request = request;
    this.auth = new AUTH(request);
    this.profiles = new ProfilesApi(request);
    
  }


}

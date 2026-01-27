import { test, APIRequestContext } from "@playwright/test";

export enum UserStatus {
  Active = 1,
  Disabled = 2,
}

export class UserStatusApi {
  private request: APIRequestContext;
  private authTokenOwner: string = "";
  private authTokenDocSpaceAdmin: string = "";
  private authTokenRoomAdmin: string = "";
  private authTokenUser: string = "";
  private portalDomain: string = "";
  private docSpaceAdminEmail: string = "";
  private docSpaceAdminPassword: string = "";
  private roomAdminEmail: string = "";
  private roomAdminPassword: string = "";
  private userEmail: string = "";
  private userPassword: string = "";

  constructor(
    request: APIRequestContext,
    authToken: string,
    authTokenDocSpaceAdmin: string,
    portalDomain: string,
  ) {
    this.request = request;
    this.authTokenOwner = authToken;
    this.authTokenDocSpaceAdmin = authTokenDocSpaceAdmin;
    this.portalDomain = portalDomain;
  }

  async changeUserStatus(
    status: UserStatus,
    data: {
      userIds: string[];
      resendAll: boolean;
    },
  ) {
    return test.step("Change user status", async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/status/${status}`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data,
        },
      );
      return response;
    });
  }
}

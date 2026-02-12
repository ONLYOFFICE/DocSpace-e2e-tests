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

  public getDocSpaceAdminEmail(): string {
    return this.docSpaceAdminEmail;
  }

  public getDocSpaceAdminPassword(): string {
    return this.docSpaceAdminPassword;
  }

  public setAuthTokenDocSpaceAdmin(token: string) {
    this.authTokenDocSpaceAdmin = token;
  }

  public getRoomAdminEmail(): string {
    return this.roomAdminEmail;
  }

  public getRoomAdminPassword(): string {
    return this.roomAdminPassword;
  }

  public setAuthTokenRoomAdmin(token: string) {
    this.authTokenRoomAdmin = token;
  }

  public getUserEmail(): string {
    return this.userEmail;
  }

  public getUserPassword(): string {
    return this.userPassword;
  }

  public setAuthTokenUser(token: string) {
    this.authTokenUser = token;
  }

  private getToken(role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user") {
    const tokens = {
      owner: this.authTokenOwner,
      docSpaceAdmin: this.authTokenDocSpaceAdmin,
      roomAdmin: this.authTokenRoomAdmin,
      user: this.authTokenUser,
    };
    return tokens[role];
  }

  async changeUserStatus(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    status: UserStatus,
    data: {
      userIds: string[];
      resendAll: boolean;
    },
  ) {
    return test.step("Owner change user status", async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/status/${status}`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data,
        },
      );
      return response;
    });
  }

  async changeUserStatusWithoutAuthorization(
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
          data,
        },
      );
      return response;
    });
  }

  async ownerGetPlofilesByStatus(status: UserStatus) {
    return test.step("Owner returns a list of profiles filtered by the user status", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/status/${status}`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
        },
      );
      return response;
    });
  }
}

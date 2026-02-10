import { test, expect, APIRequestContext } from "@playwright/test";

export class RoomsApi {
  private request: APIRequestContext;
  private authTokenOwner: string = "";
  private authTokenDocSpaceAdmin: string = "";
  private authTokenRoomAdmin: string = "";
  private authTokenUser: string = "";
  private portalDomain: string = "";

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

  public setAuthTokenDocSpaceAdmin(token: string) {
    this.authTokenDocSpaceAdmin = token;
  }

  public setAuthTokenRoomAdmin(token: string) {
    this.authTokenRoomAdmin = token;
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

  async createRoom(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    data: { title: string; roomType: string },
  ) {
    return test.step(`${role} create room`, async () => {
      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/files/rooms`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data,
        },
      );
      return response;
    });
  }

  async createRoomTemplate(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    data: { roomId: number; title: string },
  ) {
    return test.step(`${role} create room template`, async () => {
      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/files/roomtemplate`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data,
        },
      );
      return response;
    });
  }

  async getRoomTemplateStatus(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
  ) {
    return test.step(`${role} get room template status`, async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/files/roomtemplate/status`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );
      return response;
    });
  }

  async waitForRoomTemplateReady(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
  ) {
    return test.step(`${role} wait for room template ready`, async () => {
      let templateId: number = -1;

      await expect(async () => {
        const response = await this.request.get(
          `https://${this.portalDomain}/api/2.0/files/roomtemplate/status`,
          {
            headers: { Authorization: `Bearer ${this.getToken(role)}` },
          },
        );
        const body = await response.json();
        expect(body.response.isCompleted).toBe(true);
        templateId = body.response.templateId;
      }).toPass({
        intervals: [1_000, 2_000, 5_000],
        timeout: 30_000,
      });

      return templateId;
    });
  }

  async createRoomTemplateAndWait(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    data: { roomId: number; title: string },
  ) {
    return test.step(`${role} create room template and wait`, async () => {
      await this.createRoomTemplate(role, data);
      return await this.waitForRoomTemplateReady(role);
    });
  }

  async getRoomTemplatePublic(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    templateId: number,
  ) {
    return test.step(`${role} get room template public`, async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/files/roomtemplate/${templateId}/public`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );
      return response;
    });
  }

  async setRoomTemplatePublic(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    data: { id: number; public: boolean },
  ) {
    return test.step(`${role} set room template public`, async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/files/roomtemplate/public`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data,
        },
      );
      return response;
    });
  }
}

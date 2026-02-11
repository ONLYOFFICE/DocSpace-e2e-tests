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

  async createAllRoomTypes(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
  ) {
    const configs = [
      { title: "Autotest Custom", roomType: "CustomRoom" },
      { title: "Autotest Collaboration", roomType: "EditingRoom" },
      { title: "Autotest FormFilling", roomType: "FillingFormsRoom" },
      { title: "Autotest Public", roomType: "PublicRoom" },
      { title: "Autotest VDR", roomType: "VirtualDataRoom" },
    ];

    const rooms: { id: number; title: string; roomType: number }[] = [];

    for (const cfg of configs) {
      const response = await this.createRoom(role, cfg);
      const body = await response.json();
      rooms.push({
        id: body.response.id,
        title: body.response.title,
        roomType: body.response.roomType,
      });
    }

    return rooms;
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

  async archiveRoom(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    roomId: number,
  ) {
    return test.step(`${role} archive room ${roomId}`, async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/files/rooms/${roomId}/archive`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: { deleteAfter: false },
        },
      );
      const operation = await this.waitForOperation(role);
      return { response, ...operation };
    });
  }

  async unarchiveRoom(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    roomId: number,
  ) {
    return test.step(`${role} unarchive room ${roomId}`, async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/files/rooms/${roomId}/unarchive`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: { deleteAfter: false },
        },
      );
      const operation = await this.waitForOperation(role);
      return { response, ...operation };
    });
  }

  async deleteRoom(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    roomId: number,
  ) {
    return test.step(`${role} delete room ${roomId}`, async () => {
      const response = await this.request.delete(
        `https://${this.portalDomain}/api/2.0/files/rooms/${roomId}`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: { deleteAfter: false },
        },
      );
      return response;
    });
  }

  // Archive/unarchive/delete are async — PUT/DELETE starts the operation, GET /fileops polls until finished
  private async waitForOperation(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
  ) {
    let result: {
      id: string;
      finished: boolean;
      error: string;
      progress: number;
      folders: { id: number; title: string }[];
    } = { id: "", finished: false, error: "", progress: 0, folders: [] };

    await expect(async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/files/fileops`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );
      const body = await response.json();
      const ops = body.response;
      const op = ops[ops.length - 1];
      expect(op.finished).toBe(true);
      result = op;
    }).toPass({
      intervals: [1_000, 2_000, 5_000],
      timeout: 30_000,
    });

    return result;
  }

  async pinRoom(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    roomId: number,
  ) {
    return test.step(`${role} pin room ${roomId}`, async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/files/rooms/${roomId}/pin`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );
      return response;
    });
  }

  async unpinRoom(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    roomId: number,
  ) {
    return test.step(`${role} unpin room ${roomId}`, async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/files/rooms/${roomId}/unpin`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
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

  async getRooms(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    params?: Record<string, string | number | boolean>,
  ) {
    return test.step(`${role} get rooms`, async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/files/rooms`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          params,
        },
      );
      return response;
    });
  }

  async getRoomInfo(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    roomId: number,
  ) {
    return test.step(`${role} get room info ${roomId}`, async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/files/rooms/${roomId}`,
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

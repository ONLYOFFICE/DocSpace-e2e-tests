import { test, expect, APIRequestContext } from "@playwright/test";
import { TokenStore, Role } from "../token-store";

export class RoomsApi {
  private request: APIRequestContext;
  private tokenStore: TokenStore;

  constructor(request: APIRequestContext, tokenStore: TokenStore) {
    this.request = request;
    this.tokenStore = tokenStore;
  }

  private getToken(role: Role) {
    return this.tokenStore.getToken(role);
  }

  private get portalDomain() {
    return this.tokenStore.portalDomain;
  }

  async createRoom(role: Role, data: { title: string; roomType: string }) {
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

  async createAllRoomTypes(role: Role) {
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
    role: Role,
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

  async archiveRoom(role: Role, roomId: number) {
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

  async unarchiveRoom(role: Role, roomId: number) {
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

  async deleteRoom(role: Role, roomId: number) {
    return test.step(`${role} delete room ${roomId}`, async () => {
      const response = await this.request.delete(
        `https://${this.portalDomain}/api/2.0/files/rooms/${roomId}`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: { deleteAfter: false },
        },
      );
      const operation = await this.waitForOperation(role);
      return { response, ...operation };
    });
  }

  // Archive/unarchive/delete are async — PUT/DELETE starts the operation, GET /fileops polls until finished
  private async waitForOperation(role: Role) {
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

  async pinRoom(role: Role, roomId: number) {
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

  async unpinRoom(role: Role, roomId: number) {
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

  async getRoomTemplateStatus(role: Role) {
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

  async waitForRoomTemplateReady(role: Role) {
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
    role: Role,
    data: { roomId: number; title: string },
  ) {
    return test.step(`${role} create room template and wait`, async () => {
      await this.createRoomTemplate(role, data);
      return await this.waitForRoomTemplateReady(role);
    });
  }

  async getRoomTemplatePublic(role: Role, templateId: number) {
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
    role: Role,
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

  async getRoomInfo(role: Role, roomId: number) {
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
    role: Role,
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

  async changeOwner(role: Role, roomId: number, userId: string) {
    return test.step(`${role} change owner of room ${roomId}`, async () => {
      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/files/owner`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: { folderIds: [roomId], userId },
        },
      );
      return response;
    });
  }

  async setRoomAccessRights(
    role: Role,
    roomId: number,
    data: {
      invitations: { id: string; access: string }[];
      notify?: boolean;
      message?: string;
    },
  ) {
    return test.step(`${role} set room access rights ${roomId}`, async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/files/rooms/${roomId}/share`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data,
        },
      );
      return response;
    });
  }

  async getRoomAccessRights(role: Role, roomId: number) {
    return test.step(`${role} get room access rights ${roomId}`, async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/files/rooms/${roomId}/share`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );
      return response;
    });
  }

  async addRoomTags(role: Role, roomId: number, tags: string[]) {
    return test.step(`${role} add tags to room ${roomId}`, async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/files/rooms/${roomId}/tags`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: { names: tags },
        },
      );
      return response;
    });
  }

  async removeRoomTags(role: Role, roomId: number, tags: string[]) {
    return test.step(`${role} remove tags from room ${roomId}`, async () => {
      const response = await this.request.delete(
        `https://${this.portalDomain}/api/2.0/files/rooms/${roomId}/tags`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: { names: tags },
        },
      );
      return response;
    });
  }

  async createTag(role: Role, tagName: string) {
    return test.step(`${role} create tag "${tagName}"`, async () => {
      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/files/tags`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: { name: tagName },
        },
      );
      return response;
    });
  }

  async deleteTag(role: Role, tagName: string) {
    return test.step(`${role} delete tag "${tagName}"`, async () => {
      const response = await this.request.delete(
        `https://${this.portalDomain}/api/2.0/files/tags`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: { names: [tagName] },
        },
      );
      return response;
    });
  }

  async getTags(role: Role) {
    return test.step(`${role} get all tags`, async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/files/tags`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );
      return response;
    });
  }
}

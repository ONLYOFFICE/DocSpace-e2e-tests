import log from "../../utils/logger.js";

export class RoomsApi {
  constructor(apiContext, portalDomain, getAuthHeaders) {
    this.apiContext = apiContext;
    this.baseURL = `https://${portalDomain}/api/2.0`;
    this.getAuthHeaders = getAuthHeaders;
  }

  async createRoom(title, roomType) {
    const roomTypeMapping = {
      form_filling: 1,
      collaboration: 2,
      custom: 5,
      public: 6,
      virtual_data: 8,
    };

    if (!roomTypeMapping[roomType]) {
      throw new Error(`Invalid room type: ${roomType}`);
    }

    const response = await this.apiContext.post(`${this.baseURL}/files/rooms`, {
      headers: this.getAuthHeaders(),
      data: { title, roomType: roomTypeMapping[roomType] },
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to create room (${response.status()}): ${await response.text()}`,
      );
    }

    const { response: room } = await response.json();
    log.info(`Room created: "${room.title}" (ID: ${room.id})`);

    return { room, statusCode: response.status() };
  }

  async getAllRooms() {
    log.debug("Fetching all rooms...");
    const response = await this.apiContext.get(`${this.baseURL}/files/rooms`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to fetch rooms (${response.status()}): ${await response.text()}`,
      );
    }

    const responseData = await response.json();
    return responseData.response?.folders || [];
  }

  async archiveRoom(roomId, deleteAfter = true) {
    const headers = {
      ...this.getAuthHeaders(),
      "Content-Type": "application/json",
    };

    const response = await this.apiContext.put(
      `${this.baseURL}/files/rooms/${roomId}/archive`,
      {
        headers,
        data: JSON.stringify({ deleteAfter }),
      },
    );

    if (!response.ok()) {
      throw new Error(
        `Failed to archive room (${response.status()}): ${await response.text()}`,
      );
    }

    log.debug(`Room with ID: ${roomId} archived successfully`);
    return { statusCode: response.status() };
  }

  async pinRoom(roomId) {
    const response = await this.apiContext.put(
      `${this.baseURL}/files/rooms/${roomId}/pin`,
      {
        headers: this.getAuthHeaders(),
      },
    );

    if (!response.ok()) {
      throw new Error(
        `Failed to pin room (${response.status()}): ${await response.text()}`,
      );
    }

    log.info(`Room with ID: ${roomId} pinned successfully`);
    return { statusCode: response.status() };
  }

  async deleteRoom(roomId, deleteAfter = true) {
    const response = await this.apiContext.delete(
      `${this.baseURL}/files/rooms/${roomId}`,
      {
        headers: this.getAuthHeaders(),
        data: { deleteAfter },
      },
    );

    if (!response.ok()) {
      throw new Error(
        `Failed to delete room (${response.status()}): ${await response.text()}`,
      );
    }

    log.info(`Room with ID: ${roomId} deleted successfully`);
    return { statusCode: response.status() };
  }
}

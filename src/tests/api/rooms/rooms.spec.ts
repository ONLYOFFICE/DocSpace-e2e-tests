import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";
import { RoomType } from "@onlyoffice/docspace-api-sdk";

test.describe("API rooms methods", () => {
  test("POST /files/rooms - Owner creates a Custom room", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Custom Room",
      roomType: "CustomRoom",
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.response.title).toBe("Autotest Custom Room");
    expect(body.response.roomType).toBe(RoomType.CustomRoom);
    expect(body.response.id).toBeGreaterThan(0);
  });

  test("POST /files/rooms - Owner creates a Collaboration room", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Collaboration Room",
      roomType: "EditingRoom",
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.response.title).toBe("Autotest Collaboration Room");
    expect(body.response.roomType).toBe(RoomType.EditingRoom);
    expect(body.response.id).toBeGreaterThan(0);
  });

  test("POST /files/rooms - Owner creates a Form filling room", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Form Filling Room",
      roomType: "FillingFormsRoom",
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.response.title).toBe("Autotest Form Filling Room");
    expect(body.response.roomType).toBe(RoomType.FillingFormsRoom);
    expect(body.response.id).toBeGreaterThan(0);
  });

  test("POST /files/rooms - Owner creates a Public room", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Public Room",
      roomType: "PublicRoom",
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.response.title).toBe("Autotest Public Room");
    expect(body.response.roomType).toBe(RoomType.PublicRoom);
    expect(body.response.id).toBeGreaterThan(0);
  });

  test("POST /files/rooms - Owner creates a Virtual data room", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Virtual Data Room",
      roomType: "VirtualDataRoom",
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.response.title).toBe("Autotest Virtual Data Room");
    expect(body.response.roomType).toBe(RoomType.VirtualDataRoom);
    expect(body.response.id).toBeGreaterThan(0);
  });

  test("Owner creates a room template", async ({ apiSdk }) => {
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room",
      roomType: "CustomRoom",
    });
    const roomBody = await roomResponse.json();
    const roomId = roomBody.response.id;

    await test.step("POST /files/roomtemplate - create room template", async () => {
      const response = await apiSdk.rooms.createRoomTemplate("owner", {
        roomId,
        title: "Autotest Template",
      });

      const body = await response.json();
      expect(response.status()).toBe(200);
      expect(body.response.error).toBeFalsy();
    });

    await test.step("GET /files/roomtemplate/status - check template status", async () => {
      await expect(async () => {
        const response = await apiSdk.rooms.getRoomTemplateStatus("owner");
        const body = await response.json();
        expect(response.status()).toBe(200);
        expect(body.response.isCompleted).toBe(true);
      }).toPass({
        intervals: [1_000, 2_000, 5_000],
        timeout: 30_000,
      });

      const response = await apiSdk.rooms.getRoomTemplateStatus("owner");
      const body = await response.json();
      expect(body.response.templateId).toBeGreaterThan(0);
      expect(body.response.error).toBeFalsy();
    });
  });

  test("Owner sets and gets room template public settings", async ({
    apiSdk,
  }) => {
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room",
      roomType: "CustomRoom",
    });
    const roomBody = await roomResponse.json();
    const roomId = roomBody.response.id;

    const templateId = await apiSdk.rooms.createRoomTemplateAndWait("owner", {
      roomId,
      title: "Autotest Template",
    });

    await test.step("GET /files/roomtemplate/:id/public - check default is false", async () => {
      const response = await apiSdk.rooms.getRoomTemplatePublic(
        "owner",
        templateId,
      );

      const body = await response.json();
      expect(response.status()).toBe(200);
      expect(body.response).toBe(false);
    });

    await test.step("PUT /files/roomtemplate/public - set public to true", async () => {
      const response = await apiSdk.rooms.setRoomTemplatePublic("owner", {
        id: templateId,
        public: true,
      });

      expect(response.status()).toBe(200);
    });

    await test.step("GET /files/roomtemplate/:id/public - verify changed to true", async () => {
      const response = await apiSdk.rooms.getRoomTemplatePublic(
        "owner",
        templateId,
      );

      const body = await response.json();
      expect(response.status()).toBe(200);
      expect(body.response).toBe(true);
    });
  });
});

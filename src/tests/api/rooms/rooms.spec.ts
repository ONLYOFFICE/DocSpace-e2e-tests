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

  test("GET /files/rooms - Owner gets rooms list", async ({ api, apiSdk }) => {
    await apiSdk.rooms.createAllRoomTypes("owner");

    await test.step("returns all created rooms with correct count", async () => {
      const response = await apiSdk.rooms.getRooms("owner");
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.statusCode).toBe(200);
      expect(body.response.folders).toHaveLength(5);
      expect(body.response.files).toHaveLength(0);
      expect(body.response.count).toBe(5);
      expect(body.response.total).toBe(5);
      expect(body.response.startIndex).toBe(0);
      expect(body.response.folders[0].ownedBy.id).toBe(api.adminUserId);
    });

    await test.step("filter by type returns only matching rooms", async () => {
      const response = await apiSdk.rooms.getRooms("owner", {
        type: RoomType.CustomRoom,
      });
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.response.total).toBe(1);
      expect(body.response.folders[0].roomType).toBe(RoomType.CustomRoom);
    });

    await test.step("filterValue search by title", async () => {
      const response = await apiSdk.rooms.getRooms("owner", {
        filterValue: "Autotest VDR",
      });
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.response.count).toBe(1);
      expect(body.response.folders[0].title).toContain("Autotest VDR");
    });
  });

  test("PUT /files/rooms/:id - Owner updates room title", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room Before Update",
      roomType: "CustomRoom",
    });
    const roomId = (await response.json()).response.id;

    await test.step("PUT /files/rooms/:id - update title", async () => {
      const updateResponse = await apiSdk.rooms.updateRoom("owner", roomId, {
        title: "Autotest Room After Update",
      });
      const updateBody = await updateResponse.json();

      expect(updateResponse.status()).toBe(200);
      expect(updateBody.response.title).toBe("Autotest Room After Update");
      expect(updateBody.response.id).toBe(roomId);
    });

    await test.step("GET /files/rooms/:id - confirms title changed", async () => {
      const infoResponse = await apiSdk.rooms.getRoomInfo("owner", roomId);
      const infoBody = await infoResponse.json();

      expect(infoResponse.status()).toBe(200);
      expect(infoBody.response.title).toBe("Autotest Room After Update");
    });
  });

  test("PUT /files/rooms/:id - Owner updates all allowed fields for VDR room", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest VDR Room",
      roomType: "VirtualDataRoom",
    });
    const roomId = (await response.json()).response.id;

    await test.step("PUT /files/rooms/:id - update all fields", async () => {
      const updateResponse = await apiSdk.rooms.updateRoom("owner", roomId, {
        title: "Updated VDR Room",
        indexing: true,
        denyDownload: true,
        lifetime: {
          deletePermanently: true,
          period: 0,
          value: 30,
          enabled: true,
        },
        watermark: {
          enabled: true,
          additions: 1,
          text: "Confidential",
          rotate: 0,
          imageScale: 100,
        },
        color: "FF5733",
      });
      const updateBody = await updateResponse.json();

      expect(updateResponse.status()).toBe(200);
      expect(updateBody.response.title).toBe("Updated VDR Room");
      expect(updateBody.response.indexing).toBe(true);
      expect(updateBody.response.denyDownload).toBe(true);
      expect(updateBody.response.logo.color).toBe("FF5733");
      expect(updateBody.response.lifetime.period).toBe(0);
      expect(updateBody.response.lifetime.value).toBe(30);
      expect(updateBody.response.lifetime.deletePermanently).toBe(true);
      expect(updateBody.response.watermark.additions).toBe(1);
      expect(updateBody.response.watermark.text).toBe("Confidential");
      expect(updateBody.response.watermark.rotate).toBe(0);
      expect(updateBody.response.watermark.imageScale).toBe(100);
    });

    await test.step("GET /files/rooms/:id - verify all fields saved", async () => {
      const infoResponse = await apiSdk.rooms.getRoomInfo("owner", roomId);
      const infoBody = await infoResponse.json();

      expect(infoResponse.status()).toBe(200);
      expect(infoBody.response.title).toBe("Updated VDR Room");
      expect(infoBody.response.indexing).toBe(true);
      expect(infoBody.response.denyDownload).toBe(true);
      expect(infoBody.response.logo.color).toBe("FF5733");
      expect(infoBody.response.lifetime.period).toBe(0);
      expect(infoBody.response.lifetime.value).toBe(30);
      expect(infoBody.response.watermark.additions).toBe(1);
      expect(infoBody.response.watermark.text).toBe("Confidential");
    });
  });

  // TODO: Need clarification — should API reject VDR-only fields on non-VDR rooms or is this expected behavior?
  test.skip("PUT /files/rooms/:id - Set VDR-only fields on CustomRoom", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Custom Room",
      roomType: "CustomRoom",
    });
    const roomId = (await response.json()).response.id;

    const updateResponse = await apiSdk.rooms.updateRoom("owner", roomId, {
      indexing: true,
      denyDownload: true,
      lifetime: {
        deletePermanently: true,
        period: 0,
        value: 30,
        enabled: true,
      },
      watermark: {
        enabled: true,
        additions: 1,
        text: "Confidential",
        rotate: 0,
        imageScale: 100,
      },
    });
    const updateBody = await updateResponse.json();
    expect(updateResponse.status()).toBe(200);
    expect(updateBody.response.indexing).toBe(true);
    expect(updateBody.response.denyDownload).toBe(true);
    expect(updateBody.response.lifetime.value).toBe(30);
    expect(updateBody.response.watermark.text).toBe("Confidential");
  });

  test("PUT /files/rooms/:id - Update room with empty title", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room",
      roomType: "CustomRoom",
    });
    const roomId = (await response.json()).response.id;

    const updateResponse = await apiSdk.rooms.updateRoom("owner", roomId, {
      title: "",
    });
    const updateBody = await updateResponse.json();

    // API ignores empty title and keeps the original value
    expect(updateResponse.status()).toBe(200);
    expect(updateBody.response.title).toBe("Autotest Room");
  });

  // Room IDs are globally unique, so the API returns 403 instead of 404
  // to prevent enumeration of existing room IDs
  test("PUT /files/rooms/:id - Update non-existent room", async ({
    apiSdk,
  }) => {
    const updateResponse = await apiSdk.rooms.updateRoom("owner", 999999999, {
      title: "Does Not Exist",
    });
    const updateBody = await updateResponse.json();

    expect(updateBody.statusCode).toBe(403);
  });

  test("PUT /files/rooms/:id/archive and unarchive", async ({ apiSdk }) => {
    const response = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Archive Room",
      roomType: "CustomRoom",
    });
    const body = await response.json();
    const roomId = body.response.id;

    await test.step("archive room", async () => {
      const result = await apiSdk.rooms.archiveRoom("owner", roomId);

      expect(result.response.status()).toBe(200);
      expect(result.finished).toBe(true);
    });

    await test.step("unarchive room", async () => {
      const result = await apiSdk.rooms.unarchiveRoom("owner", roomId);

      expect(result.response.status()).toBe(200);
      expect(result.finished).toBe(true);
    });
  });

  test("PUT /files/rooms/:id/pin and unpin", async ({ apiSdk }) => {
    const response = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Pin Room",
      roomType: "CustomRoom",
    });
    const roomId = (await response.json()).response.id;

    await test.step("pin room", async () => {
      const pinResponse = await apiSdk.rooms.pinRoom("owner", roomId);
      const pinBody = await pinResponse.json();

      expect(pinResponse.status()).toBe(200);
      expect(pinBody.statusCode).toBe(200);
    });

    await test.step("unpin room", async () => {
      const unpinResponse = await apiSdk.rooms.unpinRoom("owner", roomId);
      const unpinBody = await unpinResponse.json();

      expect(unpinResponse.status()).toBe(200);
      expect(unpinBody.statusCode).toBe(200);
    });
  });

  //TODO: Add async wait for DELETE /files/rooms/:id
  // test("DELETE /files/rooms/:id - Owner deletes a room", async ({ apiSdk }) => {
  //   const response = await apiSdk.rooms.createRoom("owner", {
  //     title: "Autotest Delete Room",
  //     roomType: "CustomRoom",
  //   });
  //   const body = await response.json();
  //   const roomId = body.response.id;

  //   const deleteResponse = await apiSdk.rooms.deleteRoom("owner", roomId);
  //   const deleteBody = await deleteResponse.json();

  //   console.log("DELETE response:", JSON.stringify(deleteBody, null, 2));
  //   expect(deleteResponse.status()).toBe(200);
  // });

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

  test("Owner creates and deletes tags", async ({ apiSdk }) => {
    await test.step("POST /files/tags - create a tag", async () => {
      const response = await apiSdk.rooms.createTag("owner", "Autotest Tag");
      const body = await response.json();

      expect(body.statusCode).toBe(200);
      expect(body.response).toBe("Autotest Tag");
      expect(body.count).toBe(1);
    });

    await test.step("GET /files/tags - verify tag exists", async () => {
      const response = await apiSdk.rooms.getTags("owner");
      const body = await response.json();

      expect(body.statusCode).toBe(200);
      expect(body.response).toContain("Autotest Tag");
    });
    // TODO: BUG - API returns 500 NullReferenceException if data is { name: "..." } instead of { names: [...] }
    await test.step("DELETE /files/tags - delete a tag", async () => {
      const response = await apiSdk.rooms.deleteTag("owner", "Autotest Tag");
      const body = await response.json();

      expect(body.statusCode).toBe(200);
      expect(body.count).toBe(0);
    });

    await test.step("GET /files/tags - verify tag deleted", async () => {
      const response = await apiSdk.rooms.getTags("owner");
      const body = await response.json();

      expect(body.statusCode).toBe(200);
      expect(body.response).not.toContain("Autotest Tag");
    });
  });

  test("PUT /files/rooms/:id/share - Owner sets room access rights", async ({
    apiSdk,
  }) => {
    const { response: memberResponse } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    const memberBody = await memberResponse.json();
    const userId = memberBody.response.id;

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Share Room",
      roomType: "CustomRoom",
    });
    const roomId = (await roomResponse.json()).response.id;

    await test.step("set access rights for user", async () => {
      const response = await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userId, access: "Editing" }],
        notify: false,
      });
      const body = await response.json();

      expect(body.statusCode).toBe(200);
      expect(body.response.members).toBeDefined();
      expect(body.response.members).toHaveLength(1);
    });

    await test.step("GET /files/rooms/:id/share - verify access rights", async () => {
      const response = await apiSdk.rooms.getRoomAccessRights("owner", roomId);
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.statusCode).toBe(200);

      expect(body.response).toHaveLength(2);
      expect(body.response[1].sharedToUser.id).toBe(userId);
    });
  });

  test("PUT /files/rooms/:id/share - Owner revokes room access rights", async ({
    apiSdk,
  }) => {
    const { response: memberResponse } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    const userId = (await memberResponse.json()).response.id;

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Share Room",
      roomType: "CustomRoom",
    });
    const roomId = (await roomResponse.json()).response.id;

    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "Editing" }],
      notify: false,
    });

    await test.step("PUT /files/rooms/:id/share - revoke access rights", async () => {
      const response = await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userId, access: "None" }],
        notify: false,
      });
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.statusCode).toBe(200);
    });

    await test.step("GET /files/rooms/:id/share - verify access revoked", async () => {
      const response = await apiSdk.rooms.getRoomAccessRights("owner", roomId);
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.response).toHaveLength(1);
      expect(body.response[0].sharedToUser.id).not.toBe(userId);
    });
  });

  test("Owner adds and removes tags from a room", async ({ apiSdk }) => {
    await apiSdk.rooms.createTag("owner", "Tag1");
    await apiSdk.rooms.createTag("owner", "Tag2");

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room with Tags",
      roomType: "CustomRoom",
    });
    const roomId = (await roomResponse.json()).response.id;

    await test.step("PUT /files/rooms/:id/tags - add tags to room", async () => {
      const response = await apiSdk.rooms.addRoomTags("owner", roomId, [
        "Tag1",
        "Tag2",
      ]);
      const body = await response.json();

      expect(body.statusCode).toBe(200);
      expect(body.response.id).toBe(roomId);
      expect(body.response.title).toBe("Autotest Room with Tags");
      expect(body.response.tags).toHaveLength(2);
      expect(body.response.tags).toContain("Tag1");
      expect(body.response.tags).toContain("Tag2");
    });

    await test.step("DELETE /files/rooms/:id/tags - remove tag from room", async () => {
      const response = await apiSdk.rooms.removeRoomTags("owner", roomId, [
        "Tag1",
      ]);
      const body = await response.json();

      expect(body.statusCode).toBe(200);
      expect(body.response.id).toBe(roomId);
      expect(body.response.tags).toHaveLength(1);
      expect(body.response.tags).not.toContain("Tag1");
      expect(body.response.tags).toContain("Tag2");
    });
  });
});

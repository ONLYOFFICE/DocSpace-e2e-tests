import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import Login from "@/src/objects/common/Login";
import { ApiSDK } from "@/src/services";
import { CONTRACT_TEMPLATE } from "@/src/utils/constants/metadata";
import {
  createContractTemplate,
  createFileWithMetadata,
  getFileFieldValue,
} from "@/src/utils/helpers/metadata";

const TEMPLATE_NAME = CONTRACT_TEMPLATE.name;
const FIELDS = CONTRACT_TEMPLATE.fields;

// Item metadata rights in rooms follow the room role: Viewer - read-only,
// Editor / Content creator / Room manager - full edit.
test.describe("Metadata access: rooms", () => {
  // Public room has no Viewer / Editor roles - Content creator is the
  // lowest member role there
  test("Public room Content creator edits metadata", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const roomName = "Public metadata room";
    const fileName = "Public contract";
    const myRooms = new MyRooms(page, api.portalDomain);
    let fileId: number;

    await test.step("Seed public room and file, invite a content creator", async () => {
      const template = await createContractTemplate(apiSdk);
      const response = await apiSdk.rooms.createRoom("owner", {
        title: roomName,
        roomType: "PublicRoom",
      });
      const roomId = (await response.json()).response.id;
      fileId = await createFileWithMetadata(apiSdk, {
        title: fileName,
        template,
        folderId: roomId,
        values: { [FIELDS.comment]: "Owner note" },
      });
      const { userData, userId } = await apiSdk.profiles.addMemberWithId(
        "owner",
        "User",
      );
      await apiSdk.rooms.inviteToRoom(
        "owner",
        roomId,
        userId,
        "ContentCreator",
      );
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("Content creator changes a value from the card", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await myRooms.openItemMetadata(fileName);
      const metadata = myRooms.infoPanel.metadata;
      await metadata.checkCardEditable(TEMPLATE_NAME);
      await metadata.openCardEdit(TEMPLATE_NAME);
      await metadata.fillTextValue(FIELDS.comment, "Edited in public room");
      await metadata.saveValues();
      await metadata.checkCardValue(
        TEMPLATE_NAME,
        FIELDS.comment,
        "Edited in public room",
      );
    });

    await test.step("Owner sees the new value", async () => {
      const value = await getFileFieldValue(
        apiSdk,
        fileId,
        TEMPLATE_NAME,
        FIELDS.comment,
      );
      expect(value?.stringValue).toBe("Edited in public room");
    });
  });

  test.describe("In a room", () => {
    const roomName = "Metadata room";
    const fileName = "Room contract";
    let myRooms: MyRooms;
    let roomId: number;
    let fileId: number;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      myRooms = new MyRooms(page, api.portalDomain);
      const template = await createContractTemplate(apiSdk);
      const response = await apiSdk.rooms.createRoom("owner", {
        title: roomName,
        roomType: "CustomRoom",
      });
      roomId = (await response.json()).response.id;
      fileId = await createFileWithMetadata(apiSdk, {
        title: fileName,
        template,
        folderId: roomId,
        values: { [FIELDS.comment]: "Owner note", [FIELDS.amount]: 100 },
      });
    });

    // Invites a new member with the given room role, logs in and opens the
    // file metadata inside the room. Room manager needs the RoomAdmin type.
    const openFileAs = async (
      apiSdk: ApiSDK,
      login: Login,
      access: "Read" | "Editing" | "ContentCreator" | "RoomManager",
    ) => {
      const { userData, userId } = await apiSdk.profiles.addMemberWithId(
        "owner",
        access === "RoomManager" ? "RoomAdmin" : "User",
      );
      await apiSdk.rooms.inviteToRoom("owner", roomId, userId, access);
      await login.loginWithCredentials(userData.email, userData.password);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await myRooms.openItemMetadata(fileName);
    };

    test("Room Viewer sees metadata read-only", async ({ apiSdk, login }) => {
      await test.step("Viewer opens the file metadata in the room", async () => {
        await openFileAs(apiSdk, login, "Read");
      });

      await test.step("Values are shown without edit controls", async () => {
        const metadata = myRooms.infoPanel.metadata;
        await metadata.checkCardReadOnly(TEMPLATE_NAME);
        await metadata.checkCardValue(
          TEMPLATE_NAME,
          FIELDS.comment,
          "Owner note",
        );
        await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.amount, "100");
      });
    });

    test("Room Editor edits metadata values", async ({ apiSdk, login }) => {
      await test.step("Editor opens the file metadata in the room", async () => {
        await openFileAs(apiSdk, login, "Editing");
        await myRooms.infoPanel.metadata.checkCardEditable(TEMPLATE_NAME);
      });

      await test.step("Change a value from the card and save", async () => {
        const metadata = myRooms.infoPanel.metadata;
        await metadata.openCardEdit(TEMPLATE_NAME);
        await metadata.fillNumberValue(FIELDS.amount, "700");
        await metadata.saveValues();
        await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.amount, "700");
      });

      await test.step("Owner sees the value changed by the editor", async () => {
        const value = await getFileFieldValue(
          apiSdk,
          fileId,
          TEMPLATE_NAME,
          FIELDS.amount,
        );
        expect(value?.numberValue).toBe(700);
      });
    });

    // Content creator is not the file author here, yet can edit its metadata
    test("Room Content creator edits metadata on a file of another member", async ({
      apiSdk,
      login,
    }) => {
      await test.step("Content creator opens the owner file metadata", async () => {
        await openFileAs(apiSdk, login, "ContentCreator");
        await myRooms.infoPanel.metadata.checkCardEditable(TEMPLATE_NAME);
      });

      await test.step("Change a value from the card and save", async () => {
        const metadata = myRooms.infoPanel.metadata;
        await metadata.openCardEdit(TEMPLATE_NAME);
        await metadata.fillTextValue(FIELDS.comment, "Edited by creator");
        await metadata.saveValues();
        await metadata.checkCardValue(
          TEMPLATE_NAME,
          FIELDS.comment,
          "Edited by creator",
        );
      });

      await test.step("Owner sees the value changed by the content creator", async () => {
        const value = await getFileFieldValue(
          apiSdk,
          fileId,
          TEMPLATE_NAME,
          FIELDS.comment,
        );
        expect(value?.stringValue).toBe("Edited by creator");
      });
    });

    test("Room manager removes and reassigns a template on a file", async ({
      apiSdk,
      login,
    }) => {
      await test.step("Room manager opens the file metadata", async () => {
        await openFileAs(apiSdk, login, "RoomManager");
        await myRooms.infoPanel.metadata.checkCardEditable(TEMPLATE_NAME);
      });

      await test.step("Remove the template from the file", async () => {
        await myRooms.infoPanel.metadata.removeCard(TEMPLATE_NAME);
        await myRooms.infoPanel.metadata.checkEmptyState();
      });

      await test.step("Assign the template again and fill a value", async () => {
        const metadata = myRooms.infoPanel.metadata;
        await metadata.openTemplatePicker();
        await metadata.selectTemplateInPicker(TEMPLATE_NAME);
        await metadata.fillTextValue(FIELDS.comment, "Set by manager");
        await metadata.saveValues();
        await metadata.checkCardValue(
          TEMPLATE_NAME,
          FIELDS.comment,
          "Set by manager",
        );
        // Values of the removed assignment are not restored
        await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.amount, "—");
      });

      await test.step("Owner sees the new value", async () => {
        const value = await getFileFieldValue(
          apiSdk,
          fileId,
          TEMPLATE_NAME,
          FIELDS.comment,
        );
        expect(value?.stringValue).toBe("Set by manager");
      });
    });
  });
});

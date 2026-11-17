import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import { MetadataFieldType } from "@/src/services/files/metadata.services";
import { metadataToastMessages } from "@/src/utils/constants/metadata";
import {
  createDocxInFolder,
  createMetadataTemplate,
  getFileFieldValue,
} from "@/src/utils/helpers/metadata";

const TEMPLATE_NAME = "Project info";
const COMMENT_FIELD = "Comment";
const ROOM_NAME = "Cascade room";
const NESTED_FOLDER = "Nested folder";
const ROOT_ITEM = "Root item";
const NESTED_ITEM = "Nested item";
const ROOM_VALUE = "Room value";

test.describe("Metadata: room cascade", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("Template applied to a room reaches all its content", async ({
    apiSdk,
  }) => {
    let roomId: number;

    await test.step("Seed template and a room with a file and a nested file", async () => {
      await createMetadataTemplate(apiSdk, TEMPLATE_NAME, [
        { name: COMMENT_FIELD, type: MetadataFieldType.Text },
      ]);
      const response = await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "CustomRoom",
      });
      roomId = (await response.json()).response.id;
      await createDocxInFolder(apiSdk, roomId, ROOT_ITEM);
      const folder = await apiSdk.files.createFolder(
        "owner",
        roomId,
        NESTED_FOLDER,
      );
      const folderId = (await folder.json()).response.id;
      await createDocxInFolder(apiSdk, folderId, NESTED_ITEM);
    });

    await test.step("Add the template to the room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openRoomMetadata(ROOM_NAME);
      const metadata = myRooms.infoPanel.metadata;
      await metadata.checkEmptyState();
      await metadata.checkCascadeToggleHidden();
      await metadata.openTemplatePicker();
      await metadata.selectTemplateInPicker(TEMPLATE_NAME);
      await metadata.fillTextValue(COMMENT_FIELD, ROOM_VALUE);
      await metadata.saveValues();
      await metadata.checkCascadeToggleVisible();
    });

    await test.step("Apply it to all room content", async () => {
      await myRooms.infoPanel.metadata.enableCascade("skip");
      await myRooms.dismissToastSafely(
        metadataToastMessages.appliedToFolder(TEMPLATE_NAME, ROOM_NAME),
      );
    });

    await test.step("File in the room got the room value", async () => {
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await myRooms.openItemMetadata(ROOT_ITEM);
      await myRooms.infoPanel.metadata.checkCardValue(
        TEMPLATE_NAME,
        COMMENT_FIELD,
        ROOM_VALUE,
      );
    });

    await test.step("File in a nested folder got it too", async () => {
      await myRooms.filesTable.openItem(NESTED_FOLDER);
      await myRooms.openItemMetadata(NESTED_ITEM);
      await myRooms.infoPanel.metadata.checkCardValue(
        TEMPLATE_NAME,
        COMMENT_FIELD,
        ROOM_VALUE,
      );
    });

    await test.step("New file in the room inherits the template", async () => {
      const newFileId = await createDocxInFolder(apiSdk, roomId, "New item");
      await expect
        .poll(
          async () =>
            (
              await getFileFieldValue(
                apiSdk,
                newFileId,
                TEMPLATE_NAME,
                COMMENT_FIELD,
              )
            )?.stringValue,
        )
        .toBe(ROOM_VALUE);
    });
  });
});

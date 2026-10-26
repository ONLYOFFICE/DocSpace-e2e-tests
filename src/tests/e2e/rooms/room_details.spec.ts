import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import FolderDeleteModal from "@/src/objects/files/FolderDeleteModal";
import { documentContextMenuOption } from "@/src/utils/constants/files";

const ROOM_NAME = "Content Counter Room";
const SUBFOLDER_NAME = "Subfolder";
const DOCX = "data/documents/test-document.docx";

test.describe("Room Details: Content counter", () => {
  let myRooms: MyRooms;
  let roomId: number;

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "CustomRoom",
    });
    expect(roomResponse.ok()).toBeTruthy();
    roomId = (await roomResponse.json()).response.id;

    await login.loginToPortal();
  });

  test("Files inside a subfolder are counted in the room total", async ({
    apiSdk,
  }) => {
    await test.step("Create a subfolder with 1 file in the room", async () => {
      const folderResponse = await apiSdk.files.createFolder(
        "owner",
        roomId,
        SUBFOLDER_NAME,
      );
      expect(folderResponse.ok()).toBeTruthy();
      const folderId = (await folderResponse.json()).response.id;
      await apiSdk.files.uploadToFolder("owner", folderId, DOCX);
    });

    await test.step("Upload 2 files to the room from the device", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      // "New" acts as "New room" until the room content has loaded
      await myRooms.filesTable.expectItemVisible(SUBFOLDER_NAME);
      await myRooms.filesNavigation.uploadFileAs(DOCX, ["Doc 1.docx"]);
      await myRooms.filesTable.expectItemVisible("Doc 1");
      await myRooms.filesNavigation.uploadFileAs(DOCX, ["Doc 2.docx"]);
      await myRooms.filesTable.expectItemVisible("Doc 2");
    });

    await test.step("Room Details show Folders: 1 | Files: 3", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.infoPanel.open();
      await myRooms.roomsTable.selectRow(ROOM_NAME);
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.checkContentProperty(1, 3);
    });
  });

  test("Content is updated right after deleting a file", async ({
    page,
    apiSdk,
  }) => {
    await test.step("Open the room with 1 file and its Details", async () => {
      await apiSdk.files.uploadToFolder("owner", roomId, DOCX);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await myRooms.filesTable.expectItemVisible("test-document");
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.checkContentProperty(0, 1);
    });

    await test.step("Delete the file", async () => {
      await myRooms.filesTable.openContextMenuForItem("test-document");
      await myRooms.filesTable.contextMenu.clickOption(
        documentContextMenuOption.delete,
      );
      await new FolderDeleteModal(page).clickDeleteFolder();
      await myRooms.filesTable.checkRowNotExist("test-document");
    });

    await test.step("Counter shows 0 files without reloading the page", async () => {
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.checkContentProperty(0, 0);
    });

    await test.step("Counter still shows 0 files after reloading the page", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.infoPanel.open();
      await myRooms.roomsTable.selectRow(ROOM_NAME);
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.checkContentProperty(0, 0);
    });
  });

  // BUG: after uploading a file from the device the Content counter shows
  // Files: 2 instead of 1 until the page is reloaded - the upload finish
  // handler and the "file created" socket event both increment it
  test.skip("Content is updated right after uploading a file from the device", async () => {
    await test.step("Open the room and its Details", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.checkContentProperty(0, 0);
    });

    await test.step("Upload a file from the device", async () => {
      await myRooms.filesNavigation.uploadFileAs(DOCX, ["Doc 1.docx"]);
      await myRooms.filesTable.expectItemVisible("Doc 1");
    });

    await test.step("Counter shows 1 file without reloading the page", async () => {
      await myRooms.infoPanel.checkContentProperty(0, 1);
    });

    await test.step("Counter still shows 1 file after reloading the page", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.checkContentProperty(0, 1);
    });
  });
});

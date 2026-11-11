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

  test("Content is updated right after uploading a file from the device", async () => {
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

  test("Counter includes files hidden by the filter", async ({ apiSdk }) => {
    let hiddenFileId: number;

    await test.step("Create a subfolder and 1 file in the room", async () => {
      const folderResponse = await apiSdk.files.createFolder(
        "owner",
        roomId,
        SUBFOLDER_NAME,
      );
      expect(folderResponse.ok()).toBeTruthy();
      hiddenFileId = (await apiSdk.files.uploadToFolder("owner", roomId, DOCX))
        .id;
    });

    await test.step("Open the room filtered by Folders and its Details", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await myRooms.filesTable.expectItemVisible(SUBFOLDER_NAME);
      await myRooms.filesFilter.openFilterDialog();
      await myRooms.filesFilter.selectFilterByFolders();
      await myRooms.filesFilter.applyFilter();
      await myRooms.filesTable.expectItemNotVisible("test-document");
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.checkContentProperty(1, 1);
    });

    await test.step("Upload a file the filter hides - counter shows 2 files", async () => {
      await myRooms.filesNavigation.uploadFileAs(DOCX, ["Doc 1.docx"]);
      await myRooms.infoPanel.checkContentProperty(1, 2);
    });

    await test.step("Another session deletes a hidden file - counter shows 1 file", async () => {
      const deleteResponse = await apiSdk.files.deleteFile(
        "owner",
        hiddenFileId,
      );
      expect(deleteResponse.ok()).toBeTruthy();
      await myRooms.infoPanel.checkContentProperty(1, 1);
    });
  });

  test("Folder created in the parent folder does not change the current folder counter", async ({
    apiSdk,
  }) => {
    let subfolderId: number;

    await test.step("Open an empty subfolder of the room and its Details", async () => {
      const folderResponse = await apiSdk.files.createFolder(
        "owner",
        roomId,
        SUBFOLDER_NAME,
      );
      expect(folderResponse.ok()).toBeTruthy();
      subfolderId = (await folderResponse.json()).response.id;

      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await myRooms.filesTable.openItem(SUBFOLDER_NAME);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.checkContentProperty(0, 0);
    });

    await test.step("Another session creates a folder in the room root, then a file in the subfolder", async () => {
      const parentFolderResponse = await apiSdk.files.createFolder(
        "owner",
        roomId,
        "Folder in parent",
      );
      expect(parentFolderResponse.ok()).toBeTruthy();
      // The file event comes after the folder event, so once the counter
      // shows the file, the folder event has been handled too
      await apiSdk.files.uploadToFolder("owner", subfolderId, DOCX);
    });

    await test.step("Subfolder counter shows only the new file", async () => {
      await myRooms.filesTable.expectItemVisible("test-document");
      await myRooms.infoPanel.checkContentProperty(0, 1);
    });

    await test.step("Room counter shows both folders and the file", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.checkContentProperty(2, 1);
    });
  });

  test("File restored from Trash with the same id is counted again", async ({
    page,
    apiSdk,
  }) => {
    let fileId: number;

    await test.step("Open the room with 1 file and its Details", async () => {
      fileId = (await apiSdk.files.uploadToFolder("owner", roomId, DOCX)).id;
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await myRooms.filesTable.expectItemVisible("test-document");
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.checkContentProperty(0, 1);
    });

    await test.step("Delete the file - counter shows 0 files", async () => {
      await myRooms.filesTable.openContextMenuForItem("test-document");
      await myRooms.filesTable.contextMenu.clickOption(
        documentContextMenuOption.delete,
      );
      await new FolderDeleteModal(page).clickDeleteFolder();
      await myRooms.filesTable.checkRowNotExist("test-document");
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.checkContentProperty(0, 0);
    });

    await test.step("Another session restores the file to the room - counter shows 1 file", async () => {
      const restoreResponse = await apiSdk.files.restoreFileFromTrash(
        "owner",
        fileId,
        roomId,
      );
      expect(restoreResponse.ok()).toBeTruthy();
      await myRooms.filesTable.expectItemVisible("test-document");
      await myRooms.infoPanel.checkContentProperty(0, 1);
    });
  });
});

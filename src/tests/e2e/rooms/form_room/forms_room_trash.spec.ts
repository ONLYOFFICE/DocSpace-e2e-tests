import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import Login from "@/src/objects/common/Login";
import FolderDeleteModal from "@/src/objects/files/FolderDeleteModal";
import {
  formFillingRoomPdfContextMenuOption,
  folderContextMenuOption,
} from "@/src/utils/constants/files";
import {
  formsTrashFileContextMenuOption,
  formsTrashFolderContextMenuOption,
} from "@/src/utils/constants/forms";

const PDF_FORM_FILE = "data/rooms/PDF from device.pdf";
const PDF_FORM_NAME = "PDF from device";
const FOLDER_NAME = "FolderWithForm";

test.describe("FormFilling room: Forms section Trash", () => {
  let myRooms: MyRooms;
  let login: Login;
  let roomName: string;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);

    roomName = "FormFillingRoom_Trash";
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: roomName,
      roomType: "FillingFormsRoom",
    });
    const roomId = (await roomResponse.json()).response.id;

    await apiSdk.files.uploadToFolder("owner", roomId, PDF_FORM_FILE);

    const folderResponse = await apiSdk.files.createFolder(
      "owner",
      roomId,
      FOLDER_NAME,
    );
    const folderId = (await folderResponse.json()).response.id;
    await apiSdk.files.uploadToFolder("owner", folderId, PDF_FORM_FILE);
  });

  test("Trash is empty by default", async () => {
    await test.step("Login as owner and open Forms > Trash", async () => {
      await login.loginToPortal();
      await myRooms.openFormsTrash();
    });

    await test.step("Verify Trash empty view is shown", async () => {
      await myRooms.expectFormsTrashEmptyView();
    });
  });

  test("Context menu for a file in Forms > Trash shows the expected options", async ({
    page,
  }) => {
    await test.step("Login as owner and open the room", async () => {
      await login.loginToPortal();
      await myRooms.openForms();
      await myRooms.roomsTable.openRoomByName(roomName);
    });

    await test.step("Delete the PDF form to Trash", async () => {
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.delete,
      );
      await new FolderDeleteModal(page).clickDeleteFolder();
      await myRooms.removeToast("successfully moved to Trash");
    });

    await test.step("Open Forms > Trash and verify context menu options", async () => {
      await myRooms.openFormsTrash();
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      for (const option of Object.values(formsTrashFileContextMenuOption)) {
        await expect(
          myRooms.filesTable.contextMenu.getItemLocator(option),
        ).toBeVisible();
      }
    });
  });

  test("Context menu for a folder in Forms > Trash shows the expected options", async ({
    page,
  }) => {
    await test.step("Login as owner and open the room", async () => {
      await login.loginToPortal();
      await myRooms.openForms();
      await myRooms.roomsTable.openRoomByName(roomName);
    });

    await test.step("Delete the folder to Trash", async () => {
      await myRooms.filesTable.openContextMenuForItem(FOLDER_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.delete,
      );
      await new FolderDeleteModal(page).clickDeleteFolder();
      await myRooms.removeToast("successfully moved to Trash");
    });

    await test.step("Open Forms > Trash and verify context menu options", async () => {
      await myRooms.openFormsTrash();
      await myRooms.filesTable.openContextMenuForItem(FOLDER_NAME);
      for (const option of Object.values(formsTrashFolderContextMenuOption)) {
        await expect(
          myRooms.filesTable.contextMenu.getItemLocator(option),
        ).toBeVisible();
      }
    });
  });

  test("Search in Forms > Trash by file name", async ({ page }) => {
    await test.step("Login as owner and open the room", async () => {
      await login.loginToPortal();
      await myRooms.openForms();
      await myRooms.roomsTable.openRoomByName(roomName);
    });

    await test.step("Delete the PDF form and the folder to Trash", async () => {
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.delete,
      );
      await new FolderDeleteModal(page).clickDeleteFolder();
      await myRooms.removeToast("successfully moved to Trash");

      await myRooms.filesTable.openContextMenuForItem(FOLDER_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.delete,
      );
      await new FolderDeleteModal(page).clickDeleteFolder();
      await myRooms.removeToast("successfully moved to Trash");
    });

    await test.step("Open Forms > Trash", async () => {
      await myRooms.openFormsTrash();
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
      await myRooms.filesTable.checkRowExist(FOLDER_NAME);
    });

    await test.step("Search by file name", async () => {
      await myRooms.filesFilter.fillFilesSearchInputAndCheckRequest(
        PDF_FORM_NAME,
      );
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
      await myRooms.filesTable.checkRowNotExist(FOLDER_NAME);
    });

    await test.step("Search with no results", async () => {
      await myRooms.filesFilter.fillFilesSearchInputAndCheckRequest(
        "nonexistent file",
      );
      await myRooms.filesFilter.checkFilesEmptyViewExist();
    });

    await test.step("Clear search", async () => {
      await myRooms.filesFilter.clearSearchText();
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
      await myRooms.filesTable.checkRowExist(FOLDER_NAME);
    });
  });

  test("Deleting a file forever removes it from Forms > Trash", async ({
    page,
  }) => {
    await test.step("Login as owner and open the room", async () => {
      await login.loginToPortal();
      await myRooms.openForms();
      await myRooms.roomsTable.openRoomByName(roomName);
    });

    await test.step("Delete the PDF form to Trash", async () => {
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.delete,
      );
      await new FolderDeleteModal(page).clickDeleteFolder();
      await myRooms.removeToast("successfully moved to Trash");
    });

    await test.step("Delete the file forever from Trash", async () => {
      await myRooms.openFormsTrash();
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        formsTrashFileContextMenuOption.delete,
      );
      await new FolderDeleteModal(page).clickDeleteFolder();
      await myRooms.removeToast("successfully deleted from Trash");
      await myRooms.filesTable.checkRowNotExist(PDF_FORM_NAME);
    });
  });

  test("Deleting a folder with a file inside forever removes it from Forms > Trash", async ({
    page,
  }) => {
    await test.step("Login as owner and open the room", async () => {
      await login.loginToPortal();
      await myRooms.openForms();
      await myRooms.roomsTable.openRoomByName(roomName);
    });

    await test.step("Delete the folder to Trash", async () => {
      await myRooms.filesTable.openContextMenuForItem(FOLDER_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.delete,
      );
      await new FolderDeleteModal(page).clickDeleteFolder();
      await myRooms.removeToast("successfully moved to Trash");
    });

    await test.step("Delete the folder forever from Trash", async () => {
      await myRooms.openFormsTrash();
      await myRooms.filesTable.checkRowExist(FOLDER_NAME);
      await myRooms.filesTable.openContextMenuForItem(FOLDER_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        formsTrashFolderContextMenuOption.delete,
      );
      await new FolderDeleteModal(page).clickDeleteFolder();
      await myRooms.removeToast("successfully deleted from Trash");
      await myRooms.filesTable.checkRowNotExist(FOLDER_NAME);
    });
  });

  test("Empty trash removes all items from Forms > Trash", async ({ page }) => {
    await test.step("Login as owner and open the room", async () => {
      await login.loginToPortal();
      await myRooms.openForms();
      await myRooms.roomsTable.openRoomByName(roomName);
    });

    await test.step("Delete the PDF form and the folder to Trash", async () => {
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.delete,
      );
      await new FolderDeleteModal(page).clickDeleteFolder();
      await myRooms.removeToast("successfully moved to Trash");

      await myRooms.filesTable.openContextMenuForItem(FOLDER_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.delete,
      );
      await new FolderDeleteModal(page).clickDeleteFolder();
      await myRooms.removeToast("successfully moved to Trash");
    });

    await test.step("Empty the trash from the header menu", async () => {
      await myRooms.openFormsTrash();
      await myRooms.filesTable.checkRowExist(PDF_FORM_NAME);
      await myRooms.filesTable.checkRowExist(FOLDER_NAME);
      await myRooms.emptyFormsTrash();
    });

    await test.step("Verify Trash empty view is shown", async () => {
      await myRooms.expectFormsTrashEmptyView();
    });
  });

  test("Restore all from Forms > Trash offers all 4 destination sections", async ({
    page,
  }) => {
    await test.step("Login as owner and open the room", async () => {
      await login.loginToPortal();
      await myRooms.openForms();
      await myRooms.roomsTable.openRoomByName(roomName);
    });

    await test.step("Delete the PDF form and the folder to Trash", async () => {
      await myRooms.filesTable.openContextMenuForItem(PDF_FORM_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.delete,
      );
      await new FolderDeleteModal(page).clickDeleteFolder();
      await myRooms.removeToast("successfully moved to Trash");

      await myRooms.filesTable.openContextMenuForItem(FOLDER_NAME);
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.delete,
      );
      await new FolderDeleteModal(page).clickDeleteFolder();
      await myRooms.removeToast("successfully moved to Trash");
    });

    await test.step("Open Restore all selector from the header menu", async () => {
      await myRooms.openFormsTrash();
      await myRooms.openFormsTrashRestoreAllSelector();
    });

    await test.step("Verify all 4 sections are available", async () => {
      await myRooms.checkSelectorHasAllFourSections();
    });

    await test.step("Restore all to My Documents", async () => {
      await myRooms.selector.selectItemByIndex(0);
      await myRooms.selector.submitSelection();
    });

    await test.step("Verify Trash is empty after restoring", async () => {
      await myRooms.expectFormsTrashEmptyView();
    });
  });
});

import Files from "@/src/objects/files/Files";
import Trash from "@/src/objects/files/trash/Trash";
import Rooms from "@/src/objects/rooms/Rooms";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import { FILTER_TYPE, FILTER_AUTHOR } from "@/src/utils/constants/filter";
import { DOC_ACTIONS } from "@/src/utils/constants/files";
import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import { getPortalUrl } from "@/config";

test.describe("Trash", () => {
  let files: Files;
  let trash: Trash;
  let rooms: Rooms;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    trash = new Trash(page);
    rooms = new Rooms(page, api.portalDomain);

    await login.loginToPortal();
    await files.open();
    await files.deleteAllDocs();
  });

  test("Delete all files from trash forever", async () => {
    await test.step("Create files and delete them to trash", async () => {
      await files.createDocumentFile("TrashFile1");
      await files.createDocumentFile("TrashFile2");
      await files.createDocumentFile("TrashFile3");
      await files.bulkDeleteFiles(["TrashFile1", "TrashFile2", "TrashFile3"]);
    });

    await test.step("Open trash and verify files exist", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("TrashFile1");
      await trash.trashTable.checkRowExist("TrashFile2");
      await trash.trashTable.checkRowExist("TrashFile3");
    });

    await test.step("Delete all files forever", async () => {
      await trash.deleteForever();
    });

    await test.step("Verify trash is empty", async () => {
      await trash.trashEmptyView.checkNoDocsTextExist();
    });
  });

  test("Delete single file from trash forever", async () => {
    await test.step("Create files and delete them to trash", async () => {
      await files.createDocumentFile("KeepFile");
      await files.createDocumentFile("DeleteFile");
      await files.bulkDeleteFiles(["KeepFile", "DeleteFile"]);
    });

    await test.step("Open trash and permanently delete one file", async () => {
      await trash.open();
      await trash.deleteFileForever("DeleteFile");
    });

    await test.step("Verify only the other file remains", async () => {
      await trash.trashTable.checkRowExist("KeepFile");
      await trash.trashTable.checkRowNotExist("DeleteFile");
    });
  });

  test("Restore single file from trash to Documents", async () => {
    await test.step("Create file and delete to trash", async () => {
      await files.createDocumentFile("RestoreMe");
      await files.deleteFile("RestoreMe");
    });

    await test.step("Restore file from trash", async () => {
      await trash.open();
      await trash.restoreFileTo("RestoreMe");
    });

    await test.step("Verify file is back in My Documents", async () => {
      await files.open();
      await files.filesTable.checkRowExist("RestoreMe");
    });
  });

  test("Restore all files from trash via header menu", async () => {
    await test.step("Create files and delete them to trash", async () => {
      await files.createDocumentFile("RestoreAll1");
      await files.createDocumentFile("RestoreAll2");
      await files.deleteFile("RestoreAll1");
      await files.deleteFile("RestoreAll2");
    });

    await test.step("Open trash and restore all via header", async () => {
      await trash.open();
      await trash.restoreAllToDocuments();
      await trash.trashEmptyView.checkNoDocsTextExist();
    });

    await test.step("Verify files are restored to My Documents", async () => {
      await files.open();
      await files.filesTable.checkRowExist("RestoreAll1");
      await files.filesTable.checkRowExist("RestoreAll2");
    });
  });

  test("Deleted folder appears in trash", async () => {
    await test.step("Create folder", async () => {
      await files.filesNavigation.openCreateDropdown();
      await files.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_FOLDER);
      await files.filesNavigation.modal.fillCreateTextInput("TrashFolder");
      await files.filesNavigation.modal.clickCreateButton();
      await files.filesTable.checkRowExist("TrashFolder");
    });

    await test.step("Delete folder", async () => {
      await files.filesTable.openContextMenuForItem("TrashFolder");
      await files.filesTable.contextMenu.clickOption("Delete");
      await files.folderDeleteModal.clickDeleteFolder();
      await files.removeToast("successfully moved to Trash");
    });

    await test.step("Verify folder is in trash", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("TrashFolder");
    });
  });

  test("Empty trash via header context menu", async () => {
    await test.step("Create files and delete them to trash", async () => {
      await files.createDocumentFile("EmptyTrashFile1");
      await files.createDocumentFile("EmptyTrashFile2");
      await files.bulkDeleteFiles(["EmptyTrashFile1", "EmptyTrashFile2"]);
    });

    await test.step("Open trash and verify files exist", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("EmptyTrashFile1");
      await trash.trashTable.checkRowExist("EmptyTrashFile2");
    });

    await test.step("Empty trash via header context menu and confirm", async () => {
      await trash.emptyTrash();
    });
  });

  test("Filter trash by file name using search", async () => {
    await test.step("Create files and delete them to trash", async () => {
      await files.createDocumentFile("SearchTarget");
      await files.createDocumentFile("OtherFile");
      await files.bulkDeleteFiles(["SearchTarget", "OtherFile"]);
    });

    await test.step("Open trash and search by name", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("SearchTarget");
      await trash.trashTable.checkRowExist("OtherFile");
      await trash.filter.searchInput.fill("SearchTarget");
      await trash.trashTable.checkRowExist("SearchTarget");
      await trash.trashTable.checkRowNotExist("OtherFile");
    });

    await test.step("Clear search and verify all files are shown again", async () => {
      await trash.filter.searchInput.clear();
      await trash.trashTable.checkRowExist("OtherFile");
    });
  });

  test("Filter trash by type: Folders", async () => {
    await test.step("Create a document and a folder, delete both to trash", async () => {
      await files.createDocumentFile("DocInTrash");
      await files.filesNavigation.openCreateDropdown();
      await files.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_FOLDER);
      await files.filesNavigation.modal.fillCreateTextInput("FolderInTrash");
      await files.filesNavigation.modal.clickCreateButton();
      await files.filesTable.checkRowExist("FolderInTrash");
      await files.bulkDeleteFiles(["DocInTrash"]);
      await files.filesTable.openContextMenuForItem("FolderInTrash");
      await files.filesTable.contextMenu.clickOption("Delete");
      await files.folderDeleteModal.clickDeleteFolder();
      await files.removeToast("successfully moved to Trash");
    });

    await test.step("Open trash and filter by type Folders", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("DocInTrash");
      await trash.trashTable.checkRowExist("FolderInTrash");
      await trash.filter.openFilterDialog();
      await trash.filter.selectFilterTag(FILTER_TYPE.FOLDERS);
      await trash.filter.filterApplyButton.click();
    });

    await test.step("Verify only folder is shown", async () => {
      await trash.trashTable.checkRowExist("FolderInTrash");
      await trash.trashTable.checkRowNotExist("DocInTrash");
    });

    await test.step("Clear filter and verify both items are shown again", async () => {
      await trash.filter.openFilterDialog();
      await trash.filter.clearFilterDialog();
      await trash.filter.filterApplyButton.click();
      await trash.trashTable.checkRowExist("DocInTrash");
      await trash.trashTable.checkRowExist("FolderInTrash");
    });
  });

  test("Filter trash by author: Me", async () => {
    await test.step("Create files and delete them to trash", async () => {
      await files.createDocumentFile("AuthorFilterFile1");
      await files.createDocumentFile("AuthorFilterFile2");
      await files.bulkDeleteFiles(["AuthorFilterFile1", "AuthorFilterFile2"]);
    });

    await test.step("Open trash and filter by author Me", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("AuthorFilterFile1");
      await trash.trashTable.checkRowExist("AuthorFilterFile2");
      await trash.filter.openFilterDialog();
      await trash.filter.selectFilterTag(FILTER_AUTHOR.ME);
      await trash.filter.filterApplyButton.click();
    });

    await test.step("Verify files from current user are shown", async () => {
      await trash.trashTable.checkRowExist("AuthorFilterFile1");
      await trash.trashTable.checkRowExist("AuthorFilterFile2");
    });

    await test.step("Clear filter and verify files are still shown", async () => {
      await trash.filter.openFilterDialog();
      await trash.filter.clearFilterDialog();
      await trash.filter.filterApplyButton.click();
      await trash.trashTable.checkRowExist("AuthorFilterFile1");
      await trash.trashTable.checkRowExist("AuthorFilterFile2");
    });
  });

  test("Filter trash by author: Other user", async ({ apiSdk }) => {
    let userName: string;

    await test.step("Setup: create second user, create file and delete to trash", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      userName = `${userData.firstName} ${userData.lastName}`;

      await files.createDocumentFile("AuthorOtherFile");
      await files.deleteFile("AuthorOtherFile");
    });

    await test.step("Open trash and open filter dialog", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("AuthorOtherFile");
      await trash.filter.openFilterDialog();
    });

    await test.step("Select Other author filter and pick the user", async () => {
      await trash.filter.authorOtherTag.click();
      const userPickerModal = trash.filter.page.locator("#modal-dialog");
      await userPickerModal
        .getByText(userName, { exact: true })
        .click({ force: true });
      await userPickerModal
        .getByRole("button", { name: "Select", exact: true })
        .click({ force: true });
      await trash.filter.filterApplyButton.click();
    });

    await test.step("Verify empty result since no files from other user in trash", async () => {
      await expect(trash.filter.emptyViewContainer).toBeVisible();
    });
  });

  test("Filter dialog shows all available filter options", async () => {
    await test.step("Open trash and open filter dialog", async () => {
      await trash.open();
      await trash.filter.openFilterDialog();
    });

    await test.step("Verify Author filter options are visible", async () => {
      await expect(trash.filter.authorMeTag).toBeVisible();
      await expect(trash.filter.authorOtherTag).toBeVisible();
    });

    await test.step("Verify Type filter options are visible", async () => {
      await expect(trash.filter.typeFoldersTag).toBeVisible();
      await expect(trash.filter.typeAllFilesTag).toBeVisible();
      await expect(trash.filter.typeDocumentsTag).toBeVisible();
      await expect(trash.filter.typeSpreadsheetsTag).toBeVisible();
      await expect(trash.filter.typePresentationsTag).toBeVisible();
      await expect(trash.filter.typePdfTag).toBeVisible();
      await expect(trash.filter.typeFormsTag).toBeVisible();
      await expect(trash.filter.typeDiagramsTag).toBeVisible();
      await expect(trash.filter.typeArchiveTag).toBeVisible();
      await expect(trash.filter.typeImagesTag).toBeVisible();
      await expect(trash.filter.typeMediaTag).toBeVisible();
    });

    await test.step("Verify Room filter option is visible", async () => {
      await expect(trash.filter.roomFilterTag).toBeVisible();
    });

    await test.step("Close filter dialog", async () => {
      await trash.filter.filterCancelButton.click();
    });
  });

  test("Restore file to a custom subfolder in My Documents", async () => {
    await test.step("Create subfolder in My Documents", async () => {
      await files.filesNavigation.openCreateDropdown();
      await files.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_FOLDER);
      await files.filesNavigation.modal.fillCreateTextInput("RestoreTarget");
      await files.filesNavigation.modal.clickCreateButton();
      await files.filesTable.checkRowExist("RestoreTarget");
    });

    await test.step("Create file and delete to trash", async () => {
      await files.createDocumentFile("FileToRestore");
      await files.deleteFile("FileToRestore");
    });

    await test.step("Open trash and restore file to custom subfolder", async () => {
      await trash.open();
      await trash.openRestoreSelector("FileToRestore");
      await trash.trashSelector.select("documents");
      await trash.trashSelector.selectItemByText("RestoreTarget");
      await trash.trashSelector.restore();
      await trash.trashTable.checkRowNotExist("FileToRestore");
    });

    await test.step("Verify file is restored inside the subfolder", async () => {
      await files.open();
      await files.filesTable.checkRowNotExist("FileToRestore");
      await files.filesTable.openContextMenuForItem("RestoreTarget");
      await files.filesTable.contextMenu.clickOption("Open");
      await files.filesTable.checkRowExist("FileToRestore");
    });
  });

  test("Info panel shows file details for item in trash", async () => {
    await test.step("Create file and delete to trash", async () => {
      await files.createDocumentFile("InfoPanelDoc");
      await files.deleteFile("InfoPanelDoc");
    });

    await test.step("Open trash and select the file", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("InfoPanelDoc");
      await trash.trashTable.selectRow("InfoPanelDoc");
    });

    await test.step("Open info panel and verify file properties", async () => {
      await trash.infoPanel.open();
      await trash.infoPanel.checkDocxFileProperties();
    });
  });

  test("Restore all files from trash to a custom subfolder via header menu", async () => {
    await test.step("Create subfolder and files, delete files to trash", async () => {
      await files.filesNavigation.openCreateDropdown();
      await files.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_FOLDER);
      await files.filesNavigation.modal.fillCreateTextInput(
        "BulkRestoreTarget",
      );
      await files.filesNavigation.modal.clickCreateButton();
      await files.filesTable.checkRowExist("BulkRestoreTarget");
      await files.createDocumentFile("BulkFile1");
      await files.createDocumentFile("BulkFile2");
      await files.bulkDeleteFiles(["BulkFile1", "BulkFile2"]);
    });

    await test.step("Open trash and restore all to custom subfolder", async () => {
      await trash.open();
      await trash.openRestoreAllSelector();
      await trash.trashSelector.select("documents");
      await trash.trashSelector.selectItemByText("BulkRestoreTarget");
      await trash.trashSelector.restore();
      await trash.trashEmptyView.checkNoDocsTextExist();
    });

    await test.step("Verify files are inside the subfolder", async () => {
      await files.open();
      await files.filesTable.checkRowNotExist("BulkFile1");
      await files.filesTable.checkRowNotExist("BulkFile2");
      await files.filesTable.openContextMenuForItem("BulkRestoreTarget");
      await files.filesTable.contextMenu.clickOption("Open");
      await files.filesTable.checkRowExist("BulkFile1");
      await files.filesTable.checkRowExist("BulkFile2");
    });
  });

  test("Filter trash by type: Documents excludes folders", async () => {
    await test.step("Create document and folder, delete both to trash", async () => {
      await files.createDocumentFile("TypeDocFile");
      await files.filesNavigation.openCreateDropdown();
      await files.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_FOLDER);
      await files.filesNavigation.modal.fillCreateTextInput("TypeDocFolder");
      await files.filesNavigation.modal.clickCreateButton();
      await files.filesTable.checkRowExist("TypeDocFolder");
      await files.bulkDeleteFiles(["TypeDocFile"]);
      await files.filesTable.openContextMenuForItem("TypeDocFolder");
      await files.filesTable.contextMenu.clickOption("Delete");
      await files.folderDeleteModal.clickDeleteFolder();
      await files.removeToast("successfully moved to Trash");
    });

    await test.step("Open trash and filter by type Documents", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("TypeDocFile");
      await trash.trashTable.checkRowExist("TypeDocFolder");
      await trash.filter.openFilterDialog();
      await trash.filter.selectFilterTag(FILTER_TYPE.DOCUMENTS);
      await trash.filter.filterApplyButton.click();
    });

    await test.step("Verify only document file is shown", async () => {
      await trash.trashTable.checkRowExist("TypeDocFile");
      await trash.trashTable.checkRowNotExist("TypeDocFolder");
    });

    await test.step("Clear filter and verify both items are shown again", async () => {
      await trash.filter.openFilterDialog();
      await trash.filter.clearFilterDialog();
      await trash.filter.filterApplyButton.click();
      await trash.trashTable.checkRowExist("TypeDocFile");
      await trash.trashTable.checkRowExist("TypeDocFolder");
    });
  });

  test("Restore folder from trash to Documents", async () => {
    await test.step("Create folder and delete to trash", async () => {
      await files.filesNavigation.openCreateDropdown();
      await files.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_FOLDER);
      await files.filesNavigation.modal.fillCreateTextInput("RestoreFolder");
      await files.filesNavigation.modal.clickCreateButton();
      await files.filesTable.checkRowExist("RestoreFolder");

      await files.filesTable.openContextMenuForItem("RestoreFolder");
      await files.filesTable.contextMenu.clickOption("Delete");
      await files.folderDeleteModal.clickDeleteFolder();
      await files.removeToast("successfully moved to Trash");
    });

    await test.step("Restore folder from trash", async () => {
      await trash.open();
      await trash.restoreFileTo("RestoreFolder");
    });

    await test.step("Verify folder is back in My Documents", async () => {
      await files.open();
      await files.filesTable.checkRowExist("RestoreFolder");
    });
  });

  test("Restore file from trash to a room", async ({ apiSdk }) => {
    const roomName = "FileRestoreRoom";

    await test.step("Create room and delete file to trash", async () => {
      await apiSdk.rooms.createRoom("owner", {
        title: roomName,
        roomType: "CustomRoom",
      });
      await files.createDocumentFile("FileToRoom");
      await files.deleteFile("FileToRoom");
    });

    await test.step("Open trash and restore file to room", async () => {
      await trash.open();
      await trash.openRestoreSelector("FileToRoom");
      await trash.trashSelector.select("rooms");
      await trash.trashSelector.selectItemByText(roomName);
      await trash.trashSelector.restore();
      await trash.trashTable.checkRowNotExist("FileToRoom");
    });

    await test.step("Verify file is inside the room", async () => {
      await rooms.openWithoutEmptyCheck();
      await rooms.roomsTable.openRoomByName(roomName);
      await rooms.filesTable.checkRowExist("FileToRoom");
    });
  });

  test("Filter trash by author: file created by room manager appears when filtering by their name", async ({
    page,
    apiSdk,
    login,
  }) => {
    let memberName: string;
    let memberEmail: string;
    let memberPassword: string;
    let roomId: number;
    const roomInfoPanel = new RoomInfoPanel(page);
    const roomsInviteDialog = new RoomsInviteDialog(page);

    await test.step("Setup: create room and user via API", async () => {
      const roomResponse = await apiSdk.rooms.createRoom("owner", {
        title: "AuthorFilterRoom",
        roomType: "CustomRoom",
      });
      if (!roomResponse.ok()) {
        throw new Error(
          `createRoom failed: ${roomResponse.status()} - ${await roomResponse.text()}`,
        );
      }
      roomId = (await roomResponse.json()).response.id as number;

      const { response: memberResponse, userData: memberData } =
        await apiSdk.profiles.addMember("owner", "RoomAdmin");
      if (!memberResponse.ok()) {
        throw new Error(
          `addMember failed: ${memberResponse.status()} - ${await memberResponse.text()}`,
        );
      }
      const memberBody = await memberResponse.json();
      memberName = `${memberBody.response.firstName} ${memberBody.response.lastName}`;
      memberEmail = memberData.email;
      memberPassword = memberData.password;
    });

    await test.step("Owner opens room and adds member as Room Manager via UI", async () => {
      await rooms.openWithoutEmptyCheck();
      await rooms.roomsTable.checkRowExist("AuthorFilterRoom");
      await rooms.roomsTable.openRoomByName("AuthorFilterRoom");
      await rooms.infoPanel.open();
      await rooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectAccessType("roomManager");
      await roomsInviteDialog.contactsPanel.selectUserByEmail(memberEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.verifyUserRole(memberEmail, "Room admin");
      await roomsInviteDialog.submitInviteDialog();
      await rooms.infoPanel.openTab("Contacts");
      await rooms.infoPanel.checkMemberInList(memberName);
      await rooms.infoPanel.checkMemberHasRole(memberName, "Room manager");
    });

    await test.step("Room manager logs in and creates a file in the room via UI", async () => {
      await login.logout();
      await login.loginWithCredentials(memberEmail, memberPassword);
      await page.goto(
        `${getPortalUrl(login.portalDomain)}/rooms/shared/${roomId}/filter?folder=${roomId}`,
        { waitUntil: "load" },
      );
      await rooms.filesNavigation.openCreateDropdown();
      await rooms.filesNavigation.selectCreateAction("Document");
      await rooms.filesNavigation.modal.checkModalExist();
      await rooms.filesNavigation.modal.fillCreateTextInput("RoomManagerFile");
      const [editorPage] = await Promise.all([
        page.context().waitForEvent("page", { timeout: 5000 }),
        rooms.filesNavigation.modal.clickCreateButton(),
      ]).catch(() => [null]);
      await editorPage?.close();
      await rooms.filesTable.checkRowExist("RoomManagerFile");
      await login.logout();
      await login.loginToPortal();
    });

    await test.step("Owner opens room and deletes the room manager's file via UI", async () => {
      await rooms.openWithoutEmptyCheck();
      await rooms.roomsTable.checkRowExist("AuthorFilterRoom");
      await rooms.roomsTable.openRoomByName("AuthorFilterRoom");
      await rooms.filesTable.checkRowExist("RoomManagerFile");
      await rooms.filesTable.openContextMenuForItem("RoomManagerFile");
      await rooms.filesTable.contextMenu.clickOption("Delete");
      await files.folderDeleteModal.clickDeleteFolder();
      await files.removeToast("successfully moved to Trash");
    });

    await test.step("Open trash and filter by room manager as Other author", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("RoomManagerFile");
      await trash.filter.openFilterDialog();
      await trash.filter.authorOtherTag.click();
      const userPickerModal = trash.filter.page.locator("#modal-dialog");
      await userPickerModal
        .getByText(memberName, { exact: true })
        .click({ force: true });
      await userPickerModal
        .getByRole("button", { name: "Select", exact: true })
        .click({ force: true });
      await trash.filter.filterApplyButton.click();
    });

    await test.step("Verify the room manager's file appears after filtering by their name", async () => {
      await trash.trashTable.checkRowExist("RoomManagerFile");
    });
  });

  test("Action required dialog appears when restoring a file that conflicts with an existing one", async ({
    apiSdk,
  }) => {
    await test.step("Create file, delete to trash, then create file with same name in My Documents", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: "ActionRequiredFile",
      });
      const fileId = (await fileResponse.json()).response.id as number;
      await apiSdk.files.deleteFile("owner", fileId);

      await apiSdk.files.createFileInMyDocuments("owner", {
        title: "ActionRequiredFile",
      });
    });

    await test.step("Open trash and open restore selector", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("ActionRequiredFile");
      await trash.openRestoreSelector("ActionRequiredFile");
    });

    await test.step("Navigate to Documents and restore", async () => {
      await trash.trashSelector.select("documents");
      await trash.trashSelector.restore();
    });

    await test.step("Verify Action required dialog appears and close it", async () => {
      await trash.checkActionRequiredDialogExist();
      await trash.closeActionRequiredDialog();
    });

    await test.step("Close selector", async () => {
      await trash.trashSelector.close();
    });
  });
});

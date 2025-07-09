import { test, Page } from "@playwright/test";

import API from "@/src/api";
import Folder from "@/src/objects/files/Folder";
import Rooms from "@/src/objects/rooms/Rooms";
import { roomCreateTitles } from "@/src/utils/constants/rooms";
import Login from "@/src/objects/common/Login";
import Screenshot from "@/src/objects/common/Screenshot";
import { DOC_ACTIONS } from "@/src/utils/constants/files";

test.describe("Folder", () => {
  let api: API;
  let page: Page;
  let login: Login;
  let folder: Folder;
  let myRooms: Rooms;
  let screenshot: Screenshot;

  const baseFolder = `BaseTestFolder`;
  const folderToMove = `TestFolderToMove`;
  const folderToCopy = `TestFolderToCopy`;
  const renamedFolder = `${baseFolder}-renamed`;

  test.beforeAll(async ({ playwright, browser }) => {
    const apiContext = await playwright.request.newContext();
    api = new API(apiContext);
    await api.setup();

    page = await browser.newPage();
    await page.addInitScript(() => {
      globalThis.localStorage?.setItem("integrationUITests", "true");
    });

    login = new Login(page, api.portalDomain);
    folder = new Folder(page, api.portalDomain);
    screenshot = new Screenshot(page, {
      screenshotDir: "files",
      suiteName: "folder_actions",
    });
    myRooms = new Rooms(page, api.portalDomain);

    await login.loginToPortal();
    await folder.open();
  });

  test("Folder actions", async () => {
    await test.step("Select", async () => {
      await folder.filesNavigation.openCreateDropdown();
      await folder.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_FOLDER,
      );
      await folder.filesNavigation.modal.checkModalExist();
      await folder.filesNavigation.modal.checkModalTitleExist("New folder");
      await folder.filesNavigation.modal.fillCreateTextInput(baseFolder);
      await folder.filesNavigation.modal.clickCreateButton();
      await folder.filesTable.hideModifiedColumn();
      await folder.filesTable.openContextMenuForItem(baseFolder);
      await folder.filesTable.contextMenu.clickOption("Select");
      await screenshot.expectHaveScreenshot("folder_selected");
    });

    await test.step("OpenFolder", async () => {
      await folder.filesTable.openContextMenuForItem(baseFolder);
      await folder.filesTable.contextMenu.clickOption("Open");
      await screenshot.expectHaveScreenshot("empty_folder_opened");
      await folder.filesNavigation.gotoBack();
    });

    await test.step("Share", async () => {
      const roomNameShared = `${baseFolder}-shared-room`;
      await folder.filesTable.openContextMenuForItem(baseFolder);
      await folder.filesTable.contextMenu.clickOption("Share");
      await screenshot.expectHaveScreenshot("share_folder_modal_opened");
      await folder.folderShareModal.clickCreateRoom();
      await screenshot.expectHaveScreenshot("share_folder_choose_room_type");
      await folder.createRoomFromFolder(
        roomCreateTitles.public,
        roomNameShared,
      );
      await folder.infoPanel.hideRoomIcon();
      await screenshot.expectHaveScreenshot("room_from_shared_folder_created");

      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.hideLastActivityColumn();
      await myRooms.roomsTable.checkRowExist(roomNameShared);
    });

    await test.step("CreateRoom", async () => {
      await folder.open();
      await folder.filesTable.openContextMenuForItem(baseFolder);
      await folder.filesTable.contextMenu.clickOption("Create room");
      await screenshot.expectHaveScreenshot("choose_room_type");
      await folder.createRoomFromFolder(roomCreateTitles.public);
      await folder.infoPanel.hideRoomIcon();
      await screenshot.expectHaveScreenshot("public_room_from_folder_created");

      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.hideLastActivityColumn();
      await myRooms.roomsTable.checkRowExist(`${baseFolder}`);
    });

    await test.step("Move", async () => {
      await folder.open();
      await folder.createNew(folderToMove);

      await folder.filesTable.openContextMenuForItem(folderToMove);
      await folder.filesTable.contextMenu.clickSubmenuOption(
        "Move or copy",
        "Move to",
      );
      await folder.filesSelectPanel.checkFileSelectPanelExist();
      await screenshot.expectHaveScreenshot("copy_select_panel_opened");
      await folder.filesSelectPanel.selectItemByText(baseFolder);
      await folder.filesSelectPanel.confirmSelection();
      await folder.expectFolderNotVisible(folderToMove);
    });

    await test.step("Copy", async () => {
      await folder.createNew(folderToCopy);

      await folder.filesTable.openContextMenuForItem(folderToCopy);
      await folder.filesTable.contextMenu.clickSubmenuOption(
        "Move or copy",
        "Copy",
      );
      await folder.filesSelectPanel.checkFileSelectPanelExist();
      await screenshot.expectHaveScreenshot("move_select_panel_opened");
      await folder.filesSelectPanel.selectItemByText(baseFolder);
      await folder.filesSelectPanel.confirmSelection();

      await folder.filesTable.openContextMenuForItem(baseFolder);
      await folder.filesTable.contextMenu.clickOption("Open");
      await folder.expectFolderVisible(folderToCopy);
    });

    await test.step("RenameFolder", async () => {
      await folder.open();
      await folder.filesTable.openContextMenuForItem(baseFolder);
      await folder.filesTable.contextMenu.clickOption("Rename");
      await folder.filesNavigation.modal.checkModalExist();
      await screenshot.expectHaveScreenshot("folder_rename_modal");
      await folder.filesNavigation.modal.fillCreateTextInput(renamedFolder);
      await folder.filesNavigation.modal.clickCreateButton();
      await folder.expectFolderRenamed(baseFolder, renamedFolder);
    });

    await test.step("Delete", async () => {
      await folder.filesTable.openContextMenuForItem(renamedFolder);
      await folder.filesTable.contextMenu.clickOption("Delete");
      await screenshot.expectHaveScreenshot("delete_folder_modal");
      await folder.folderDeleteModal.clickDeleteFolder();
      await folder.expectFolderNotVisible(renamedFolder);
    });
  });
  test.afterAll(async () => {
    await api.cleanup();
    await page.close();
  });
});

import { test, expect, Page } from "@playwright/test";

import API from "@/src/api";
import Folder from "@/src/objects/files/Folder";
import Login from "@/src/objects/common/Login";
import Screenshot from "@/src/objects/common/Screenshot";
import { DOC_ACTIONS } from "@/src/utils/constants/files";

test.describe("Folder Actiions", () => {
  let api: API;
  let page: Page;
  let login: Login;
  let folder: Folder;
  let screenshot: Screenshot;

  const folderName = `TestFolder`;
  const renamedFolder = `${folderName}-renamed`;

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
    screenshot = new Screenshot(page, "folder_actions");

    await login.loginToPortal();
    await folder.open();
  });

  test.beforeEach(async ({}, testInfo) => {
    await screenshot.setCurrentTestInfo(testInfo);
  });

  test("Folder actions", async () => {
    await test.step("Select", async () => {
      await folder.filesNavigation.openCreateDropdown();
      await folder.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_FOLDER);
      await folder.filesNavigation.modal.checkModalExist();
      await folder.filesNavigation.modal.checkModalTitleExist("New folder");
      await folder.filesNavigation.modal.fillCreateTextInput(folderName);
      await folder.filesNavigation.modal.clickCreateButton();
      await folder.filesTable.openContextMenuForItem(folderName);
      await folder.filesTable.contextMenu.clickOption("Select");
      await screenshot.expectHaveScreenshot("folder_selected");
  });
  
    await test.step("OpenFolder", async () => {
      await folder.filesTable.openContextMenuForItem(folderName);
      await folder.filesTable.contextMenu.clickOption("Open")
      await screenshot.expectHaveScreenshot("empty_folder_opened")
      await folder.filesNavigation.gotoBack();
    });

    await test.step("Share", async () => {
      await folder.filesTable.openContextMenuForItem(folderName);
      await folder.filesTable.contextMenu.clickOption("Share")
      await screenshot.expectHaveScreenshot("share_folder_modal_opened")
      await folder.folderShareModal.clickCreateRoom();
      await screenshot.expectHaveScreenshot("share_folder_choose_room_type")
      await folder.filesNavigation.closePanel();
    });

      await test.step("RenameFolder", async () => {
      await folder.filesTable.openContextMenuForItem(folderName);
      await folder.filesTable.contextMenu.clickOption("Rename")
      await folder.filesNavigation.modal.checkModalExist();
      await screenshot.expectHaveScreenshot("folder_rename_modal")
      await folder.filesNavigation.modal.fillCreateTextInput(renamedFolder);
      await folder.filesNavigation.modal.clickCreateButton();
      await folder.expectFolderRenamed(folderName, renamedFolder);
    });

    await test.step("Delete", async () => {
      await folder.filesTable.openContextMenuForItem(renamedFolder);
      await folder.filesTable.contextMenu.clickOption("Delete")
      await screenshot.expectHaveScreenshot("delete_folder_modal")
      await folder.folderDeleteModal.clickDeleteFolder();
      await folder.expectFolderNotVisible(renamedFolder);
      await screenshot.expectHaveScreenshot("folder_deleted");
    });

  });
  test.afterAll(async () => {
    await api.cleanup();
});
})

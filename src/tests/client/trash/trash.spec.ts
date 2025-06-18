import { test, Page } from "@playwright/test";

import API from "@/src/api";
import Login from "@/src/objects/common/Login";
import Screenshot from "@/src/objects/common/Screenshot";
import MyDocuments from "@/src/objects/files/MyDocuments";
import Trash from "@/src/objects/trash/Trash";
import { roomCreateTitles } from "@/src/utils/constants/rooms";

test.describe("Trash", () => {
  let api: API;
  let page: Page;

  let login: Login;
  let screenshot: Screenshot;

  let myDocuments: MyDocuments;
  let trash: Trash;

  test.beforeAll(async ({ playwright, browser }) => {
    const apiContext = await playwright.request.newContext();
    api = new API(apiContext);
    await api.setup();
    console.log(api.portalDomain);

    page = await browser.newPage();

    await page.addInitScript(() => {
      globalThis.localStorage?.setItem("integrationUITests", "true");
    });

    login = new Login(page, api.portalDomain);
    myDocuments = new MyDocuments(page, api.portalDomain);
    trash = new Trash(page);
    screenshot = new Screenshot(page, "trash");

    await login.loginToPortal();
    await myDocuments.open();
    await myDocuments.deleteAllDocs();
    await trash.open();
  });

  test.beforeEach(async ({}, testInfo) => {
    await screenshot.setCurrentTestInfo(testInfo);
  });

  /**
   * Tests the initial rendering of the archive page
   * Verifies that the archive table is displayed correctly with proper sorting
   * and column visibility settings
   */
  test("Render", async () => {
    // Render
    await screenshot.expectHaveScreenshot("render");

    // ContextMenu
    await trash.navigation.openContextMenu();
    await screenshot.expectHaveScreenshot("header_context_menu");

    await trash.trashTable.openContextMenuRow(
      trash.trashTable.tableRows.first(),
    );
    await screenshot.expectHaveScreenshot("table_context_menu");

    await trash.trashTable.toggleSettings();
    await screenshot.expectHaveScreenshot("table_settings");

    // OpenEmptyTrashDialog
    await trash.openEmptyTrashDialog("header");
    await trash.openEmptyTrashDialog("table");

    // Sort
    await trash.filter.sortButton.click();
    await screenshot.expectHaveScreenshot("sort");

    // Filter
    await trash.filter.filterButton.click();
    await screenshot.expectHaveScreenshot("filter");
    await page.mouse.click(1, 1);

    // InfoPanel
    await trash.trashTable.tableRows.first().click();
    await trash.infoPanel.open();
    await trash.infoPanel.hideDatePropertiesDetails();
    await screenshot.expectHaveScreenshot("info_panel");
    await trash.infoPanel.openOptions();
    await screenshot.expectHaveScreenshot("info_panel_options");
    await trash.infoPanel.close();

    // RestoreSelector
    await trash.openRestoreSelector();
    await screenshot.expectHaveScreenshot("restore_selector");

    await trash.trashSelector.select("rooms");
    await screenshot.expectHaveScreenshot("restore_selector_empty_rooms");

    await trash.trashSelector.createNewItem();
    await screenshot.expectHaveScreenshot(
      "empty_restore_selector_rooms_dropdown",
    );
    await trash.trashSelector.selectCreateRoomType(roomCreateTitles.public);
    await trash.trashSelector.fillNewItemName(roomCreateTitles.public);
    await screenshot.expectHaveScreenshot(
      "restore_selector_rooms_new_selector_item",
    );
    await trash.trashSelector.acceptCreate();
    await trash.trashSelector.selectFirstItem();
    await trash.trashSelector.checkEmptyContainerExist();

    await trash.trashSelector.gotoRoot();
    await trash.trashSelector.select("documents");
    await screenshot.expectHaveScreenshot("restore_selector_empty_documents");
    await trash.trashSelector.createNewFolder();
    await screenshot.expectHaveScreenshot("restore_selector_folder_created");

    // Restore
    await trash.trashSelector.restore();
    await trash.trashEmptyView.checkNoDocsTextExist();
    await screenshot.expectHaveScreenshot("empty_view");

    // ActionRequiredDialog
    await myDocuments.open();
    await myDocuments.deleteAllDocs();
    await trash.open();
    await trash.openRestoreSelector();
    await trash.trashSelector.select("documents");
    await trash.trashSelector.createNewFolder();
    await trash.trashSelector.restore();
    await trash.checkActionRequiredDialogExist();
    await trash.closeActionRequiredDialog();
    await trash.trashSelector.close();

    // DeleteForever
    await trash.deleteForever();
  });

  test.afterAll(async () => {
    await api.cleanup();
  });
});

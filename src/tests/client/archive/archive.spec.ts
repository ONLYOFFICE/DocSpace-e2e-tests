import { test, Page } from "@playwright/test";

import API from "@/src/api";
import Login from "@/src/objects/common/Login";
import MyRooms from "@/src/objects/rooms/Rooms";
import Archive from "@/src/objects/archive/Archive";
import Screenshot from "@/src/objects/common/Screenshot";
import { roomCreateTitles } from "@/src/utils/constants/rooms";

test.describe("BArchive", () => {
  let api: API;
  let page: Page;

  let login: Login;
  let screenshot: Screenshot;

  let myRooms: MyRooms;
  let myArchive: Archive;

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
    screenshot = new Screenshot(page, "archive");

    myRooms = new MyRooms(page, api.portalDomain);
    myArchive = new Archive(page, api.portalDomain);

    await login.loginToPortal();
    await myRooms.open();
    await myRooms.createRooms();
    await myRooms.moveAllRoomsToArchive();
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
    await myArchive.open();
    await myArchive.hideLastActivityColumn();
    await myArchive.sortByName();
    await screenshot.expectHaveScreenshot("rooms");
  });

  /**
   * Tests the context menu functionality in the archive
   * Verifies that the context menu appears correctly when right-clicking on a row
   */
  test("ContextMenu", async () => {
    await myArchive.archiveTable.openContextMenuRow(
      myArchive.archiveTable.tableRows.first(),
    );
    await screenshot.expectHaveScreenshot("from_table_row");
  });

  /**
   * Tests the info panel functionality in the archive
   * Verifies:
   * - Info panel opens correctly
   * - History tab shows correct archive-related events
   * - Options menu works properly
   */
  test("InfoPanel", async () => {
    await myArchive.infoPanel.open();
    await myArchive.infoPanel.checkInfoPanelExist();
    await myArchive.archiveTable.selectRow(roomCreateTitles.public);
    await myArchive.infoPanel.openTab("History");
    await myArchive.infoPanel.checkHistoryExist("Room moved to Archive");
    await myArchive.infoPanel.hideCreationDateHistory();
    await screenshot.expectHaveScreenshot("history");
    await myArchive.infoPanel.openOptions();
    await screenshot.expectHaveScreenshot("options");
  });

  /**
   * Tests the room restoration functionality from archive
   * Verifies that:
   * - Multiple rooms can be selected
   * - Rooms can be restored successfully
   * - Empty view appears after restoration
   */
  test("RestoreRooms", async () => {
    await myArchive.archiveTable.selectAllRows();
    await myArchive.restoreRooms();
    await myArchive.archiveEmptyView.checkNoArchivedRoomsExist();
    await screenshot.expectHaveScreenshot("rooms_restore");
  });

  /**
   * Tests the room deletion functionality from archive
   * Verifies that:
   * - Rooms can be moved to archive
   * - Multiple rooms can be selected
   * - Rooms can be permanently deleted
   * - Empty view appears after deletion
   */
  test("DeleteRooms", async () => {
    await myArchive.archiveEmptyView.gotoRooms();
    await myRooms.roomsTable.checkRoomExist(roomCreateTitles.public);
    await myRooms.moveAllRoomsToArchive();
    await myArchive.open();
    await myArchive.archiveTable.selectAllRows();
    await myArchive.deleteRooms();
    await myArchive.archiveEmptyView.checkNoArchivedRoomsExist();
  });

  test.afterAll(async () => {
    await api.cleanup();
  });
});

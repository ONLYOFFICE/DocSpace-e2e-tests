import MyRooms from "@/src/objects/rooms/Rooms";
import Archive from "@/src/objects/archive/Archive";
import Screenshot from "@/src/objects/common/Screenshot";
import { roomCreateTitles } from "@/src/utils/constants/rooms";
import { test } from "@/src/fixtures";

test.describe("Archive", () => {
  let screenshot: Screenshot;

  let myRooms: MyRooms;
  let myArchive: Archive;

  test.beforeEach(async ({ page, api, login }) => {
    screenshot = new Screenshot(page, {
      screenshotDir: "archive",
    });

    myRooms = new MyRooms(page, api.portalDomain);
    myArchive = new Archive(page, api.portalDomain);

    await login.loginToPortal();
  });

  test("Render", async () => {
    await test.step("Render", async () => {
      await myRooms.roomsEmptyView.checkNoRoomsExist();
      await myRooms.createRooms();
      await myRooms.moveAllRoomsToArchive();
      await myRooms.roomsEmptyView.checkNoRoomsExist();

      await myArchive.open();
      await myArchive.hideLastActivityColumn();
      await myArchive.sortByName();
      await screenshot.expectHaveScreenshot("render_rooms");
    });

    await test.step("ContextMenu", async () => {
      await myArchive.archiveTable.openContextMenuRow(
        myArchive.archiveTable.tableRows.first(),
      );
      await screenshot.expectHaveScreenshot("context_menu_from_table_row");
    });

    await test.step("InfoPanel", async () => {
      await myArchive.infoPanel.open();
      await myArchive.infoPanel.checkInfoPanelExist();
      await myArchive.archiveTable.selectRow(roomCreateTitles.public);
      await myArchive.infoPanel.openTab("History");
      await myArchive.infoPanel.checkHistoryExist("Room moved to Archive");
      await myArchive.infoPanel.hideCreationDateHistory();
      await screenshot.expectHaveScreenshot("info_panel_history");
      await myArchive.infoPanel.openOptions();
      await screenshot.expectHaveScreenshot("info_panel_options");
    });

    await test.step("RestoreRooms", async () => {
      await myArchive.archiveTable.selectAllRows();
      await myArchive.restoreRooms();
      await myArchive.archiveEmptyView.checkNoArchivedRoomsExist();
      await screenshot.expectHaveScreenshot("restore_rooms_restored");
    });

    await test.step("DeleteRooms", async () => {
      await myArchive.archiveEmptyView.gotoRooms();
      await myRooms.roomsTable.checkRowExist(roomCreateTitles.public);
      await myRooms.moveAllRoomsToArchive();
      await myRooms.roomsEmptyView.checkNoRoomsExist();
      await myArchive.open();
      await myArchive.archiveTable.selectAllRows();
      await myArchive.deleteRooms();
      await myArchive.archiveEmptyView.checkNoArchivedRoomsExist();
    });
  });
});

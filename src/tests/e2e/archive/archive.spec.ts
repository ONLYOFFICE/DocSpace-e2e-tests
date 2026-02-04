import MyRooms from "@/src/objects/rooms/Rooms";
import Archive from "@/src/objects/archive/Archive";
import { roomCreateTitles, roomSort } from "@/src/utils/constants/rooms";
import { test } from "@/src/fixtures";

test.describe("Archive", () => {
  let myRooms: MyRooms;
  let myArchive: Archive;

  test.beforeEach(async ({ page, api, login }) => {
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
      await myRooms.roomsFilter.applyRoomsSort(roomSort.name);
    });

    await test.step("ContextMenu", async () => {
      await myArchive.archiveTable.openContextMenuRow(
        myArchive.archiveTable.tableRows.first(),
      );
    });

    await test.step("InfoPanel", async () => {
      await myArchive.infoPanel.open();
      await myArchive.infoPanel.checkInfoPanelExist();
      await myArchive.archiveTable.selectRow(roomCreateTitles.public);
      await myArchive.infoPanel.openTab("History");
      await myArchive.infoPanel.checkHistoryExist("Room moved to Archive");
      await myArchive.infoPanel.hideCreationDateHistory();
      await myArchive.infoPanel.openOptions();
    });

    await test.step("RestoreRooms", async () => {
      await myArchive.restoreRooms();
      await myArchive.archiveEmptyView.checkNoArchivedRoomsExist();
    });

    // Group deletion of rooms from the archive is not supported
    // so this part of the test is temporarily disabled.
    // await test.step("DeleteRooms", async () => {
    //   await myArchive.archiveEmptyView.gotoRooms();
    //   await myRooms.roomsTable.checkRowExist(roomCreateTitles.public);
    //   await myRooms.moveAllRoomsToArchive();
    //   await myRooms.roomsEmptyView.checkNoRoomsExist();
    //   await myArchive.open();
    //   await myArchive.deleteRooms();
    //   await myArchive.archiveEmptyView.checkNoArchivedRoomsExist();
    // });
  });
});

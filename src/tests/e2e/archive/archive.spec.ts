import MyRooms from "@/src/objects/rooms/Rooms";
import Archive from "@/src/objects/archive/Archive";
import { roomCreateTitles, roomSort } from "@/src/utils/constants/rooms";
import { test } from "@/src/fixtures";

test.describe.only("Archive", () => {
  let myRooms: MyRooms;
  let myArchive: Archive;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    myArchive = new Archive(page, api.portalDomain);

    await login.loginToPortal();
  });

  test("Archive rooms", async () => {
    await myRooms.roomsEmptyView.checkNoRoomsExist();
    await myRooms.createRooms();
    await myRooms.moveAllRoomsToArchive();
    await myRooms.roomsEmptyView.checkNoRoomsExist();

    await myArchive.open();
    await myRooms.roomsFilter.applyRoomsSort(roomSort.name);
    await myArchive.archiveTable.checkRowExist(roomCreateTitles.public);
    await myArchive.archiveTable.checkRowExist(roomCreateTitles.collaboration);
    await myArchive.archiveTable.checkRowExist(roomCreateTitles.custom);
  });

  test("Archive info panel", async () => {
    await test.step("Precondition: create rooms and move to archive", async () => {
      await myRooms.roomsEmptyView.checkNoRoomsExist();
      await myRooms.createRooms();
      await myRooms.moveAllRoomsToArchive();
      await myArchive.open();
    });

    await myArchive.infoPanel.open();
    await myArchive.infoPanel.checkInfoPanelExist();
    await myArchive.archiveTable.selectRow(roomCreateTitles.public);
    await myArchive.infoPanel.openTab("History");
    await myArchive.infoPanel.checkHistoryExist("Room moved to Archive");
    await myArchive.infoPanel.hideCreationDateHistory();
    await myArchive.infoPanel.openOptions();
    await myArchive.infoPanel.close();
  });

  test("Restore single room from archive", async () => {
    await test.step("Precondition: create rooms and move to archive", async () => {
      await myRooms.roomsEmptyView.checkNoRoomsExist();
      await myRooms.createRooms();
      await myRooms.moveAllRoomsToArchive();
      await myArchive.open();
    });

    await myArchive.restoreSingleRoom(roomCreateTitles.public);
    await myArchive.archiveTable.checkRowNotExist(roomCreateTitles.public);
    await myArchive.archiveTable.checkRowExist(roomCreateTitles.collaboration);
  });

  test("Delete single room from archive", async () => {
    await test.step("Precondition: create rooms and move to archive", async () => {
      await myRooms.roomsEmptyView.checkNoRoomsExist();
      await myRooms.createRooms();
      await myRooms.moveAllRoomsToArchive();
      await myArchive.open();
    });

    await myArchive.deleteSingleRoom(roomCreateTitles.public);
    await myArchive.archiveTable.checkRowNotExist(roomCreateTitles.public);
    await myArchive.archiveTable.checkRowExist(roomCreateTitles.collaboration);
  });

  test("Restore from archive", async () => {
    await test.step("Precondition: create rooms and move to archive", async () => {
      await myRooms.roomsEmptyView.checkNoRoomsExist();
      await myRooms.createRooms();
      await myRooms.moveAllRoomsToArchive();
      await myArchive.open();
    });

    await myArchive.restoreRooms();
    await myArchive.archiveEmptyView.checkNoArchivedRoomsExist();
  });
});

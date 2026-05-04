import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import MyArchive from "@/src/objects/archive/Archive";
import { roomCreateTitles } from "@/src/utils/constants/rooms";

test.describe("Archive - Bulk actions", () => {
  let myRooms: MyRooms;
  let myArchive: MyArchive;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    myArchive = new MyArchive(page, api.portalDomain);

    await apiSdk.rooms.createRoom("owner", {
      title: roomCreateTitles.public,
      roomType: "PublicRoom",
    });
    await apiSdk.rooms.createRoom("owner", {
      title: roomCreateTitles.collaboration,
      roomType: "EditingRoom",
    });
    await apiSdk.rooms.createRoom("owner", {
      title: roomCreateTitles.custom,
      roomType: "CustomRoom",
    });

    await login.loginToPortal();
    await myRooms.openWithoutEmptyCheck();
    await myRooms.moveAllRoomsToArchive();
    await myArchive.open();
  });

  test("Delete all rooms from archive", async () => {
    await myArchive.deleteRooms();
    await myArchive.archiveEmptyView.checkNoArchivedRoomsExist();
  });

  test("Select multiple rooms in archive and delete", async () => {
    await test.step("Select two rooms and delete from archive", async () => {
      await myArchive.selectRooms([
        roomCreateTitles.public,
        roomCreateTitles.collaboration,
      ]);
      await myArchive.deleteSelectedRooms();
    });

    await test.step("Verify selected rooms deleted, remaining room intact", async () => {
      await myArchive.archiveTable.checkRowNotExist(roomCreateTitles.public);
      await myArchive.archiveTable.checkRowNotExist(
        roomCreateTitles.collaboration,
      );
      await myArchive.archiveTable.checkRowExist(roomCreateTitles.custom);
    });
  });
});

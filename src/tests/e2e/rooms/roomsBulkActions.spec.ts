import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import { roomCreateTitles } from "@/src/utils/constants/rooms";

test.describe("Rooms - Bulk actions", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);

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
  });

  test("Select multiple rooms and pin to top", async () => {
    await test.step("Select two rooms and pin", async () => {
      await myRooms.selectRooms([
        roomCreateTitles.public,
        roomCreateTitles.collaboration,
      ]);
      await myRooms.pinSelectedRooms();
    });

    await test.step("Verify selected rooms are pinned", async () => {
      await myRooms.roomsTable.checkRoomIsPinned(roomCreateTitles.public);
      await myRooms.roomsTable.checkRoomIsPinned(roomCreateTitles.collaboration);
      await myRooms.roomsTable.checkRoomIsNotPinned(roomCreateTitles.custom);
    });
  });

  test("Select multiple rooms and move to archive", async () => {
    await test.step("Select two rooms and move to archive", async () => {
      await myRooms.selectRooms([
        roomCreateTitles.public,
        roomCreateTitles.collaboration,
      ]);
      await myRooms.archiveSelectedRooms();
    });

    await test.step("Verify selected rooms moved to archive", async () => {
      await myRooms.roomsTable.checkRowNotExist(roomCreateTitles.public);
      await myRooms.roomsTable.checkRowNotExist(roomCreateTitles.collaboration);
      await myRooms.roomsTable.checkRowExist(roomCreateTitles.custom);
    });
  });

  test("Select multiple rooms and delete", async () => {
    await test.step("Select two rooms and delete", async () => {
      await myRooms.selectRooms([
        roomCreateTitles.public,
        roomCreateTitles.collaboration,
      ]);
      await myRooms.deleteSelectedRooms();
    });

    await test.step("Verify selected rooms removed, remaining room intact", async () => {
      await myRooms.roomsTable.checkRowNotExist(roomCreateTitles.public);
      await myRooms.roomsTable.checkRowNotExist(roomCreateTitles.collaboration);
      await myRooms.roomsTable.checkRowExist(roomCreateTitles.custom);
    });
  });

  test("Select all rooms and delete", async () => {
    await test.step("Select all rooms and delete", async () => {
      await myRooms.roomsTable.selectAllRows();
      await myRooms.deleteSelectedRooms();
    });

    await test.step("Verify rooms list is empty", async () => {
      await myRooms.roomsEmptyView.checkNoRoomsExist();
    });
  });

  test("Bulk delete only deletes rooms owned by current user", async ({
    api,
    apiSdk,
  }) => {
    await test.step("Precondition: create room owned by another user", async () => {
      await apiSdk.profiles.addMember("owner", "RoomAdmin");
      await api.auth.authenticateRoomAdmin();
      await apiSdk.rooms.createRoom("roomAdmin", {
        title: roomCreateTitles.virtualData,
        roomType: "VirtualDataRoom",
      });
      await myRooms.openWithoutEmptyCheck();
    });

    await test.step("Select owner's room and room admin's room, then delete", async () => {
      await myRooms.selectRooms([
        roomCreateTitles.public,
        roomCreateTitles.virtualData,
      ]);
      await myRooms.deleteSelectedRooms();
    });

    await test.step("Verify only owned room was deleted", async () => {
      await myRooms.roomsTable.checkRowNotExist(roomCreateTitles.public);
      await myRooms.roomsTable.checkRowExist(roomCreateTitles.virtualData);
    });
  });
});

import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import {
  roomCreateTitles,
  roomDialogSource,
} from "@/src/utils/constants/rooms";

test.describe("VDRRooms", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("Create VDR Room smoke", async () => {
    await myRooms.roomsEmptyView.checkNoRoomsExist();

    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.virtualData);
    await myRooms.roomsCreateDialog.fillRoomName("AutoIndexRoom");
    await myRooms.roomsCreateDialog.clickRoomDialogSubmit();

    await myRooms.backToRooms();
    await myRooms.roomsTable.checkRowExist("AutoIndexRoom");

    await myRooms.roomsTable.openRoomByName("AutoIndexRoom");
  });
});

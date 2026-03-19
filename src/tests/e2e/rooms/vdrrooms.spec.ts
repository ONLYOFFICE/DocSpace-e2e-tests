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
    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.virtualData);
    await myRooms.roomsCreateDialog.fillRoomName("AutoVDRTest");

    await myRooms.roomsCreateDialog.toggleAutomaticIndexing(false);
    await myRooms.roomsCreateDialog.toggleAutomaticIndexing(true);

    await myRooms.roomsCreateDialog.toggleRestrictCopyAndDownload(false);
    await myRooms.roomsCreateDialog.toggleRestrictCopyAndDownload(true);

    await myRooms.roomsCreateDialog.toggleFileLifetime(true);
    await myRooms.roomsCreateDialog.setFileLifetimeDays(14);
    await myRooms.roomsCreateDialog.selectFileLifetimeUnit("Years");
    await myRooms.roomsCreateDialog.selectFileLifetimeAction(
      "Delete permanently",
    );

    await myRooms.roomsCreateDialog.toggleWatermarks(true);
    await myRooms.roomsCreateDialog.selectWatermarkType("Viewer info");
    await myRooms.roomsCreateDialog.selectWatermarkElements([
      "username",
      "useremail",
      "roomname",
    ]);
    await myRooms.roomsCreateDialog.setWatermarkStaticText("CONFIDENTIAL");
    await myRooms.roomsCreateDialog.selectWatermarkPosition("Horizontal");

    await myRooms.roomsCreateDialog.clickRoomDialogSubmit();

    await myRooms.openWithoutEmptyCheck();
    await myRooms.roomsTable.checkRowExist("AutoVDRTest");
  });
});

import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import VdrRoomSettings from "@/src/objects/rooms/VdrRoomSettings";
import {
  roomCreateTitles,
  roomDialogSource,
  roomContextMenuOption,
} from "@/src/utils/constants/rooms";

test.describe("VDRRooms", () => {
  let myRooms: MyRooms;
  let vdr: VdrRoomSettings;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    vdr = new VdrRoomSettings(page);
    await login.loginToPortal();
  });

  test("Create VDR Room smoke", async () => {
    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.virtualData);
    await myRooms.roomsCreateDialog.fillRoomName("AutoVDRTest");

    await vdr.toggleAutomaticIndexing(false);
    await vdr.toggleAutomaticIndexing(true);

    await vdr.toggleRestrictCopyAndDownload(false);
    await vdr.toggleRestrictCopyAndDownload(true);

    await vdr.toggleFileLifetime(true);
    await vdr.setFileLifetimeDays(14);
    await vdr.selectFileLifetimeUnit("Years");
    await vdr.selectFileLifetimeAction("Delete permanently");

    await vdr.toggleWatermarks(true);
    await vdr.selectWatermarkType("Viewer info");
    await vdr.selectWatermarkUserName();
    await vdr.selectWatermarkUserEmail();
    await vdr.selectWatermarkRoomName();
    await vdr.setWatermarkStaticText("CONFIDENTIAL");
    await vdr.selectWatermarkPosition("Horizontal");

    await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
    await myRooms.openWithoutEmptyCheck();
    await myRooms.roomsTable.checkRowExist("AutoVDRTest");
  });

  test("Verify default toggle states when creating VDR room", async () => {
    await test.step("Open VDR room creation dialog", async () => {
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.virtualData,
      );
    });

    await test.step("Automatic indexing is enabled by default", async () => {
      await vdr.expectAutomaticIndexingChecked(true);
    });

    await test.step("File lifetime is disabled by default", async () => {
      await vdr.expectFileLifetimeChecked(false);
    });

    await test.step("Restrict copy and download is enabled by default", async () => {
      await vdr.expectRestrictCopyAndDownloadChecked(true);
    });

    await test.step("Watermarks are enabled by default with Viewer info and Diagonal position", async () => {
      await vdr.expectWatermarksChecked(true);
      await vdr.expectWatermarkTypeSelected("Viewer info");
      await vdr.expectWatermarkPosition("Diagonal");
    });
  });

  test("Create VDR room with all options disabled", async () => {
    await test.step("Open dialog and disable all VDR options", async () => {
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.virtualData,
      );
      await myRooms.roomsCreateDialog.fillRoomName("VDR All Off");
      await vdr.toggleAutomaticIndexing(false);
      await vdr.toggleRestrictCopyAndDownload(false);
      await vdr.toggleWatermarks(false);
    });

    await test.step("Create room and verify it exists", async () => {
      await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowExist("VDR All Off");
    });

    await test.step("Open Edit room and verify settings are saved", async () => {
      await myRooms.roomsTable.openContextMenu("VDR All Off");
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.editRoom,
      );
      await vdr.expectAutomaticIndexingChecked(false);
      await vdr.expectRestrictCopyAndDownloadChecked(false);
      await vdr.expectWatermarksChecked(false);
    });
  });

  test("Create VDR room with watermark type Image", async () => {
    await test.step("Configure watermark as Image and upload", async () => {
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.virtualData,
      );
      await vdr.toggleWatermarks(true);
      await vdr.selectWatermarkType("Image");
      await vdr.uploadWatermarkImage("data/avatars/AvatarPNG.png");
    });

    await test.step("Create room and verify it exists", async () => {
      await myRooms.roomsCreateDialog.createRoom("VDR Watermark Image");
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowExist("VDR Watermark Image");
    });

    await test.step("Open Edit room and verify watermark Image is saved", async () => {
      await myRooms.roomsTable.openContextMenu("VDR Watermark Image");
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.editRoom,
      );
      await vdr.expectWatermarksChecked(true);
      await vdr.expectWatermarkTypeSelected("Image");
    });
  });

  test("Create VDR room with file lifetime: 30 days, move expired to trash", async () => {
    await test.step("Configure file lifetime", async () => {
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.virtualData,
      );
      await myRooms.roomsCreateDialog.fillRoomName("VDR Lifetime Days");
      await vdr.toggleFileLifetime(true);
      await vdr.setFileLifetimeDays(30);
      // Days and Move to Trash are selected by default
    });

    await test.step("Create room and verify it exists", async () => {
      await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowExist("VDR Lifetime Days");
    });
  });

  test("Create VDR room with file lifetime: 6 months, delete expired permanently", async () => {
    await test.step("Configure file lifetime", async () => {
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.virtualData,
      );
      await myRooms.roomsCreateDialog.fillRoomName("VDR Lifetime Months");
      await vdr.toggleFileLifetime(true);
      await vdr.setFileLifetimeDays(6);
      await vdr.selectFileLifetimeUnit("Months");
      await vdr.selectFileLifetimeAction("Delete permanently");
    });

    await test.step("Create room and verify it exists", async () => {
      await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowExist("VDR Lifetime Months");
    });

    await test.step("Open Edit room and verify lifetime settings", async () => {
      await myRooms.roomsTable.openContextMenu("VDR Lifetime Months");
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.editRoom,
      );
      await vdr.expectFileLifetimeChecked(true);
    });
  });

  test("Create VDR room with all watermark elements and static text", async () => {
    await test.step("Configure all watermark elements", async () => {
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.virtualData,
      );
      await myRooms.roomsCreateDialog.fillRoomName("VDR All Watermarks");
      await vdr.toggleWatermarks(true);
      await vdr.selectWatermarkType("Viewer info");
      await vdr.selectWatermarkUserName();
      await vdr.selectWatermarkUserEmail();
      await vdr.selectWatermarkUserIpAddress();
      await vdr.selectWatermarkCurrentDate();
      await vdr.selectWatermarkRoomName();
      await vdr.setWatermarkStaticText("TOP SECRET DOCUMENT");
      await vdr.selectWatermarkPosition("Horizontal");
    });

    await test.step("Create room and verify it exists", async () => {
      await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowExist("VDR All Watermarks");
    });

    await test.step("Open Edit room and verify watermark settings", async () => {
      await myRooms.roomsTable.openContextMenu("VDR All Watermarks");
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.editRoom,
      );
      await vdr.expectWatermarksChecked(true);
      await vdr.expectWatermarkTypeSelected("Viewer info");
      await vdr.expectWatermarkPosition("Horizontal");
    });
  });

  test("Create VDR room with tags", async () => {
    await test.step("Create VDR with tags", async () => {
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.virtualData,
      );
      await myRooms.roomsCreateDialog.fillRoomName("VDR Tagged Room");
      await myRooms.roomsCreateDialog.createTag("confidential");
      await myRooms.roomsCreateDialog.createTag("legal");
    });

    await test.step("Create room and verify it exists", async () => {
      await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowExist("VDR Tagged Room");
    });
  });
});

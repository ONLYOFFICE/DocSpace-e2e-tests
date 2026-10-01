import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import VdrRoomSettings from "@/src/objects/rooms/VdrRoomSettings";
import {
  roomCreateTitles,
  roomDialogSource,
  roomContextMenuOption,
} from "@/src/utils/constants/rooms";

test.describe("VDR room: settings", () => {
  let myRooms: MyRooms;
  let vdr: VdrRoomSettings;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    vdr = new VdrRoomSettings(page);
    await login.loginToPortal();
    await myRooms.openWithoutEmptyCheck();
  });

  test("Create VDR Room and navigate into it", async () => {
    await myRooms.roomsEmptyView.checkNoRoomsExist();

    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.virtualData);
    await myRooms.roomsCreateDialog.fillRoomName("AutoIndexRoom");
    await myRooms.roomsCreateDialog.clickRoomDialogSubmit();

    await myRooms.backToRooms();
    await myRooms.roomsTable.checkRowExist("AutoIndexRoom");

    await myRooms.roomsTable.openRoomByName("AutoIndexRoom");
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

  test("Default VDR settings are the same in both creation entry points", async () => {
    await test.step("Precondition: quick-action tiles only exist once a room does", async () => {
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
      await myRooms.roomsCreateDialog.createRoom(roomCreateTitles.public);
      await myRooms.backToRooms();
    });

    await test.step("Defaults via Choose room type", async () => {
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.virtualData,
      );
      await vdr.expectAutomaticIndexingChecked(true);
      await vdr.expectFileLifetimeChecked(false);
      await vdr.expectRestrictCopyAndDownloadChecked(true);
      await vdr.expectWatermarksChecked(true);
      await vdr.expectWatermarkTypeSelected("Viewer info");
      await vdr.expectWatermarkPosition("Diagonal");
      await myRooms.roomsCreateDialog.close();
    });

    await test.step("Defaults via Quick actions match Choose room type", async () => {
      await myRooms.openCreateRoomDialog(
        roomDialogSource.quickActions,
        roomCreateTitles.virtualData,
      );
      await vdr.expectAutomaticIndexingChecked(true);
      await vdr.expectFileLifetimeChecked(false);
      await vdr.expectRestrictCopyAndDownloadChecked(true);
      await vdr.expectWatermarksChecked(true);
      await vdr.expectWatermarkTypeSelected("Viewer info");
      await vdr.expectWatermarkPosition("Diagonal");
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

    await test.step("Open Edit room and verify lifetime settings are saved", async () => {
      await myRooms.roomsTable.openContextMenu("VDR Lifetime Months");
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.editRoom,
      );
      await vdr.expectFileLifetimeChecked(true);
      await vdr.expectFileLifetimeSettings(6, "Months", "Delete permanently");
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

test.describe("VDR room: management", () => {
  let myRooms: MyRooms;
  const VDR_ROOM_NAME = "VDR Management";

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();
    await myRooms.openWithoutEmptyCheck();

    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.virtualData);
    await myRooms.roomsCreateDialog.createRoom(VDR_ROOM_NAME);
    await myRooms.openWithoutEmptyCheck();
  });

  test("Edit VDR room name via context menu", async () => {
    await test.step("Open edit room dialog", async () => {
      await myRooms.roomsTable.openContextMenu(VDR_ROOM_NAME);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.editRoom,
      );
    });

    await test.step("Rename the room", async () => {
      await myRooms.roomsEditDialog.checkDialogTitleExist();
      await myRooms.roomsEditDialog.fillRoomName("VDR Renamed Room");
      await myRooms.roomsEditDialog.clickSaveButton();
    });

    await test.step("Verify room is renamed", async () => {
      await myRooms.roomsTable.checkRowExist("VDR Renamed Room");
    });
  });

  test("Archive VDR room", async () => {
    await test.step("Archive room via context menu", async () => {
      await myRooms.roomsTable.openContextMenu(VDR_ROOM_NAME);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.moveToArchive,
      );
      await myRooms.moveToArchive();
    });

    await test.step("Verify room is no longer in active rooms", async () => {
      await myRooms.roomsTable.checkRowNotExist(VDR_ROOM_NAME);
    });
  });

  test("Pin VDR room to top", async () => {
    await test.step("Pin room via context menu", async () => {
      await myRooms.roomsTable.openContextMenu(VDR_ROOM_NAME);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.pinToTop,
      );
    });

    await test.step("Verify room is pinned", async () => {
      await myRooms.roomsTable.checkRoomPinnedToTopExist();
    });
  });
});

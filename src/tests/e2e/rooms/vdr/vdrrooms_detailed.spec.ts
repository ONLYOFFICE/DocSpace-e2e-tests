import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import VdrRoomSettings from "@/src/objects/rooms/VdrRoomSettings";
import FolderDeleteModal from "@/src/objects/files/FolderDeleteModal";
import {
  roomCreateTitles,
  roomDialogSource,
  roomContextMenuOption,
  vdrRoomContextMenuOption,
} from "@/src/utils/constants/rooms";

test.describe("VDR Room: creation and navigation", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();
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
});

test.describe("VDR Room: index operations", () => {
  let myRooms: MyRooms;
  let vdr: VdrRoomSettings;
  const VDR_ROOM_NAME = "VDR Index Test";

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    vdr = new VdrRoomSettings(page);
    await login.loginToPortal();

    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.virtualData);
    await vdr.toggleAutomaticIndexing(true);
    await myRooms.roomsCreateDialog.createRoom(VDR_ROOM_NAME);
  });

  test("Reorder index after deleting a file", async ({ page }) => {
    const deleteModal = new FolderDeleteModal(page);

    await test.step("Create first document", async () => {
      await vdr.createDocument(myRooms.filesNavigation, "Doc A");
    });

    await test.step("Create second document", async () => {
      await vdr.createDocument(myRooms.filesNavigation, "Doc B");
    });

    await test.step("Create third document", async () => {
      await vdr.createDocument(myRooms.filesNavigation, "Doc C");
    });

    await test.step("Delete the second document to create index gap", async () => {
      const docBRow = page.locator(".table-list-item", { hasText: "Doc B" });
      await docBRow.click({ button: "right" });
      await myRooms.filesTable.contextMenu.clickOption("Delete");
      await deleteModal.clickDeleteFolder();
      await expect(docBRow).not.toBeVisible();
    });

    await test.step("Verify indices have a gap (1, 3)", async () => {
      await vdr.expectIndexValue(0, "1");
      await vdr.expectIndexValue(1, "3");
    });

    await test.step("Open Edit index and click Reorder", async () => {
      await myRooms.filesNavigation.openContextMenu();
      await myRooms.filesNavigation.contextMenu.clickOption(
        vdrRoomContextMenuOption.editIndex,
      );
      await vdr.expectIndexToolbarVisible();
      await vdr.clickReorderIndex();
    });

    await test.step("Apply reordered index", async () => {
      await vdr.clickApplyIndex();
    });

    await test.step("Verify indices are sequential (1, 2)", async () => {
      await vdr.expectIndexValue(0, "1");
      await vdr.expectIndexValue(1, "2");
    });
  });

  test("Export room index", async () => {
    await test.step("Export room index via More options", async () => {
      const download = await myRooms.waitForDownload(async () => {
        await myRooms.filesNavigation.openContextMenu();
        await myRooms.filesNavigation.contextMenu.clickSubmenuOption(
          vdrRoomContextMenuOption.moreOptions,
          vdrRoomContextMenuOption.exportRoomIndex,
        );
      });
      expect(download.suggestedFilename()).toBeTruthy();
      await download.delete();
    });
  });
});

test.describe("VDR Room: room management", () => {
  let myRooms: MyRooms;
  const VDR_ROOM_NAME = "VDR Management";

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();

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

  test("Duplicate VDR room", async () => {
    await test.step("Duplicate room via context menu", async () => {
      await myRooms.roomsTable.openContextMenu(VDR_ROOM_NAME);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.manage,
      );
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.duplicate,
      );
    });

    await test.step("Verify duplicated room exists", async () => {
      await myRooms.roomsTable.checkRowExist(VDR_ROOM_NAME);
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

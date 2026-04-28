import MyRooms from "@/src/objects/rooms/Rooms";
import {
  roomContextMenuOption,
  roomCreateTitles,
  roomDialogSource,
  roomToastMessages,
} from "@/src/utils/constants/rooms";
import { test } from "@/src/fixtures";
import { Page } from "@playwright/test";

test.describe("Rooms", () => {
  let myRooms: MyRooms;
  let page: Page;

  const duplicateRoomName = roomCreateTitles.public + " (1)";

  test.beforeEach(async ({ page: fixturePage, api, login }) => {
    page = fixturePage;
    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
  });

  test("Open create room dialog from different entry points", async () => {
    await myRooms.open();

    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await myRooms.roomsCreateDialog.close();

    await myRooms.openCreateRoomDialog(roomDialogSource.emptyView);
    await myRooms.roomsCreateDialog.close();

    await myRooms.openCreateRoomDialog(roomDialogSource.article);

    await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.formFilling);
    await myRooms.roomsTypeDropdown.openRoomTypeDropdown();
    await myRooms.roomsTypeDropdown.selectRoomTypeByTitle(
      roomCreateTitles.public,
    );
    await myRooms.roomsCreateDialog.clickBackArrow();
    await page.mouse.dblclick(1, 1);
  });

  test("Create all room types", async () => {
    await myRooms.openWithoutEmptyCheck();
    await myRooms.createRooms();
    await myRooms.infoPanel.close();

    await myRooms.roomsTable.checkRowExist(roomCreateTitles.public);
    await myRooms.roomsTable.checkRowExist(roomCreateTitles.formFilling);
    await myRooms.roomsTable.checkRowExist(roomCreateTitles.collaboration);
    await myRooms.roomsTable.checkRowExist(roomCreateTitles.virtualData);
    await myRooms.roomsTable.checkRowExist(roomCreateTitles.custom);
  });

  test("Invite contacts", async () => {
    await test.step("Precondition: create public room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
      await myRooms.roomsCreateDialog.createRoom(roomCreateTitles.public);
      await myRooms.backToRooms();
    });

    await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
    await myRooms.roomsTable.clickContextMenuOption(
      roomContextMenuOption.inviteContacts,
    );
    await myRooms.inviteDialog.checkInviteTitleExist();
    await myRooms.inviteDialog.openAccessOptions();
    await myRooms.inviteDialog.close();
  });

  test("Open change room owner dialog", async () => {
    await test.step("Precondition: create public room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
      await myRooms.roomsCreateDialog.createRoom(roomCreateTitles.public);
      await myRooms.backToRooms();
    });

    await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
    await myRooms.roomsTable.contextMenu.clickSubmenuOption(
      roomContextMenuOption.manage,
      roomContextMenuOption.changeTheRoomOwner,
    );
    await myRooms.roomsChangeOwnerDialog.checkNoMembersFoundExist();
    await myRooms.roomsChangeOwnerDialog.close();
  });

  test("Disable room notifications", async () => {
    await test.step("Precondition: create public room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
      await myRooms.roomsCreateDialog.createRoom(roomCreateTitles.public);
      await myRooms.backToRooms();
    });

    await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
    await myRooms.roomsTable.clickContextMenuOption(
      roomContextMenuOption.disableNotifications,
    );
    await myRooms.removeToast(roomToastMessages.notifyDisabled);
  });

  test("Pin room to top", async () => {
    await test.step("Precondition: create public room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
      await myRooms.roomsCreateDialog.createRoom(roomCreateTitles.public);
      await myRooms.backToRooms();
    });

    await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
    await myRooms.roomsTable.clickContextMenuOption(
      roomContextMenuOption.pinToTop,
    );
    await myRooms.removeToast(roomToastMessages.pinned);
    await myRooms.roomsTable.checkRoomPinnedToTopExist();
  });

  test("Rename room", async () => {
    await test.step("Precondition: create rooms", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.createRooms();
      await myRooms.infoPanel.close();
    });

    await myRooms.roomsTable.openContextMenu(roomCreateTitles.custom);
    await myRooms.roomsTable.clickContextMenuOption(
      roomContextMenuOption.manage,
    );
    await myRooms.roomsTable.clickContextMenuOption(
      roomContextMenuOption.editRoom,
    );
    await myRooms.roomsEditDialog.checkDialogTitleExist();
    await myRooms.roomsEditDialog.fillRoomName("Edited room");
    await myRooms.roomsEditDialog.clickSaveButton();
    await myRooms.roomsTable.checkRowExist("Edited room");
  });

  test("Duplicate room", async () => {
    await test.step("Precondition: create public room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
      await myRooms.roomsCreateDialog.createRoom(roomCreateTitles.public);
      await myRooms.backToRooms();
    });

    await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
    await myRooms.roomsTable.clickContextMenuOption(
      roomContextMenuOption.manage,
    );
    await myRooms.roomsTable.clickContextMenuOption(
      roomContextMenuOption.duplicate,
    );
    await myRooms.removeToast(
      roomToastMessages.duplicate(roomCreateTitles.public),
    );
    await myRooms.roomsTable.checkRowExist(duplicateRoomName);
  });

  test("Move to archive", async () => {
    await test.step("Precondition: create public room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
      await myRooms.roomsCreateDialog.createRoom(roomCreateTitles.public);
      await myRooms.backToRooms();
    });

    await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
    await myRooms.roomsTable.clickContextMenuOption(
      roomContextMenuOption.moveToArchive,
    );
    await myRooms.moveToArchive();
    await myRooms.removeToast(
      roomToastMessages.roomArchived(roomCreateTitles.public),
    );
    await myRooms.roomsTable.checkRowNotExist(roomCreateTitles.public);
  });

  test("Info panel", async () => {
    await test.step("Precondition: create rooms", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.createRooms();
      await myRooms.infoPanel.close();
    });

    await myRooms.infoPanel.open();
    await myRooms.roomsTable.selectRow(roomCreateTitles.public);

    await myRooms.infoPanel.openTab("Details");
    await myRooms.infoPanel.hideDatePropertiesDetails();
    await myRooms.infoPanel.checkRoomProperties(roomCreateTitles.public);

    await myRooms.infoPanel.openOptions();
    await myRooms.infoPanel.closeMenu();

    await myRooms.infoPanel.openTab("History");
    await myRooms.infoPanel.checkHistoryExist("room created");
    await myRooms.infoPanel.hideCreationDateHistory();

    await myRooms.infoPanel.openTab("Contacts");
    await myRooms.infoPanel.close();
  });

  test("View and sort", async () => {
    await test.step("Precondition: create rooms", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.createRooms();
      await myRooms.infoPanel.close();
    });

    await myRooms.roomsFilter.switchToThumbnailView();
    await myRooms.roomsFilter.switchToCompactView();

    await myRooms.roomsFilter.openDropdownSortBy();
    await myRooms.roomsFilter.selectSortByType();
  });

  test("Search", async () => {
    await test.step("Precondition: create rooms", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.createRooms();
      await myRooms.infoPanel.close();
    });

    await myRooms.roomsFilter.fillRoomsSearchInputAndCheckRequest(
      roomCreateTitles.collaboration,
    );
    await myRooms.roomsTable.checkRowExist(roomCreateTitles.collaboration);
    await myRooms.roomsFilter.clearSearchText();
    await myRooms.roomsTable.checkRowExist(roomCreateTitles.public);

    await myRooms.roomsFilter.fillRoomsSearchInputAndCheckRequest(
      "empty view search",
    );
    await myRooms.roomsFilter.checkEmptyViewExist();
    await myRooms.roomsFilter.clearSearchText();
    await myRooms.roomsTable.checkRowExist(roomCreateTitles.public);
  });

  test("Room cover - Create room with cover color and icon", async () => {
    await myRooms.roomsArticle.openCreateDialog();
    await myRooms.roomsCreateDialog.openRoomType(
      roomCreateTitles.collaboration,
    );
    await myRooms.roomsCreateDialog.openRoomCover();
    await myRooms.roomsCreateDialog.selectCoverColor();
    await myRooms.roomsCreateDialog.selectCoverIcon();
    await myRooms.roomsCreateDialog.saveCover();
    await myRooms.roomsCreateDialog.createRoom(roomCreateTitles.collaboration);
    await myRooms.roomsEmptyView.checkEmptyRoomExist(
      roomCreateTitles.collaboration,
    );
  });

  test("Table settings", async () => {
    await myRooms.openWithoutEmptyCheck();
    await myRooms.openRoomsTab();
    await myRooms.createRooms();
    await myRooms.infoPanel.close();

    await myRooms.roomsTable.openTableSettings();
    await myRooms.roomsTable.expectColumnVisible("Tags");
    await myRooms.roomsTable.expectColumnVisible("Last activity");

    await myRooms.roomsTable.setColumnVisible("Type");
    await myRooms.roomsTable.setColumnVisible("Owner");

    await myRooms.roomsTable.setColumnNotVisible("Tags");
    await myRooms.roomsTable.setColumnNotVisible("Last activity");
    await myRooms.roomsTable.setColumnNotVisible("Type");
    await myRooms.roomsTable.setColumnNotVisible("Owner");

    await myRooms.roomsTable.setColumnVisible("Tags");
    await myRooms.roomsTable.setColumnVisible("Last activity");
    await myRooms.roomsTable.closeTableSettings();
  });
});

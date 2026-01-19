import MyRooms from "@/src/objects/rooms/Rooms";
import {
  roomContextMenuOption,
  roomCreateTitles,
  roomDialogSource,
  roomTemplateTitles,
  roomToastMessages,
  templateContextMenuOption,
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

  test("Render", async () => {
    await test.step("Render", async () => {
      await myRooms.roomsEmptyView.checkNoRoomsExist();
    });

    await test.step("OpenCreateDialog", async () => {
      // FromNavigation
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.close();

      // FromEmptyView
      await myRooms.openCreateRoomDialog(roomDialogSource.emptyView);
      await myRooms.roomsCreateDialog.close();

      // FromArticle
      await myRooms.openCreateRoomDialog(roomDialogSource.article);
    });

    await test.step("RoomTypesDropdown", async () => {
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.formFilling,
      );
      await myRooms.roomsTypeDropdown.openRoomTypeDropdown();

      await myRooms.roomsTypeDropdown.selectRoomTypeByTitle(
        roomCreateTitles.public,
      );
      await myRooms.roomsCreateDialog.clickBackArrow();
      await page.mouse.dblclick(1, 1); // close all dialogs
    });

    await test.step("Create Rooms", async () => {
      await myRooms.createRooms();
      await myRooms.infoPanel.close();
    });

    await test.step("CreateTemplateOfTheRoom", async () => {
      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);

      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.manage,
      );
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.saveAsTemplate,
      );

      await myRooms.roomsCreateDialog.createPublicRoomTemplate();
      // await myRooms.removeToast(
      //   roomToastMessages.templateSaved(roomTemplateTitles.roomTemplate),
      // );
      // Temporary workaround: until bug is fixed.
      await myRooms.openTemplatesTab();
      // await myRooms.roomsEmptyView.checkEmptyRoomExist(roomCreateTitles.public);
      // await myRooms.backToRooms();
      await myRooms.roomsTable.checkRowExist(roomTemplateTitles.roomTemplate);
      await myRooms.infoPanel.close();
      await myRooms.roomsTable.hideLastActivityColumn();
    });

    await test.step("CreateRoomFromTemplate", async () => {
      await myRooms.roomsTable.openContextMenu(roomTemplateTitles.roomTemplate);
      await myRooms.roomsTable.clickContextMenuOption(
        templateContextMenuOption.createRoom,
      );
      await myRooms.roomsCreateDialog.createPublicRoomFromTemplate();
      await myRooms.removeToast(
        roomToastMessages.baseOnTemplateCreated(
          roomTemplateTitles.fromTemplate,
        ),
      );
      await myRooms.roomsEmptyView.checkEmptyRoomExist(roomCreateTitles.public);

      await myRooms.backToRooms();
      await myRooms.roomsTable.checkRowExist(roomTemplateTitles.fromTemplate);
      await myRooms.infoPanel.close();
    });

    await test.step("InviteContacts", async () => {
      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.inviteContacts,
      );
      await myRooms.inviteDialog.checkInviteTitleExist();
      await myRooms.inviteDialog.openAccessOptions();
      await myRooms.inviteDialog.close();
    });

    await test.step("ChangeTheRoomOwner", async () => {
      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.manage,
      );
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.changeTheRoomOwner,
      );
      await myRooms.roomsChangeOwnerDialog.checkNoMembersFoundExist();
      await myRooms.roomsChangeOwnerDialog.close();
    });

    await test.step("EditRoom", async () => {
      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.disableNotifications,
      );
      await myRooms.removeToast(roomToastMessages.notifyDisabled);

      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.pinToTop,
      );
      await myRooms.removeToast(roomToastMessages.pinned);
      await myRooms.roomsTable.checkRoomPinnedToTopExist();

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

    await test.step("DuplicateRoom", async () => {
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

    await test.step("MoveToArchive", async () => {
      await myRooms.roomsTable.openContextMenu(duplicateRoomName);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.moveToArchive,
      );
      await myRooms.moveToArchive();
      await myRooms.removeToast(
        roomToastMessages.roomArchived(duplicateRoomName),
      );
      await myRooms.roomsTable.checkRowNotExist(duplicateRoomName);
    });

    await test.step("AccessSettings", async () => {
      await myRooms.openTemplatesTab();
      await myRooms.roomsTable.checkRowExist(roomTemplateTitles.roomTemplate);
      await myRooms.roomsTable.openContextMenu(roomTemplateTitles.roomTemplate);
      await myRooms.roomsTable.clickContextMenuOption(
        templateContextMenuOption.accessSettings,
      );
      await myRooms.roomsAccessSettingsDialog.checkAccessSettingsTitleExist();
      await myRooms.roomsAccessSettingsDialog.close();
    });

    await test.step("InfoPanel", async () => {
      await myRooms.infoPanel.open();
      await myRooms.roomsTable.selectRow(roomTemplateTitles.roomTemplate);
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.hideDatePropertiesDetails();
      await myRooms.infoPanel.checkRoomProperties(roomCreateTitles.public);

      await myRooms.infoPanel.openOptions();
      await myRooms.infoPanel.closeMenu();

      // Temporarily disabled; will be re-enabled once the selector issue is resolved
      // await myRooms.infoPanel.openTab("Accesses");
      // await myRooms.infoPanel.checkAccessesExist();
      // await myRooms.infoPanel.close();

      await myRooms.openRoomsTab();
      await myRooms.roomsTable.checkRowExist(roomCreateTitles.public);
      await myRooms.roomsTable.selectRow(roomCreateTitles.public);
      await myRooms.infoPanel.open();
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

    await test.step("View", async () => {
      await myRooms.roomsFilter.switchToThumbnailView();
      await myRooms.roomsFilter.switchToCompactView();
    });

    await test.step("Sort", async () => {
      await myRooms.roomsFilter.openDropdownSortBy();
      await myRooms.roomsFilter.selectSortByType();
    });

    await test.step("Search", async () => {
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

    await test.step("EmptyView", async () => {
      // Rooms
      await myRooms.moveAllRoomsToArchive();
      await myRooms.roomsEmptyView.checkNoRoomsExist();

      // Templates
      await myRooms.openTemplatesTab();
      await myRooms.roomsTable.checkRowExist(roomTemplateTitles.roomTemplate);
      await myRooms.deleteAllRooms();
      await myRooms.roomsEmptyView.checkNoTemplatesExist();
    });
  });
});

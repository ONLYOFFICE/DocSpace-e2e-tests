import MyRooms from "@/src/objects/rooms/Rooms";
import Screenshot from "@/src/objects/common/Screenshot";
import {
  roomContextMenuOption,
  roomCreateTitles,
  roomDialogSource,
  roomTemplateTitles,
  templateContextMenuOption,
} from "@/src/utils/constants/rooms";
import { test } from "@/src/fixtures";
import { Page } from "@playwright/test";

test.describe("Rooms", () => {
  let screenshot: Screenshot;
  let myRooms: MyRooms;
  let page: Page;

  test.beforeEach(async ({ page: fixturePage, api, login }) => {
    page = fixturePage;
    screenshot = new Screenshot(page, { screenshotDir: "rooms" });
    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
  });

  test("Render", async () => {
    await test.step("Render", async () => {
      await myRooms.roomsEmptyView.checkNoRoomsExist();
      await screenshot.expectHaveScreenshot("render");
    });

    await test.step("OpenCreateDialog", async () => {
      // FromNavigation
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await screenshot.expectHaveScreenshot("open_create_dialog_navigation");
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
      await screenshot.expectHaveScreenshot("room_types_dropdown");

      await myRooms.roomsTypeDropdown.selectRoomTypeByTitle(
        roomCreateTitles.public,
      );
      await myRooms.roomsCreateDialog.clickBackArrow();

      await myRooms.roomsCreateDialog.openAndValidateRoomTypes(screenshot);
    });

    await test.step("CreateCommonRooms", async () => {
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
      await myRooms.roomsCreateDialog.openRoomIconDropdown();
      await screenshot.expectHaveScreenshot(
        "create_common_rooms_icon_dropdown",
      );

      await myRooms.roomsCreateDialog.openRoomCover();
      await screenshot.expectHaveScreenshot("create_common_rooms_cover");
      await page.mouse.dblclick(1, 1); // close all dialogs

      await myRooms.createRooms();
      await myRooms.infoPanel.close();
      await myRooms.roomsTable.hideLastActivityColumn();
    });

    await test.step("CreateTemplateOfTheRoom", async () => {
      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
      await screenshot.expectHaveScreenshot(
        "create_template_of_the_room_context_menu",
      );

      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.saveAsTemplate,
      );
      await screenshot.expectHaveScreenshot(
        "create_template_of_the_room_save_as_template",
      );

      await myRooms.roomsCreateDialog.createPublicRoomTemplate();
      await myRooms.roomsEmptyView.checkEmptyRoomExist(roomCreateTitles.public);
      await myRooms.backToRooms();
      await myRooms.roomsTable.checkRowExist(roomTemplateTitles.roomTemplate);
      await myRooms.infoPanel.close();
      await myRooms.roomsTable.hideLastActivityColumn();
      await screenshot.expectHaveScreenshot(
        "create_template_of_the_room_created",
      );
    });

    await test.step("CreateRoomFromTemplate", async () => {
      await myRooms.roomsTable.openContextMenu(roomTemplateTitles.roomTemplate);
      await myRooms.roomsTable.clickContextMenuOption(
        templateContextMenuOption.createRoom,
      );
      await myRooms.roomsCreateDialog.createPublicRoomFromTemplate();
      await myRooms.roomsEmptyView.checkEmptyRoomExist(roomCreateTitles.public);

      await myRooms.backToRooms();
      await myRooms.roomsTable.checkRowExist(roomTemplateTitles.fromTemplate);
      await myRooms.infoPanel.close();
      await screenshot.expectHaveScreenshot(
        "create_room_from_template_created",
      );
    });

    await test.step("InviteContacts", async () => {
      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.inviteContacts,
      );
      await myRooms.inviteDialog.checkInviteTitleExist();
      await myRooms.inviteDialog.openAccessOptions();
      await screenshot.expectHaveScreenshot("invite_contacts_dialog");
      await myRooms.inviteDialog.close();
    });

    await test.step("ChangeTheRoomOwner", async () => {
      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.changeTheRoomOwner,
      );
      await myRooms.roomsChangeOwnerDialog.checkNoMembersFoundExist();
      await screenshot.expectHaveScreenshot("change_the_room_owner_no_members");
      await myRooms.roomsChangeOwnerDialog.close();
    });

    await test.step("EditRoom", async () => {
      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.disableNotifications,
      );

      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.pinToTop,
      );
      await myRooms.roomsTable.checkRoomPinnedToTopExist();

      await myRooms.roomsTable.openContextMenu(roomCreateTitles.custom);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.editRoom,
      );
      await myRooms.roomsEditDialog.checkDialogExist();
      await screenshot.expectHaveScreenshot("edit_room_dialog");
      await myRooms.roomsEditDialog.fillRoomName("Edited room");
      await myRooms.roomsEditDialog.clickSaveButton();
      await myRooms.roomsTable.checkRowExist("Edited room");
    });

    await test.step("DuplicateRoom", async () => {
      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.duplicate,
      );
      await myRooms.roomsTable.checkRowExist(roomCreateTitles.public + " (1)");
    });

    await test.step("MoveToArchive", async () => {
      await myRooms.roomsTable.openContextMenu(
        roomCreateTitles.public + " (1)",
      );
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.moveToArchive,
      );
      await myRooms.moveToArchive();
      await myRooms.roomsTable.checkRowNotExist(
        roomCreateTitles.public + " (1)",
      );
    });

    await test.step("AccessSettings", async () => {
      await myRooms.openTemplatesTab();
      await myRooms.roomsTable.checkRowExist(roomTemplateTitles.roomTemplate);
      await myRooms.roomsTable.openContextMenu(roomTemplateTitles.roomTemplate);
      await myRooms.roomsTable.clickContextMenuOption(
        templateContextMenuOption.accessSettings,
      );
      await myRooms.roomsAccessSettingsDialog.checkAccessSettingsTitleExist();
      await screenshot.expectHaveScreenshot("access_settings_dialog");
      await myRooms.roomsAccessSettingsDialog.close();
    });

    await test.step("InfoPanel", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.checkNoItemTextExist();
      await screenshot.expectHaveScreenshot("info_panel_empty");
      await myRooms.roomsTable.selectRow(roomTemplateTitles.roomTemplate);
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.hideDatePropertiesDetails();
      await myRooms.infoPanel.checkRoomProperties(roomCreateTitles.public);
      await screenshot.expectHaveScreenshot("info_panel_template_details");

      await myRooms.infoPanel.openOptions();
      await screenshot.expectHaveScreenshot(
        "info_panel_template_options_opened",
      );
      await myRooms.infoPanel.closeMenu();

      await myRooms.infoPanel.openTab("Accesses");
      await myRooms.infoPanel.checkAccessesExist();
      await screenshot.expectHaveScreenshot("info_panel_template_accesses");
      await myRooms.infoPanel.close();

      await myRooms.openRoomsTab();
      await myRooms.roomsTable.checkRowExist(roomCreateTitles.public);
      await myRooms.roomsTable.selectRow(roomCreateTitles.public);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.hideDatePropertiesDetails();
      await myRooms.infoPanel.checkRoomProperties(roomCreateTitles.public);
      await screenshot.expectHaveScreenshot("info_panel_room_details");

      await myRooms.infoPanel.openOptions();
      await screenshot.expectHaveScreenshot("info_panel_room_options_opened");
      await myRooms.infoPanel.closeMenu();

      await myRooms.infoPanel.openTab("History");
      await myRooms.infoPanel.checkHistoryExist("room created");
      await myRooms.infoPanel.hideCreationDateHistory();
      await screenshot.expectHaveScreenshot("info_panel_room_history");

      await myRooms.infoPanel.openTab("Contacts");
      await screenshot.expectHaveScreenshot("info_panel_room_contacts");
      await myRooms.infoPanel.close();
    });

    await test.step("View", async () => {
      await myRooms.roomsFilter.switchToThumbnailView();
      await screenshot.expectHaveScreenshot("view_thumbnail");
      await myRooms.roomsFilter.switchToCompactView();
    });

    await test.step("Sort", async () => {
      await myRooms.roomsFilter.openDropdownSortBy();
      await screenshot.expectHaveScreenshot("sort_dropdown");
      await myRooms.roomsFilter.clickSortByType();
      await screenshot.expectHaveScreenshot("sort_by_type");
    });

    await test.step("Filter", async () => {
      await myRooms.roomsFilter.openFilterDialog();
      await screenshot.expectHaveScreenshot("filter_dialog");
      await myRooms.roomsFilter.selectFilterByPublic();
      await myRooms.roomsFilter.applyFilter();
      await screenshot.expectHaveScreenshot("filter_by_public");
      await myRooms.roomsFilter.clearFilterByPublic();
    });

    await test.step("Search", async () => {
      // ALERT: Bug on backend, wait until it's fixed
      // await myRooms.roomsFilter.fillRoomsSearchInputAndCheckRequest(
      //   roomCreateTitles.collaboration,
      // );
      // await myRooms.roomsTable.checkRoomExist(roomCreateTitles.collaboration);
      // await screenshot.expectHaveScreenshot("search_collaboration_room");
      // await myRooms.roomsFilter.clearSearchText();

      await myRooms.roomsFilter.fillRoomsSearchInputAndCheckRequest(
        "empty view search",
      );
      await myRooms.roomsFilter.checkEmptyViewExist();
      await screenshot.expectHaveScreenshot("search_empty");
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
      await screenshot.expectHaveScreenshot("empty_view_templates");
    });
  });
});

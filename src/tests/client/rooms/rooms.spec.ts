import MyRooms from "@/src/objects/rooms/Rooms";
import Screenshot from "@/src/objects/common/Screenshot";
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
  let screenshot: Screenshot;
  let myRooms: MyRooms;
  let page: Page;

  const duplicateRoomName = roomCreateTitles.public + " (1)";

  test.beforeEach(async ({ page: fixturePage, api, login }) => {
    page = fixturePage;
    screenshot = new Screenshot(page, {
      screenshotDir: "rooms",
      suiteName: "rooms",
    });
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

 //Rooms cover change color tests starts here
      await myRooms.roomsCreateDialog.setRoomCoverColor('#FF6680');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_color_red");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#FF8F40');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_color_orange");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#F2D230');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_color_yellow");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#61C059');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_color_green");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#1FCECB');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_color_cyan");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#5CC3F7');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_color_light_blue");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#7757D9');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_color_purple");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#FF7FD4');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_color_pink");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#6191F2');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_color_blue");
      

//Rooms cover change logo icon tests starts here

      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-suitcase');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_suitcase");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-schedule');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_schedule");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-flag');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_flag");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-film');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_film");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-hash');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_hash");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-feather');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_feather");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-house');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_house");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-life_buoy');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_life_buoy");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-mail');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_mail");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-face_1');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_face_1");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-anchor');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_anchor");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-img');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_img");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-zap');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_zap");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-share');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_share");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-umbrella');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_umbrella");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-package');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_package");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-label');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_label");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-shield');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_shield");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-telephone');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_telephone");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-star');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_star");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-heart');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_heart");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-comment_1');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_comment_1");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-planet');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_planet");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-loupe');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_loupe");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-human');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_human");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-file_3');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_file_3");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-cart');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_cart");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-percent');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_percent");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-video_camera');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_video_camera");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-medal');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_medal");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-cloud');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_cloud");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-truck');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_truck");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-lock_security');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_lock_security");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-book_open');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_book_open");
      await myRooms.roomsCreateDialog.setRoomCoverColor('[id="cover-icon-check mark"]');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_check_mark");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-comment_2');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_comment_2");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-folder');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_folder");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-layers');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_layers");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-file_empty');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_file_empty");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-dollar');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_dollar");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-bookmark');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_bookmark");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-calendar');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_calendar");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-archive');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_archive");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-face_3');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_face_3");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-file_1');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_file_1");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-headphones');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_headphones");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-face_2');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_face_2");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-gift');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_gift");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-bell');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_bell");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-watch');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_watch");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-camera');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_camera");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-pen');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_pen");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-clipboard');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_clipboard");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-sliders');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_sliders");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-file_2');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_file_2");
      await myRooms.roomsCreateDialog.setRoomCoverColor('#cover-icon-map');
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_map");
      await myRooms.roomsCreateDialog.setRoomCoverWithoutIcon();
      await screenshot.expectHaveScreenshot("create_common_rooms_cover_icon_without_icon");

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
      await myRooms.removeToast(
        roomToastMessages.templateSaved(roomTemplateTitles.roomTemplate),
      );
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
      await myRooms.removeToast(
        roomToastMessages.baseOnTemplateCreated(
          roomTemplateTitles.fromTemplate,
        ),
      );
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
      await myRooms.removeToast(roomToastMessages.notifyDisabled);

      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.pinToTop,
      );
      await myRooms.removeToast(roomToastMessages.pinned);
      await myRooms.roomsTable.checkRoomPinnedToTopExist();

      await myRooms.roomsTable.openContextMenu(roomCreateTitles.custom);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.editRoom,
      );
      await myRooms.roomsEditDialog.checkDialogTitleExist();
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
      await myRooms.roomsFilter.selectSortByType();
      await screenshot.expectHaveScreenshot("sort_by_type");
    });

    await test.step("Search", async () => {
      await myRooms.roomsFilter.fillRoomsSearchInputAndCheckRequest(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsTable.checkRowExist(roomCreateTitles.collaboration);
      await screenshot.expectHaveScreenshot("search_collaboration_room");
      await myRooms.roomsFilter.clearSearchText();
      await myRooms.roomsTable.checkRowExist(roomCreateTitles.public);

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

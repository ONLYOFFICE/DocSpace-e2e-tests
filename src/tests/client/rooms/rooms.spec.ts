import { test, Page } from "@playwright/test";

import API from "@/src/api";
import Login from "@/src/objects/common/Login";
import MyRooms from "@/src/objects/rooms/Rooms";
import Screenshot from "@/src/objects/common/Screenshot";
import {
  roomContextMenuOption,
  roomCreateTitles,
  roomDialogSource,
  templateContextMenuOption,
} from "@/src/utils/constants/rooms";

/**
 * Test suite for My Rooms functionality
 * Tests various aspects of room management including creation, templates, and UI interactions
 */
test.describe("Rooms", () => {
  let api: API;
  let page: Page;

  let login: Login;
  let screenshot: Screenshot;

  let myRooms: MyRooms;

  test.beforeAll(async ({ playwright, browser }) => {
    const apiContext = await playwright.request.newContext();
    api = new API(apiContext);
    await api.setup();
    console.log(api.portalDomain);

    page = await browser.newPage();

    await page.addInitScript(() => {
      globalThis.localStorage?.setItem("integrationUITests", "true");
    });

    login = new Login(page, api.portalDomain);
    screenshot = new Screenshot(page, "rooms");

    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
    await myRooms.open();
  });

  test.beforeEach(async ({}, testInfo) => {
    await screenshot.setCurrentTestInfo(testInfo);
  });

  test("Render", async () => {
    await myRooms.roomsEmptyView.checkNoRoomsExist();
    await screenshot.expectHaveScreenshot();
  });

  /**
   * Tests the functionality of opening the room creation dialog from different sources
   * Verifies that the dialog can be opened from navigation, empty view, and article
   */
  test("OpenCreateDialog", async () => {
    await myRooms.roomsEmptyView.checkNoRoomsExist();
    await test.step("FromNavigation", async () => {
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.close();
    });

    await test.step("FromEmptyView", async () => {
      await myRooms.openCreateRoomDialog(roomDialogSource.emptyView);
      await screenshot.expectHaveScreenshot("view_dialog");
      await myRooms.roomsCreateDialog.close();
    });

    await test.step("FromArticle", async () => {
      await myRooms.openCreateRoomDialog(roomDialogSource.article);
    });
  });

  /**
   * Tests the room types dropdown functionality
   * Verifies that different room types can be selected and the dropdown UI works correctly
   */
  test("RoomTypesDropdown", async () => {
    await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.formFilling);
    await myRooms.roomsTypeDropdown.openRoomTypeDropdown();
    await screenshot.expectHaveScreenshot();

    await myRooms.roomsTypeDropdown.selectRoomTypeByTitle(
      roomCreateTitles.public,
    );
    await myRooms.roomsCreateDialog.clickBackArrow();

    await myRooms.roomsCreateDialog.openAndValidateRoomTypes(screenshot);
  });

  /**
   * Tests the room creation functionality including:
   * - Creating common rooms with different settings
   * - Saving rooms as templates
   * - Creating rooms from templates
   */

  test("CreateRooms", async () => {
    await test.step("CommonRooms", async () => {
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
      await myRooms.roomsCreateDialog.openRoomIconDropdown();
      await screenshot.expectHaveScreenshot("room_icon_dropdown");

      await myRooms.roomsCreateDialog.openRoomCover();
      await screenshot.expectHaveScreenshot("room_cover");
      await page.mouse.dblclick(1, 1); // close all dialogs

      await myRooms.createRooms();
      await myRooms.infoPanel.close();
      await myRooms.roomsTable.hideLastActivityColumn();
    });

    await test.step("TemplateOfTheRoom", async () => {
      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
      await screenshot.expectHaveScreenshot("opened_context_menu_room");

      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.saveAsTemplate,
      );
      await screenshot.expectHaveScreenshot("save_as_template");

      await myRooms.roomsCreateDialog.createRoomTemplate();
      await myRooms.roomsEmptyView.checkEmptyRoomExist(roomCreateTitles.public);
      await myRooms.backToRooms();
      await myRooms.checkHeadingExist("Templates");
      await myRooms.infoPanel.close();
      await myRooms.roomsTable.hideLastActivityColumn();
      await screenshot.expectHaveScreenshot("created_template");
    });

    await test.step("RoomFromTemplate", async () => {
      await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
      await myRooms.roomsTable.clickContextMenuOption(
        templateContextMenuOption.createRoom,
      );
      await myRooms.roomsCreateDialog.checkDialogExist();
      await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
      await myRooms.roomsEmptyView.checkEmptyRoomExist(roomCreateTitles.public);
    });

    await myRooms.backToRooms();
    await myRooms.infoPanel.close();
    await screenshot.expectHaveScreenshot("created_rooms");
  });

  /**
   * Tests the empty view states for both rooms and templates
   * Verifies that appropriate empty state messages and UI are displayed
   */
  test("InviteContacts", async () => {
    await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
    await myRooms.roomsTable.clickContextMenuOption(
      roomContextMenuOption.inviteContacts,
    );
    await myRooms.inviteDialog.checkInviteTitleExist();
    await myRooms.inviteDialog.openAccessSelector();
    await screenshot.expectHaveScreenshot("invite_dialog");
    await myRooms.inviteDialog.close();
  });

  test("ChangeTheRoomOwner", async () => {
    await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
    await myRooms.roomsTable.clickContextMenuOption(
      roomContextMenuOption.changeTheRoomOwner,
    );
    await myRooms.roomsChangeOwnerDialog.checkNoMembersFoundExist();
    await screenshot.expectHaveScreenshot("no_members");
    await myRooms.roomsChangeOwnerDialog.close();
  });

  test("EditRoom", async () => {
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
    await screenshot.expectHaveScreenshot("opened_edit_room_dialog");
    await myRooms.roomsEditDialog.fillRoomName("Edited room");
    await myRooms.roomsEditDialog.clickSaveButton();
    await myRooms.roomsTable.checkRoomExist("Edited room");
  });

  test("DuplicateRoom", async () => {
    await myRooms.roomsTable.openContextMenu(roomCreateTitles.public);
    await myRooms.roomsTable.clickContextMenuOption(
      roomContextMenuOption.duplicate,
    );
    await myRooms.roomsTable.checkRoomExist(roomCreateTitles.public + " (1)");
  });

  test("MoveToArchive", async () => {
    await myRooms.roomsTable.openContextMenu(roomCreateTitles.public + " (1)");
    await myRooms.roomsTable.clickContextMenuOption(
      roomContextMenuOption.moveToArchive,
    );
    await myRooms.moveToArchive();
    await myRooms.roomsTable.checkRoomNotExist(
      roomCreateTitles.public + " (1)",
    );
  });

  test("AccessSettings", async () => {
    await myRooms.openTemplatesTab();
    await myRooms.roomsTable.openContextMenu("room template");
    await myRooms.roomsTable.clickContextMenuOption(
      templateContextMenuOption.accessSettings,
    );
    await myRooms.roomsAccessSettingsDialog.checkAccessSettingsTitleExist();
    await screenshot.expectHaveScreenshot();
    await myRooms.roomsAccessSettingsDialog.close();
  });

  /**
   * Tests the info panel functionality for rooms and templates
   * Verifies:
   * - Empty info panel state
   * - Template room properties and options
   * - Access settings for template rooms
   * - Regular room properties and options
   * - History tracking for rooms
   * - Contacts management
   * - UI consistency across different panel states
   */
  test("InfoPanel", async () => {
    await myRooms.infoPanel.open();
    await myRooms.infoPanel.checkNoItemTextExist();
    await screenshot.expectHaveScreenshot("empty");

    await myRooms.roomsTable.selectRow("room template");
    await myRooms.infoPanel.openTab("Details");
    await myRooms.infoPanel.hideDatePropertiesDetails();
    await myRooms.infoPanel.checkRoomProperties(roomCreateTitles.public);
    await screenshot.expectHaveScreenshot("template_details");

    await myRooms.infoPanel.openOptions();
    await screenshot.expectHaveScreenshot("template_opened_options");
    await myRooms.infoPanel.closeDropdown();

    await myRooms.infoPanel.openTab("Accesses");
    await myRooms.infoPanel.checkAccessesExist();
    await screenshot.expectHaveScreenshot("template_accesses");

    await myRooms.openRoomsTab();
    await myRooms.roomsTable.selectRow(roomCreateTitles.public);
    await myRooms.infoPanel.openTab("Details");
    await myRooms.infoPanel.hideDatePropertiesDetails();
    await myRooms.infoPanel.checkRoomProperties(roomCreateTitles.public);
    await screenshot.expectHaveScreenshot("room_details");

    await myRooms.infoPanel.openOptions();
    await screenshot.expectHaveScreenshot("room_options");
    await myRooms.infoPanel.closeDropdown();

    await myRooms.infoPanel.openTab("History");
    await myRooms.infoPanel.checkHistoryExist("room created");
    await myRooms.infoPanel.hideCreationDateHistory();
    await screenshot.expectHaveScreenshot("room_history");

    await myRooms.infoPanel.openTab("Contacts");
    await screenshot.expectHaveScreenshot("room_contacts");
    await myRooms.infoPanel.close();
  });

  /**
   * Tests the view switching functionality
   * Verifies that rooms can be displayed in both thumbnail and compact views
   * and that the UI updates correctly when switching between views
   */
  test("View", async () => {
    await myRooms.roomsFilter.switchToThumbnailView();
    await screenshot.expectHaveScreenshot("view_thumbnail");
    await myRooms.roomsFilter.switchToCompactView();
  });

  /**
   * Tests the sorting functionality
   * Verifies that:
   * - Sort dropdown opens correctly
   * - Sorting by type works properly
   * - UI updates correctly after sorting
   */
  test("Sort", async () => {
    await myRooms.roomsFilter.openDropdownSortBy();
    await screenshot.expectHaveScreenshot("dropdown_sort_by");
    await myRooms.roomsFilter.clickSortByType();
    await screenshot.expectHaveScreenshot("sorted_by_type");
  });

  /**
   * Tests the filtering functionality
   * Verifies that:
   * - Filter dialog opens correctly
   * - Public room filter can be applied
   * - Filter can be cleared
   * - UI updates correctly after filtering
   */
  test("Filter", async () => {
    await myRooms.roomsFilter.openFilterDialog();
    await screenshot.expectHaveScreenshot("filter_dialog");
    await myRooms.roomsFilter.selectFilterByPublic();
    await myRooms.roomsFilter.applyFilter();
    await screenshot.expectHaveScreenshot("filtered_by_public");
    await myRooms.roomsFilter.clearFilterByPublic();
  });

  /**
   * Tests the search functionality
   * Verifies that:
   * - Search input works correctly
   * - Search results are displayed properly
   * - Empty search results are handled correctly
   * - Search can be cleared
   * - Original room list is restored after search
   */
  test("Search", async () => {
    await myRooms.roomsFilter.fillRoomsSearchInputAndCheckRequest(
      roomCreateTitles.collaboration,
    );
    await myRooms.roomsTable.checkRoomExist(roomCreateTitles.collaboration);
    await screenshot.expectHaveScreenshot("collaboration_room");
    await myRooms.roomsFilter.clearSearchText();
    await myRooms.roomsFilter.fillRoomsSearchInputAndCheckRequest(
      "empty view search",
    );
    await myRooms.roomsFilter.checkEmptyViewExist();
    await screenshot.expectHaveScreenshot("empty");
    await myRooms.roomsFilter.clearSearchText();
    await myRooms.roomsTable.checkRoomExist(roomCreateTitles.public);
  });

  /**
   * Tests the empty state functionality for both rooms and templates
   * Verifies that:
   * - Empty state is displayed correctly for rooms after archiving
   * - Empty state is displayed correctly for templates after deletion
   * - UI is consistent in both empty states
   */
  test("EmptyView", async () => {
    await test.step("Rooms", async () => {
      await myRooms.moveAllRoomsToArchive();
      await myRooms.roomsEmptyView.checkNoRoomsExist();
    });

    await test.step("Templates", async () => {
      await myRooms.openTemplatesTab();
      await myRooms.deleteAllRooms();
      await myRooms.roomsEmptyView.checkNoTemplatesExist();
      await screenshot.expectHaveScreenshot("templates");
    });
  });

  test.afterAll(async () => {
    await api.cleanup();
  });
});

import { test, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import API from "@/src/api";
import Login from "@/src/objects/common/Login";
import MyRooms from "@/src/objects/rooms/Rooms";
import Screenshot from "@/src/objects/common/Screenshot";
import {
  roomContextMenuOption,
  roomCreateTitles,
} from "@/src/utils/constants/rooms";

/**
 * Test suite for Tags functionality
 * Tests various aspects of tag management
 */
test.describe("Tags", () => {
  let page: Page;
  let screenshot: Screenshot;
  let myRooms: MyRooms;

  let api: API;

  test.beforeAll(async ({ playwright, browser }) => {
    const apiContext = await playwright.request.newContext();
    api = new API(apiContext);
    await api.setup();
    console.log(api.portalDomain);

    page = await browser.newPage();

    await page.addInitScript(() => {
      globalThis.localStorage?.setItem("integrationUITests", "true");
    });

    screenshot = new Screenshot(page, {
      screenshotDir: "rooms",
      suiteName: "tags",
    });
    const login = new Login(page, api.portalDomain);
    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
  });

  test("Tags", async () => {
    await test.step("CreateRoomWithTag", async () => {
      await myRooms.roomsArticle.openCreateDialog();
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await page.waitForTimeout(500);
      await myRooms.roomsCreateDialog.openRoomIconDropdown();
      await myRooms.roomsCreateDialog.openRoomCover();
      await myRooms.roomsCreateDialog.selectCoverColor();
      await myRooms.roomsCreateDialog.selectCoverIcon();
      await myRooms.roomsCreateDialog.saveCover();
      await myRooms.roomsCreateDialog.fillRoomName("Tag Room");
      await screenshot.expectHaveScreenshot("room_after_create");
      await myRooms.roomsCreateDialog.createTag("Tag1");
      await expect(page.getByText("Tag1")).toBeVisible();
      await screenshot.expectHaveScreenshot("room_after_create_tag");
      await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.hideDatePropertiesDetails();
      await screenshot.expectHaveScreenshot("room_with_tag_details");
      await myRooms.backToRooms();
      await myRooms.infoPanel.close();
      await myRooms.roomsTable.hideLastActivityColumn();
      await myRooms.roomsTable.selectRow("Tag Room");
      await screenshot.expectHaveScreenshot("tag_in_rooms_table");
    });

    await test.step("FilterByTag", async () => {
      await myRooms.roomsTable.clickTag("Tag1");
      await screenshot.expectHaveScreenshot("filter_tag_in_rooms_table");
      await myRooms.roomsFilter.openFilterDialog();
      await screenshot.expectHaveScreenshot("tag_in_filter");
      await myRooms.roomsFilter.cancelFilter();
    });

    await test.step("DeleteTagFromRoom", async () => {
      await myRooms.roomsTable.selectRow("Tag Room");
      await myRooms.roomsTable.openContextMenu("Tag Room");
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.editRoom,
      );
      await myRooms.roomsCreateDialog.closeTag("Tag1");
      await screenshot.expectHaveScreenshot("delete_tag_on_edit_room");
      await myRooms.roomsEditDialog.clickSaveButton();
      await screenshot.expectHaveScreenshot("room_after_delete_tag");
      await myRooms.roomsFilter.openFilterDialog();
      await myRooms.roomsFilter.clearFilterDialog();
      await myRooms.roomsFilter.cancelFilter();
      await screenshot.expectHaveScreenshot("room_list_after_delete_tag");
    });

    await test.step("CreateFiveTagsInRoom", async () => {
      await myRooms.roomsArticle.openCreateDialog();
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.openRoomIconDropdown();
      await myRooms.roomsCreateDialog.openRoomCover();
      await myRooms.roomsCreateDialog.selectCoverColor();
      await myRooms.roomsCreateDialog.selectCoverIcon();
      await myRooms.roomsCreateDialog.saveCover();
      await myRooms.roomsCreateDialog.fillRoomName(
        "ManyTags RoomManyTags RoomManyTags RoomManyTags RoomManyTags RoomManyTags Room",
      );
      await myRooms.roomsCreateDialog.createTags(6);
      await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.hideDatePropertiesDetails();
      await screenshot.expectHaveScreenshot("room_with_many_tags");
      await myRooms.backToRooms();
    });

    await test.step("CollapsingLongNameTag", async () => {
      await myRooms.roomsArticle.openCreateDialog();
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.openRoomIconDropdown();
      await myRooms.roomsCreateDialog.openRoomCover();
      await myRooms.roomsCreateDialog.selectCoverColor();
      await myRooms.roomsCreateDialog.selectCoverIcon();
      await myRooms.roomsCreateDialog.saveCover();
      await myRooms.roomsCreateDialog.fillRoomName("LongNameTag Room");
      await myRooms.roomsCreateDialog.createTag(
        "0123456789 0123456789 0123456789 0123456789 0123456789 0123456789 0123456789 0123456789 0123456789 0123456789",
      );
      await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
      await screenshot.expectHaveScreenshot("long_name_tag_in_room");
      await myRooms.backToRooms();
      await screenshot.expectHaveScreenshot("long_name_tag_in_rooms_table");
    });
  });

  test.afterAll(async () => {
    await api.cleanup();
    await page.close();
  });
});

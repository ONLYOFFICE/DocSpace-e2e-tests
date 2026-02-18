import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import {
  roomContextMenuOption,
  roomCreateTitles,
} from "@/src/utils/constants/rooms";

/**
 * Test suite for Tags functionality
 * Tests various aspects of tag management
 */
test.describe("Tags", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
  });
  test("Tags", async ({ page }) => {
    await test.step("CreateRoomWithTag", async () => {
      await myRooms.roomsArticle.openCreateDialog();
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.fillRoomName("Tag Room");
      await myRooms.roomsCreateDialog.createTag("Tag1");
      await expect(page.getByText("Tag1")).toBeVisible();
      await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
      await myRooms.infoPanel.openTab("Details");
      await myRooms.backToRooms();
      await myRooms.infoPanel.close();
      await myRooms.roomsTable.selectRow("Tag Room");
    });

    await test.step("FilterByTag", async () => {
      await myRooms.roomsTable.clickTag("Tag1");
      await myRooms.roomsFilter.openFilterDialog();
      await expect(
        page.getByTestId("filter_block_item_content_filter-tags"),
      ).toBeVisible();
      await myRooms.roomsFilter.cancelFilter();
    });

    await test.step("DeleteTagFromRoom", async () => {
      await myRooms.roomsTable.selectRow("Tag Room");
      await myRooms.roomsTable.openContextMenu("Tag Room");
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.manage,
      );
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.editRoom,
      );
      await myRooms.roomsCreateDialog.closeTag("Tag1");
      await myRooms.roomsEditDialog.clickSaveButton();
      await myRooms.roomsFilter.openFilterDialog();
      await myRooms.roomsFilter.clearFilterDialog();
      await myRooms.roomsFilter.cancelFilter();
    });

    await test.step("CreateFiveTagsInRoom", async () => {
      await myRooms.roomsArticle.openCreateDialog();
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.fillRoomName(
        "ManyTags RoomManyTags RoomManyTags RoomManyTags RoomManyTags RoomManyTags Room",
      );
      await myRooms.roomsCreateDialog.createTags(6);
      await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
      await myRooms.infoPanel.openTab("Details");
      await myRooms.infoPanel.hideDatePropertiesDetails();
      await myRooms.backToRooms();
    });

    await test.step("CollapsingLongNameTag", async () => {
      await myRooms.roomsArticle.openCreateDialog();
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.fillRoomName("LongNameTag Room");
      await myRooms.roomsCreateDialog.createTag(
        "0123456789 0123456789 0123456789 0123456789 0123456789 0123456789 0123456789 0123456789 0123456789 0123456789",
      );
      await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
      await myRooms.backToRooms();
    });
  });
});

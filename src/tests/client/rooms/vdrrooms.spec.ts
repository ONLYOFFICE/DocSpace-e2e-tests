import MyRooms from "@/src/objects/rooms/Rooms";
import Screenshot from "@/src/objects/common/Screenshot";
import {
  roomCreateTitles,
  roomDialogSource,
} from "@/src/utils/constants/rooms";
import { test } from "@/src/fixtures";
import { Page } from "@playwright/test";

test.describe("VDRRooms", () => {
  let page: Page;
  let screenshot: Screenshot;
  let myRooms: MyRooms;

  test.beforeEach(async ({ page: fixturePage, api, login }) => {
    page = fixturePage;

    screenshot = new Screenshot(page, {
      screenshotDir: "rooms",
      suiteName: "vdr_rooms",
    });

    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
  });

  test("Create VDR Room smoke", async () => {
    await test.step("OpenCreateDialog", async () => {
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    });

    await test.step("SelectVDRType", async () => {
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.virtualData
      );
      await screenshot.expectHaveScreenshot("vdr_open_create_dialog");
    });

    await test.step("FillNameAndToggles", async () => {
      await myRooms.roomsCreateDialog.fillRoomName("AutoVDRTest");

      // Automatic indexing
      await myRooms.roomsCreateDialog.toggleAutomaticIndexing(false);
      await screenshot.expectHaveScreenshot(
        "vdr_automatic_indexing_disabled"
      );
      await myRooms.roomsCreateDialog.toggleAutomaticIndexing(true);
      await screenshot.expectHaveScreenshot(
        "vdr_automatic_indexing_enabled"
      );

      // Restrict copy & download
      await myRooms.roomsCreateDialog.toggleRestrictCopyAndDownload(false);
      await screenshot.expectHaveScreenshot(
        "vdr_restrict_copy_and_download_disabled"
      );
      await myRooms.roomsCreateDialog.toggleRestrictCopyAndDownload(true);
      await screenshot.expectHaveScreenshot(
        "vdr_restrict_copy_and_download_enabled"
      );

      // File lifetime
      await myRooms.roomsCreateDialog.toggleFileLifetime(true);
      await screenshot.expectHaveScreenshot("vdr_file_lifetime_enabled");
      await myRooms.roomsCreateDialog.setFileLifetimeDays(14);
      await myRooms.roomsCreateDialog.selectFileLifetimeUnit("Years");
      await myRooms.roomsCreateDialog.selectFileLifetimeAction(
        "Delete permanently"
      );
      await screenshot.expectHaveScreenshot("vdr_file_lifetime_filled");

      // Watermark
      await myRooms.roomsCreateDialog.toggleWatermarks(true);
      await screenshot.expectHaveScreenshot("vdr_watermark_enabled");
      await myRooms.roomsCreateDialog.selectWatermarkType("Viewer info");
      await screenshot.expectHaveScreenshot("vdr_watermark_viewer_info");
      await myRooms.roomsCreateDialog.selectWatermarkElements([
        "username",
        "useremail",
        "roomname",
      ]);
      await screenshot.expectHaveScreenshot(
        "vdr_watermark_elements_selected"
      );
      await myRooms.roomsCreateDialog.setWatermarkStaticText("CONFIDENTIAL");
      await screenshot.expectHaveScreenshot("vdr_watermark_static_text");
      await myRooms.roomsCreateDialog.selectWatermarkPosition("Horizontal");
      await screenshot.expectHaveScreenshot(
        "vdr_watermark_position_horizontal"
      );
    });

    await test.step("SubmitAndAssert", async () => {
      await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
      await myRooms.roomsTable.checkRowExist("AutoVDRTest");
      await screenshot.expectHaveScreenshot("vdr_created_room_in_table");
    });
  });
});

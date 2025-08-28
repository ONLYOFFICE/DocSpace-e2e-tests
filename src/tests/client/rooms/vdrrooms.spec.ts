import { test, Page } from "@playwright/test";

import API from "@/src/api";
import Login from "@/src/objects/common/Login";
import MyRooms from "@/src/objects/rooms/Rooms";
import Screenshot from "@/src/objects/common/Screenshot";
import {
  roomContextMenuOption,
  roomCreateTitles,
  roomDialogSource,
  roomTemplateTitles,
  templateContextMenuOption,
} from "@/src/utils/constants/rooms";

/**
 * Test suite for VDR Rooms functionality
 * Tests various aspects of room management including creation, templates, and UI interactions
 */
test.describe("VDRRooms", () => {
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
    screenshot = new Screenshot(page, { screenshotDir: "rooms" });

    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
  });

  test("Create VDR Room smoke", async () => {
    // Step 1: Check empty rooms state
    //await myRooms.roomsEmptyView.checkNoRoomsExist();
    //await screenshot.expectHaveScreenshot("vdr_empty_rooms");
  
    // Step 2: Open the create room dialog via navigation
    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
  
    // Step 3: Select the VDR room type (replace with your actual VDR constant/title)
    await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.virtualData);
  
    // Optionally: take a screenshot of the dialog
    await screenshot.expectHaveScreenshot("vdr_open_create_dialog");
  
    // Step 4: Fill the room name
    await myRooms.roomsCreateDialog.fillRoomName("AutoVDRTest");
    

 // ---- NEW: Toggle Automatic indexing OFF ----
await myRooms.roomsCreateDialog.toggleAutomaticIndexing(false);
await screenshot.expectHaveScreenshot("vdr_automatic_indexing_disabled");

// ---- NEW: Toggle Automatic indexing ON ----
await myRooms.roomsCreateDialog.toggleAutomaticIndexing(true);
await screenshot.expectHaveScreenshot("vdr_automatic_indexing_enabled");

// ---- NEW: Toggle Restrict copy and download OFF ----
await myRooms.roomsCreateDialog.toggleRestrictCopyAndDownload(false);
await screenshot.expectHaveScreenshot("vdr_restrict_copy_and_download_disabled");

// ---- NEW: Toggle Restrict copy and download ON ----
await myRooms.roomsCreateDialog.toggleRestrictCopyAndDownload(true);
await screenshot.expectHaveScreenshot("vdr_restrict_copy_and_download_enabled");

// ---- NEW: Toggle File lifetime ----
await myRooms.roomsCreateDialog.toggleFileLifetime(true);
await screenshot.expectHaveScreenshot("vdr_file_lifetime_enabled");

await myRooms.roomsCreateDialog.setFileLifetimeDays(14);
await myRooms.roomsCreateDialog.selectFileLifetimeUnit("Years");
await myRooms.roomsCreateDialog.selectFileLifetimeAction("Delete permanently");

await screenshot.expectHaveScreenshot("vdr_file_lifetime_filled");

// ---- NEW: Watermark ----
await myRooms.roomsCreateDialog.toggleWatermarks(true);
await screenshot.expectHaveScreenshot("vdr_watermark_enabled");

await myRooms.roomsCreateDialog.selectWatermarkType("Viewer info");
await screenshot.expectHaveScreenshot("vdr_watermark_viewer_info");

await myRooms.roomsCreateDialog.selectWatermarkElements([
  "username",   
  "useremail",  
  "roomname"    
]);

await screenshot.expectHaveScreenshot("vdr_watermark_elements_selected");

await myRooms.roomsCreateDialog.setWatermarkStaticText("CONFIDENTIAL");
await screenshot.expectHaveScreenshot("vdr_watermark_static_text");

await myRooms.roomsCreateDialog.selectWatermarkPosition("Horizontal");
await screenshot.expectHaveScreenshot("vdr_watermark_position_horizontal");
  
    // Step 5: Submit the creation form
    await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
  
    // Step 6: Assert the new room is present in the table/empty view
    await myRooms.roomsTable.checkRowExist("AutoVDRTest");
    await screenshot.expectHaveScreenshot("vdr_created_room_in_table");
  });

  test.afterAll(async () => {
    await api.cleanup();
    await page.close();
  });
});

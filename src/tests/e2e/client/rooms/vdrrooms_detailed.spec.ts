import { test, Page } from "@playwright/test";

import API from "@/src/api";
import Login from "@/src/objects/common/Login";
import MyRooms from "@/src/objects/rooms/Rooms";
import {
  roomCreateTitles,
  roomDialogSource,
} from "@/src/utils/constants/rooms";

/**
 * Test suite for VDR Rooms functionality
 * Tests various aspects of room management including creation, templates, and UI interactions
 */
test.describe("VDRRooms", () => {
  let api: API;
  let page: Page;

  let login: Login;

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

    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
  });

  test("Create VDR Room smoke", async () => {
    // Step 1: Check empty rooms state
    await myRooms.roomsEmptyView.checkNoRoomsExist();

    // Step 2: Open the create room dialog via navigation
    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);

    // Step 3: Select the VDR room type (replace with your actual VDR constant/title)
    await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.virtualData);

    // Step 4: Fill the room name
    await myRooms.roomsCreateDialog.fillRoomName("AutoIndexRoom");
    await myRooms.roomsCreateDialog.setRoomCoverColor("color_item_2");

    // Step 5: Submit the creation form
    await myRooms.roomsCreateDialog.clickRoomDialogSubmit();

    // Step 6: Assert the new room is present in the table/empty view
    await myRooms.backToRooms();
    await myRooms.roomsTable.checkRowExist("AutoIndexRoom");

    // Step 7: Open the room
    await myRooms.roomsTable.openRoomByName("AutoIndexRoom");
  });

  test.afterAll(async () => {
    await api.cleanup();
    await page.close();
  });
});

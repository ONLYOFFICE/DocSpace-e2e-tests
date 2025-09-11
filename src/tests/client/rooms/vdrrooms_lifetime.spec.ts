import MyRooms from "@/src/objects/rooms/Rooms";
import Screenshot from "@/src/objects/common/Screenshot";
import { roomDialogSource } from "@/src/utils/constants/rooms";
import { test } from "@/src/fixtures";
import { Page, expect } from "@playwright/test";

test.describe("VDRRooms_file_lifetime", () => {
  let screenshot: Screenshot;
  let myRooms: MyRooms;
  let page: Page;

  test.beforeEach(async ({ page: fixturePage, api, login }) => {
    page = fixturePage;
    screenshot = new Screenshot(page, {
      screenshotDir: "vdr_file_lifetime",
      suiteName: "vdr_file_lifetime",
    });
    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
  });

  test("VDR: file lifetime enabled — flame icon is shown near room title", async () => {
    const roomName = `Lifetime ${Date.now()}`;

    
    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await page.getByTitle("Virtual Data Room").click();

    
    await page.getByTestId("create_edit_room_input").fill(roomName);
    await myRooms.roomsCreateDialog.toggleFileLifetime(true);
    await myRooms.roomsCreateDialog.setFileLifetimeDays(7);
    
   
    await page.getByTestId("create_room_dialog_save").click();

    
    await expect(page.getByRole("heading", { name: roomName })).toBeVisible();

   
    const flameIcon = page.locator(".title-icon > div > .injected-svg");
    await expect(flameIcon).toBeVisible();

    await screenshot.expectHaveScreenshot("vdr_file_lifetime_enabled_flame_icon");
    await myRooms.backToRooms();
  });

  test("VDR: file lifetime disabled — flame icon is NOT shown", async () => {
    const roomName = `NoLifetime ${Date.now()}`;

    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await page.getByTitle("Virtual Data Room").click();

    await page.getByTestId("create_edit_room_input").fill(roomName);
    await myRooms.roomsCreateDialog.toggleFileLifetime(false);

    await page.getByTestId("create_room_dialog_save").click();

    await expect(page.getByRole("heading", { name: roomName })).toBeVisible();

    await screenshot.expectHaveScreenshot("vdr_file_lifetime_disabled_no_icon");
    
  });
});

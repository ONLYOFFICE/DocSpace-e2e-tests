import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../../page_objects/portal_login_page";
import { MobilePage } from "../../../../page_objects/Mobile/mobile";
import { devices } from "@playwright/test";
import config from "../../../../config/config";
import { RoomsListPage } from "../../../../page_objects/Rooms/room_list_page";

test.describe("MobileCheckbox Rotate Tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let mobilePage;
  let roomsListPage;

  //   test.beforeAll(async ({ playwright }) => {
  //     apiContext = await playwright.request.newContext();
  //     portalSetup = new PortalSetupApi(apiContext);
  //     await portalSetup.setupPortal();
  //   });

  test.beforeEach(async ({ page }) => {
    roomsListPage = new RoomsListPage(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(
      "test-portal-2025-02-20t07-44-46-567z.onlyoffice.io",
    );
    mobilePage = new MobilePage(page);
    await roomsListPage.navigate();
  });

  //   test.afterAll(async () => {
  //     await portalSetup.deletePortal();
  //     await apiContext.dispose();
  //   });

  test("Checking a checkbox after rotating the device", async ({ page }) => {
    // const checkbox = page.locator(mobile.checkbox);
    // await expect(checkbox).toBeVisible();
    // await expect(checkbox).toHaveClass("smartbanner-container");
  });

  test.describe("Checkbox selection after device rotation", () => {
    let apiContext;
    let roomsListPage;
    let mobilePage;

    test.beforeAll(async ({ browser }) => {
      apiContext = await browser.newContext();
    });

    test.beforeEach(async ({ page }) => {});

    test("Verify checkbox remains selected after device rotation", async ({
      page,
      device,
    }) => {
      // Create two rooms via API
      const room1 = await apiContext.post("/api/rooms", {
        data: { name: "Test Room 1" },
      });
      const room2 = await apiContext.post("/api/rooms", {
        data: { name: "Test Room 2" },
      });

      // Select checkbox for first room
      const checkbox = page.locator(
        `#room-${room1.data.id} input[type='checkbox']`,
      );
      await checkbox.check();

      // Verify checkbox is selected
      await expect(checkbox).toBeChecked();

      // Rotate device
      await mobilePage.rotateDevice(device);

      // Verify checkbox remains selected after rotation
      await expect(checkbox).toBeChecked();
    });
  });
});

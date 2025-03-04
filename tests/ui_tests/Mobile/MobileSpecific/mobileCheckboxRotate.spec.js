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

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    mobilePage = new MobilePage(page);
    roomsListPage = new RoomsListPage(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("check select Room checkbox after rotate device", async ({ page }) => {
    const device = devices[config.DEVICE];
    await roomsListPage.CreatePublicRoomFunc("Room1");
    await roomsListPage.CreateButton();
    await roomsListPage.openRoomsList();
    await roomsListPage.CreatePublicRoomFunc("Room2");
    await roomsListPage.CreateButton();
    await roomsListPage.openRoomsList();
    await page.click(roomsListPage.checkboxSelector("Room1"));
    await page.click(roomsListPage.checkboxSelector("Room2"));
    await mobilePage.rotateDevice(device);
    const room1Row = page
      .locator(`div[data-title='Test Public Room Room1']`)
      .first();
    await expect(room1Row).toHaveClass(/draggable/, { timeout: 10000 });
    const room2Row = page
      .locator(`div[data-title='Test Public Room Room2']`)
      .first();
    await expect(room2Row).toHaveClass(/draggable/, { timeout: 10000 });
  });
});

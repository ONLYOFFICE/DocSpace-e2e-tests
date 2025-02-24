import { test } from "@playwright/test";
import { PortalSetupApi } from "../../../../api_library/portal_setup";
import { RoomsListPage } from "../../../../page_objects/room_list_page";
import { PortalLoginPage } from "../../../../page_objects/portal_login_page";

test.describe("VDR Watermark Tests", () => {
  let portalSetup;
  let roomsListPage;
  let portalLoginPage;
  let apiContext;

  test.setTimeout(120000);

  test.beforeAll(async () => {
    apiContext = await test.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    roomsListPage = new RoomsListPage(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("Check watermark functionality in VDR", async ({ page }) => {
    await test.step("Create VDR and test watermark", async () => {
      await roomsListPage.VDRchange();
      await page.waitForTimeout(500);
    });
  });
});

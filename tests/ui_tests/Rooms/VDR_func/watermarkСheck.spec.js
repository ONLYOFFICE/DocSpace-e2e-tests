import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../../api_library/portal_setup";
import { RoomsApi } from "../../../../api_library/files/rooms_api";
import { ArchivePage } from "../../../../page_objects/Rooms/archivePage";
import { RoomsListPage } from "../../../../page_objects/Rooms/roomListPage";
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
      await roomsListPage.CreateDocumentFiles();
      await page.waitForTimeout(500);
    });
  });
});

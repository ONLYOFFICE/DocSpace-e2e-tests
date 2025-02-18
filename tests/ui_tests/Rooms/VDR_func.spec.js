import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { RoomsApi } from "../../../api_library/files/rooms_api";
import { RoomsListPage } from "../../../page_objects/room_list_page";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

let apiContext;
let portalSetup;
let roomsApi;
let roomsListPage;
let portalLoginPage;

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext();
  portalSetup = new PortalSetupApi(apiContext);
  const portalData = await portalSetup.setupPortal();
  roomsApi = new RoomsApi(apiContext, portalData.tenant.domain, () =>
    portalSetup.getAuthHeaders(),
  );
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

test.describe("checking watermarks VDR", () => {
  test("watermarks VDR", async ({ page }) => {
    const result = await roomsListPage.VDRchange();
    await roomsListPage.openRoomsList();
    await page.getByTestId("link").click();
    await page.waitForTimeout(5000);
  });
});

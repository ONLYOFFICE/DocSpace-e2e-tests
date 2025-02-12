import { test, expect } from "@playwright/test";
import config from "../../config/config.js";
import { RegistrationPage } from "../../page_objects/site_registration_page.js";
import { PortalSetupApi } from "../../api_library/portal_setup.js";

test.describe("Create and delete new portal via site registration (UI)", () => {
  let apiContext;
  let portalSetupApi;
  let portalName;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetupApi = new PortalSetupApi(apiContext);
    portalName = `test-portal-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  });

  test("Create new portal via site registration", async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const siteUrl = config.TEST_SITE_REGISTRATION_URL;

    await page.goto(siteUrl);
    await registrationPage.waitToLoad();

    await registrationPage.completeRegistrationForm({
      firstName: "admin zero",
      lastName: "admin zero",
      email: config.DOCSPACE_ADMIN_EMAIL,
      portalName,
      password: config.DOCSPACE_ADMIN_PASSWORD,
    });

    const createRoomButton = page.locator(
      '//button[@id="rooms-shared_create-room-button"]',
    );
    await createRoomButton.waitFor({ timeout: 60000 });
    await expect(createRoomButton).toBeVisible();
  });

  test.afterAll(async () => {
    portalSetupApi.portalDomain = `${portalName}.onlyoffice.io`;
    await portalSetupApi.authenticate();
    await portalSetupApi.deletePortal();
    await apiContext.dispose();
  });
});

import { test, expect } from "@playwright/test";
import { Integration } from "../../../page_objects/Settings/Integration";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

test.describe("Integration Tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let integration;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    const portalData = await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    integration = new Integration(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("Third Party Link", async ({ page }) => {
    await integration.navigateToSettings();
    await integration.navigateToThirdPartyServices();
    const page1Promise = page.waitForEvent("popup");
    await integration.thirdPartyLink.click();
    const page1 = await page1Promise;
    await page1.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-settings.aspx#AdjustingIntegrationSettings_block",
    );
    await expect(page1).toHaveURL(
      /administration\/docspace-settings.aspx\#AdjustingIntegrationSettings_block/,
    );
  });

  test("Facebook Enable", async ({ page }) => {
    await integration.navigateToSettings();
    await integration.navigateToThirdPartyServices();
    await integration.activateFacebook();
    await expect(page.locator("text=Updated successfully")).toHaveText(
      "Updated successfully",
      { timeout: 10000 },
    );
    await integration.facebookSwitch.click();
    await expect(page.locator("text=Deactivated successfully")).toHaveText(
      "Deactivated successfully",
      { timeout: 10000 },
    );
  });

  test("AWSS3 Enable", async ({ page }) => {
    await integration.navigateToSettings();
    await integration.navigateToThirdPartyServices();
    await integration.activateAWSS3();
    await expect(page.locator("text=Updated successfully")).toHaveText(
      "Updated successfully",
      { timeout: 10000 },
    );
    await integration.s3Switch.click();
    await expect(page.locator("text=Deactivated successfully")).toHaveText(
      "Deactivated successfully",
      { timeout: 10000 },
    );
  });
});

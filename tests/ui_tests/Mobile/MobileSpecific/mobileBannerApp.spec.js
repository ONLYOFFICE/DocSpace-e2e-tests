import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../../page_objects/portal_login_page";
import { MobilePage } from "../../../../page_objects/Mobile/mobile";

test.describe("MobileBanner App Tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let mobile;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    const portalData = await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    mobile = new MobilePage(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("check Mobile App Banner", async ({ page }) => {
    const banner = page.locator(mobile.mobileBannerApp);
    await expect(banner).toBeVisible();
    await expect(banner).toHaveClass("smartbanner-container");
  });

  test("close Mobile App Banner", async ({ page }) => {
    const banner = page.locator(mobile.mobileBannerApp);
    await expect(banner).toBeVisible();
    await expect(banner).toHaveClass("smartbanner-container");
    const closeButton = page.locator(mobile.closeBannerApp);
    await closeButton.click();
    await expect(banner).not.toBeVisible();
  });

  test("click View button and verify Google Play", async ({ page }) => {
    const banner = page.locator(mobile.mobileBannerApp);
    await expect(banner).toBeVisible();
    await expect(banner).toHaveClass("smartbanner-container");
    const view = page.locator(mobile.viewButtonBannerApp);
    await view.click();
    const currentUrl = page.url();
    await expect(
      page.getByText("ONLYOFFICE Documents", { exact: true }),
    ).toBeVisible();
    await page.goBack();
    await expect(banner).not.toBeVisible();
  });
});

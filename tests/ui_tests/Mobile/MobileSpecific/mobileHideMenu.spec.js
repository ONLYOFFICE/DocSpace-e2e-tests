import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../../page_objects/portal_login_page";
import { MobilePage } from "../../../../page_objects/Mobile/mobile";
import { devices } from "@playwright/test";
import config from "../../../../config/config";
import { GroupsPage } from "../../../../page_objects/accounts/groupsPage.js";

test.describe("Mobile Hide Button tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let mobile;
  let groupsPage;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    mobile = new MobilePage(page);
    groupsPage = new GroupsPage(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("check Hide left menu", async ({ page }) => {
    const device = devices[config.DEVICE];
    await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));

    // Rotate device if necessary
    if ((await page.evaluate(() => window.innerHeight)) < 1024) {
      await page.setViewportSize({
        width: device.viewport.height,
        height: device.viewport.width,
      });
    }
    const hide = page.locator(mobile.hideLeftMenu);
    const show = page.locator(mobile.showLeftMenu);
    if (await hide.isVisible()) {
      await hide.click();
      await expect(show).toBeVisible();
      await show.click();
      await expect(hide).toBeVisible();
    } else if (await show.isVisible()) {
      await show.click();
      await expect(hide).toBeVisible();
      await hide.click();
      await expect(show).toBeVisible();
    } else {
      throw new Error("Neither the hide nor show button is visible");
    }
  });

  test("Check Left menu when hide", async ({ page }) => {
    const device = devices[config.DEVICE];
    await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));

    if ((await page.evaluate(() => window.innerHeight)) < 1024) {
      await page.setViewportSize({
        width: device.viewport.height,
        height: device.viewport.width,
      });
    }
    const hide = page.locator(mobile.hideLeftMenu);
    const show = page.locator(mobile.showLeftMenu);
    if (await hide.isVisible()) {
      await hide.click();
      await expect(show).toBeVisible();
    } else {
      const groups = page.locator(groupsPage.contactsLink);
      await groups.click();
      await page.waitForSelector(
        '[data-testid="heading"]',
        { hasText: "Contacts" },
        {
          timeout: 3000,
        },
      );
    }
  });
});

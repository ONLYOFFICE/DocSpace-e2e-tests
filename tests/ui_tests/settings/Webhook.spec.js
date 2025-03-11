import { test, expect } from "@playwright/test";
import { Webhook } from "../../../page_objects/settings/Webhook";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

test.describe("Webhook tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let webhook;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    const portalData = await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    webhook = new Webhook(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("Create webhook", async ({ page }) => {
    await webhook.navigateToSettings();
    await webhook.navigateToWebhooks();
    await webhook.createWebhook(
      "Autotest",
      "https://webhook.site/5ac48dd9-de53-4144-8442-1e7245aab861",
    );
    await expect(page.locator("text=Webhook created")).toHaveText(
      "Webhook created",
      { timeout: 5000 },
    );
  });

  test("Webhook redelivery", async ({ page }) => {
    await webhook.navigateToSettings();
    await webhook.navigateToWebhooks();
    await webhook.redeliverWebhook();
    await expect(page.locator("text=Webhook redelivered")).toHaveText(
      "Webhook redelivered",
      { timeout: 5000 },
    );
  });

  test("Webhook delete", async ({ page }) => {
    await webhook.navigateToSettings();
    await webhook.navigateToWebhooks();
    await webhook.deleteWebhook();
    await expect(page.locator("text=Webhook removed")).toHaveText(
      "Webhook removed",
      { timeout: 5000 },
    );
  });

  test("Webhooks link", async ({ page }) => {
    test.setTimeout(60000);
    await webhook.navigateToSettings();
    await webhook.navigateToWebhooks();
    const page1Promise = page.waitForEvent("popup");
    await webhook.webhookGuideLink.click();
    const page1 = await page1Promise;
    await page1.waitForLoadState("load");
    await page1.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-webhooks.aspx",
    );
    await expect(page1).toHaveURL(/administration\/docspace-webhooks.aspx/);
  });
});

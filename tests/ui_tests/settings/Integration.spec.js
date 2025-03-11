import { test, expect } from "@playwright/test";
import { Integration } from "../../../page_objects/settings/integration";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PaymentApi } from "../../../api_library/paymentApi/paymentApi";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

test.describe("Integration tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let integration;
  let paymentApi;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    paymentApi = new PaymentApi(apiContext, portalSetup);
    await portalSetup.setupPortal();
    await portalSetup.authenticate();
    const portalInfo = await paymentApi.getPortalInfo(portalSetup.portalDomain);
    await paymentApi.makePortalPayment(portalInfo.tenantId, 10);
    await paymentApi.refreshPaymentInfo(portalSetup.portalDomain);
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

  test("Ldap", async ({ page }) => {
    await integration.navigateToSettings();
    await integration.navigateToIntegration.click();
    await integration.activateLdap();
    await expect(
      page.locator("text=100% Operation has been successfully completed"),
    ).toBeVisible({ timeout: 3000 });
  });

  test("Manual sync", async ({ page }) => {
    await integration.navigateToSettings();
    await integration.manualSyncLdap();
    await expect(
      page.locator("text=100% Operation has been successfully completed."),
    ).toBeVisible({ timeout: 3000 });
  });

  test("Auto sync every hour", async ({ page }) => {
    await integration.navigateToSettings();
    await integration.everyHour();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toBeVisible({ timeout: 10000 });
    await integration.removeToast.click();
    await integration.enableAutoSyncLDAP.click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("Auto sync every day", async ({ page }) => {
    await integration.navigateToSettings();
    await integration.everyDay();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toBeVisible({ timeout: 10000 });
    await integration.removeToast.click();
    await integration.enableAutoSyncLDAP.click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("Auto sync every week", async ({ page }) => {
    await integration.navigateToSettings();
    await integration.everyWeek();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toBeVisible({ timeout: 10000 });
    await integration.removeToast.click();
    await integration.enableAutoSyncLDAP.click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("Auto sync every month", async ({ page }) => {
    await integration.navigateToSettings();
    await integration.everyMonth();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toBeVisible({ timeout: 10000 });
    await integration.removeToast.click();
    await integration.enableAutoSyncLDAP.click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("Auto sync every year", async ({ page }) => {
    await integration.navigateToSettings();
    await integration.everyYear();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toBeVisible({ timeout: 10000 });
    await integration.removeToast.click();
    await integration.enableAutoSyncLDAP.click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("Disable LDAP ", async ({ page }) => {
    await integration.navigateToSettings();
    await integration.navigateToIntegration.click();
    await page.waitForTimeout(1000);
    await integration.disableLdap();
    await expect(
      page.locator("text=100% Operation has been successfully completed"),
    ).toBeVisible({ timeout: 3000 });
  });

  test("Ldap Link", async ({ page }) => {
    test.setTimeout(60000);
    await integration.navigateToSettings();
    await integration.navigateToIntegration.click();
    await page.waitForTimeout(1000);
    const page1Promise = page.waitForEvent("popup");
    await integration.ldapLink.click();
    const page1 = await page1Promise;
    await page1.waitForLoadState("load");
    await page1.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-settings.aspx#LdapSettings_block",
    );
    await expect(page1).toHaveURL(
      /administration\/docspace-settings.aspx#LdapSettings_block/,
    );
  });

  test("Smtp", async ({ page }) => {
    await integration.navigateToSettings();
    await integration.navigateToSMTPSettings();
    await integration.activateSMTP();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await integration.removeToast.click();
    await integration.smtpSendTestMail.click();
    await expect(
      page.locator("text=Operation has been successfully completed."),
    ).toHaveText("Operation has been successfully completed.", {
      timeout: 10000,
    });
    await integration.removeToast2.click();
    await integration.DefaultButton.click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Smtp link", async ({ page }) => {
    await integration.navigateToSettings();
    await integration.navigateToSMTPSettings();
    const page1Promise = page.waitForEvent("popup");
    await integration.smtpLink.click();
    const page1 = await page1Promise;
    await page1.waitForLoadState("load");
    await page1.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-settings.aspx#AdjustingIntegrationSettings_block",
    );
    await expect(page1).toHaveURL(
      /administration\/docspace-settings.aspx#AdjustingIntegrationSettings_block/,
    );
  });

  test("Third party link", async ({ page }) => {
    test.setTimeout(70000);
    await integration.navigateToSettings();
    await integration.navigateToThirdPartyServices();
    const page1Promise = page.waitForEvent("popup");
    await integration.thirdPartyLink.click();
    const page1 = await page1Promise;
    await page1.waitForLoadState("load");
    await page1.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-settings.aspx#AdjustingIntegrationSettings_block",
    );
    await expect(page1).toHaveURL(
      /administration\/docspace-settings.aspx#AdjustingIntegrationSettings_block/,
    );
  });

  test("Facebook enable", async ({ page }) => {
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

  test("AWSS3 enable", async ({ page }) => {
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

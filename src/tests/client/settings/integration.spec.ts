// import Screenshot from "@/src/objects/common/Screenshot";
import { Integration } from "@/src/objects/settings/integration/Integration";
import { PaymentApi } from "@/src/api/payment";
import { test } from "@/src/fixtures";
import { integrationTabs, toastMessages } from "@/src/utils/constants/settings";
import Screenshot from "@/src/objects/common/Screenshot";

test.describe("Integration tests", () => {
  let paymentApi: PaymentApi;

  let screenshot: Screenshot;
  let integration: Integration;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);

    const portalInfo = await paymentApi.getPortalInfo(api.portalDomain);
    await paymentApi.makePortalPayment(portalInfo.tenantId, 10);
    await paymentApi.refreshPaymentInfo(api.portalDomain);

    screenshot = new Screenshot(page, {
      screenshotDir: "integration",
      fullPage: true,
    });
    integration = new Integration(page, screenshot);

    await login.loginToPortal();
    await integration.open();
  });
  test("Integration", async ({ page }) => {
    await test.step("Ldap", async () => {
      await integration.open();
      await integration.activateLdap();
    });

    await test.step("Manual sync", async () => {
      await integration.manualSyncLdap();
    });

    await test.step("Auto sync every hour", async () => {
      await integration.everyHour();
      await integration.enableAutoSyncLDAP();
    });

    await test.step("Auto sync every day", async () => {
      await integration.everyDay();
      await integration.enableAutoSyncLDAP();
    });

    await test.step("Auto sync every week", async () => {
      await integration.everyWeek();
      await integration.enableAutoSyncLDAP();
    });

    await test.step("Auto sync every month", async () => {
      await integration.everyMonth();
      await integration.enableAutoSyncLDAP();
    });

    await test.step("Auto sync every year", async () => {
      await integration.everyYear();
      await integration.enableAutoSyncLDAP();
    });

    await test.step("Disable LDAP ", async () => {
      await integration.disableLdap();
    });

    await test.step("Ldap Link", async () => {
      const page1Promise = page.waitForEvent("popup");
      await integration.ldapLink.click();
      const page1 = await page1Promise;
      await page1.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration#LdapSettings_block",
      );
      await page1.close();
    });

    await test.step("Smtp", async () => {
      await integration.openTab(integrationTabs.smtp);
      await integration.activateSMTP();
      await integration.smtpSendTestMail.click();
      await integration.removeToast(toastMessages.operationCompleted);
      await integration.defaultButton.click();
      await integration.removeToast(toastMessages.settingsUpdated);
    });

    await test.step("Smtp link", async () => {
      const page1Promise = page.waitForEvent("popup");
      await integration.smtpLink.click();
      const page1 = await page1Promise;
      await page1.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration#AdjustingIntegrationSettings_block",
      );
      await page1.close();
    });

    await test.step("Third party link", async () => {
      await integration.openTab(integrationTabs.thirdPartyServices);
      const page1Promise = page.waitForEvent("popup");
      await integration.thirdPartyLink.click();
      const page1 = await page1Promise;
      await page1.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration#AdjustingIntegrationSettings_block",
      );
      await page1.close();
    });

    await test.step("Facebook enable", async () => {
      await integration.activateFacebook();
      await integration.deactivateFacebook();
    });

    await test.step("AWSS3 enable", async () => {
      await integration.activateAWSS3();
      await integration.deactivateAWSS3();
    });

    await test.step("Google Cloud enable", async () => {
      await integration.activateGoogleCloud();
    });

    await test.step("Rackspace enable", async () => {
      await integration.activateRackspace();
    });

    await test.step("Sso enable", async () => {
      await integration.openTab(integrationTabs.sso);
      await integration.activateSso();
    });

    await test.step("Plugins", async () => {
      await integration.openTab(integrationTabs.plugins);
    });
  });
});

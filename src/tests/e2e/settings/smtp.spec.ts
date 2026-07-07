import { Integration } from "@/src/objects/settings/integration/Integration";
import { PaymentApi } from "@/src/api/payment";
import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import { integrationTabs, toastMessages } from "@/src/utils/constants/settings";

test.describe("Integration tests - SMTP", () => {
  let paymentApi: PaymentApi;
  let integration: Integration;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();

    integration = new Integration(page);

    await login.loginToPortal();
    await integration.open();
    await integration.openTab(integrationTabs.smtp);
  });

  test("Configure SMTP, send a test email and reset to default", async ({
    page,
  }) => {
    await test.step("Configure and save SMTP", async () => {
      await integration.activateSMTP();
    });

    await test.step("Send a test email", async () => {
      await integration.smtpSendTestMail.click();
      await integration.removeToast(toastMessages.operationCompleted);
    });

    await test.step("Reset to default settings", async () => {
      await integration.smtpDefaultButton.click();
      await integration.removeToast(toastMessages.settingsUpdated);
    });

    await test.step("Help link opens the SMTP settings article", async () => {
      const popupPromise = page.waitForEvent("popup", { timeout: 30000 });
      await integration.smtpLink.click();
      const popup = await popupPromise;
      await popup.waitForURL(
        /https:\/\/helpcenter\.onlyoffice\.com\/docspace\/configuration\/docspace-integration-settings\.aspx#smtpsettings_block/,
      );
      await popup.close();
    });
  });

  test("Settings persist after re-opening the tab", async () => {
    await test.step("Configure and save SMTP", async () => {
      await integration.activateSMTP();
    });

    await test.step("Re-open Integration and the SMTP tab", async () => {
      await integration.open();
      await integration.openTab(integrationTabs.smtp);
    });

    await test.step("Saved values are restored from the server", async () => {
      await expect(integration.smtpHost).toHaveValue("smtp.yandex.com");
      await expect(integration.smtpPort).toHaveValue("587");
      await expect(integration.smtpSenderDisplayName).toHaveValue("Autotest");
    });
  });
});

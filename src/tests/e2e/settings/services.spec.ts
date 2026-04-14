import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Services from "@/src/objects/settings/services/services";
import { Payments } from "@/src/objects/settings/payments/Payments";
import { PaymentApi } from "@/src/api/payment";

test.describe("Services tests", () => {
  let services: Services;

  test.beforeEach(async ({ page, api, login }) => {
    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();

    services = new Services(page);

    await login.loginToPortal();
    await services.open();
  });

  test("Backup confirmation modal", async () => {
    await services.openBackupConfirmationModal();
    await services.closeButton.click();
  });

  test("Disk storage modal", async () => {
    await services.openDiskStorageModal();
    await services.fillDiskStorageAmount("200");
    await services.diskStorageCancelButton.click();
  });

  test("Activate and deactivate backup service", async ({ page }) => {
    await test.step("Activate backup service", async () => {
      await services.backupSwitch.click();
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "POST" &&
            resp.url().includes("/api/2.0/portal/payment/servicestate"),
        ),
        services.continueButton.click(),
      ]);
      expect(response.status()).toBe(200);
    });

    await test.step("Deactivate backup service", async () => {
      await services.backupService.click();
      await services.backupActiveToggle.click();
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "POST" &&
            resp.url().includes("/api/2.0/portal/payment/servicestate"),
        ),
        services.continueButton.click(),
      ]);
      expect(response.status()).toBe(200);
    });
  });
});

test.describe("Disk storage and AI services", () => {
  let services: Services;
  let payments: Payments;

  test.beforeEach(async ({ page, login }) => {
    services = new Services(page);

    await login.loginToPortal();

    payments = new Payments(page);
    await payments.setupPaymentMethodAndTopUp(page);

    await services.open();
  });

  test("Buy disk storage", async ({ page }) => {
    await services.selectDiskStorage("200");
    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.request().method() === "PUT" &&
          resp.url().includes("/api/2.0/portal/payment/updatewallet"),
      ),
      services.buyButton.click(),
    ]);
    expect(response.status()).toBe(200);
    await services.waitForDiskStoragePage();
    await services.checkCurrentSubscriptionVisible();
  });

  test("AI credits top up", async ({ page }) => {
    await services.openAiCreditsModal();

    await services.aiAmountInput.fill("100");
    await expect(services.aiAmountInput).toHaveValue("100");

    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes("/api/2.0/portal/payment/walletservice") &&
          resp.url().includes("aitools"),
      ),
      services.aiTopUpButton.click(),
    ]);
    expect(response.status()).toBe(200);
    await services.removeToast("ONLYOFFICE AI service successfully enabled.");
    await services.waitForAiServicesPage();
    await services.checkAiCreditsVisible();
  });
});

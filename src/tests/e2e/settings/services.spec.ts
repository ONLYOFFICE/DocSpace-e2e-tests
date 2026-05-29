import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Services from "@/src/objects/settings/services/services";
import { PaymentApi } from "@/src/api/payment";
import MyDocuments from "@/src/objects/files/MyDocuments";
import { Backup } from "@/src/objects/settings/backup/Backup";

test.describe("Backup service", () => {
  let services: Services;
  let paymentApi: PaymentApi;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();

    services = new Services(page);
    await login.loginToPortal();
    await services.open();
  });

  test("Activate and deactivate backup service", async ({ page }) => {
    await test.step("Activate backup service", async () => {
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "POST" &&
            resp.url().includes("/api/2.0/portal/payment/servicestate"),
        ),
        services.backupSwitch.click(),
      ]);
      expect(response.status()).toBe(200);
    });

    await test.step("Deactivate backup service", async () => {
      await services.backupService.click();
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "POST" &&
            resp.url().includes("/api/2.0/portal/payment/servicestate"),
        ),
        services.serviceActiveToggle.click(),
      ]);
      expect(response.status()).toBe(200);
    });
  });

  test("Download backup report", async ({ page, api }) => {
    await test.step("Activate backup service", async () => {
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "POST" &&
            resp.url().includes("/api/2.0/portal/payment/servicestate"),
        ),
        services.backupSwitch.click(),
      ]);
      expect(response.status()).toBe(200);
    });

    await test.step("Top up wallet to pay for the billed backup", async () => {
      await paymentApi.makeWalletTopUp();
    });

    await test.step("Create paid backup to generate a transaction", async () => {
      const backup = new Backup(page);
      await backup.open();
      // First 2 backups are free on the business plan; the 3rd is billed
      await backup.createBackupInRoom();
      await backup.createAnotherBackupCopy();
      await backup.createAnotherBackupCopy();
    });

    await test.step("Verify report appears in My Documents", async () => {
      await services.open();
      await services.backupService.click();
      await services.downloadReport();
      const myDocuments = new MyDocuments(page, api.portalDomain);
      await myDocuments.open();
      await myDocuments.filesTable.expectItemVisible(/report/i);
    });
  });
});

test.describe("Disk storage service", () => {
  let services: Services;
  let paymentApi: PaymentApi;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();
    await paymentApi.makeWalletTopUp();

    services = new Services(page);
    await login.loginToPortal();
    await services.open();
  });

  test("Activate and deactivate disk storage service", async ({ page }) => {
    await test.step("Activate disk storage service", async () => {
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

    await test.step("Deactivate disk storage service", async () => {
      await services.diskStorageSettingsIcon.click();
      await services.cancelSubscriptionMenuItem.click();
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "GET" &&
            resp.url().includes("/api/2.0/portal/tariff"),
        ),
        services.diskStorageCancelOkButton.click(),
      ]);
      expect(response.status()).toBe(200);
      await services.checkCancellationScheduled();
    });
  });

  test("Edit disk storage subscription", async ({ page }) => {
    await test.step("Activate disk storage service", async () => {
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
    });

    await test.step("Edit subscription", async () => {
      await services.diskStorageSettingsIcon.click();
      await services.editSubscriptionMenuItem.click();
      await services.fillDiskStorageAmount("300");
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "PUT" &&
            resp.url().includes("/api/2.0/portal/payment/updatewallet"),
        ),
        services.buyButton.click(),
      ]);
      expect(response.status()).toBe(200);
      await services.checkDiskStorageSubscriptionSize("300");
    });
  });

  test("Download disk storage report", async ({ page, api }) => {
    await test.step("Activate disk storage service", async () => {
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
    });

    await test.step("Verify report appears in My Documents", async () => {
      await services.downloadReport();
      const myDocuments = new MyDocuments(page, api.portalDomain);
      await myDocuments.open();
      await myDocuments.filesTable.expectItemVisible(/report/i);
    });
  });
});

test.describe("AI services", () => {
  let services: Services;
  let paymentApi: PaymentApi;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();
    await paymentApi.makeWalletTopUp();

    services = new Services(page);
    await login.loginToPortal();
    await services.open();
  });

  // Onlyoffice AI Service is disabled
  test.skip("AI credits top up", async ({ page }) => {
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

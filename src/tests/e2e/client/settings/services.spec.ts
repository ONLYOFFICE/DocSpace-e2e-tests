import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Services from "@/src/objects/settings/services/services";
import { Payments } from "@/src/objects/settings/payments/Payments";

test.describe("Services tests", () => {
  let services: Services;
  let payments: Payments;

  test.beforeEach(async ({ page, login }) => {
    services = new Services(page);
    payments = new Payments(page);

    await login.loginToPortal();
    await services.open();
  });

  test("All services test", async ({ page }) => {
    await test.step("Open top up wallet modal in backup service", async () => {
      await services.checkServicesRendered();
      await services.openTopUpWalletModal();
      await payments.cancelButton.click();
    });

    await test.step("Open backup service modal in backup service", async () => {
      await services.openBackupServiceModal();
      await services.closeBackupServiceModal.click();
      await services.clickSwitchInBackupServiceModal();
      await payments.cancelButton.click();
    });

    await test.step("Open disk storage modal", async () => {
      await services.openDiskStorageModal();
      await services.checkAdditionalStorage();
      await services.topUpLinkClick();
      await services.backTopUpButton.click();
      await services.diskStorageCancelButton.click();
    });

    await test.step("Activate backup service", async () => {
      await services.backupSwitch.click();
      await services.addPaymentsMethod(page);

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

    await test.step("Buy disk storage", async () => {
      await services.selectDiskStorage();
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "PUT" &&
            resp.url().includes("/api/2.0/portal/payment/updatewallet"),
        ),
        services.buyButton.click(),
      ]);
      expect(response.status()).toBe(200);
    });

    await test.step("Downgrade disk storage", async () => {
      await services.changeDiskStorageMinus();
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "PUT" &&
            resp.url().includes("/api/2.0/portal/payment/updatewallet"),
        ),
        services.buyButton.click(),
      ]);
      expect(response.status()).toBe(200);

      await expect(page.getByText("GB → 199 GB in total")).toBeVisible();
      await services.hideDateCurrentPayment();
      await services.diskStorageCancelButton.click();
      await services.diskStorageBlock.click();

      const [response2] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "PUT" &&
            resp.url().includes("/api/2.0/portal/payment/updatewallet"),
        ),
        services.cancelChangeLink.click(),
      ]);
      expect(response2.status()).toBe(200);
      await services.diskStorageCancelButton.click();
    });

    await test.step("Upgrade disk storage", async () => {
      await services.changeDiskStoragePlus();
      await services.hideDateCurrentPayment();
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "PUT" &&
            resp.url().includes("/api/2.0/portal/payment/updatewallet"),
        ),
        services.buyButton.click(),
      ]);
      expect(response.status()).toBe(200);
    });

    await test.step("stripe link", async () => {
      const page1Promise = page.waitForEvent("popup");
      await payments.stripeCustomerPortalLink.click();
      const page1 = await page1Promise;
      await page1.waitForURL("https://billing.stripe.com/p/session/*");
      await expect(page1).toHaveURL(/billing.stripe.com/);
      await page1.close();
    });

    await test.step("Info button", async () => {
      await services.infoButton.click();
    });
  });
});

import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Services from "@/src/objects/settings/services/services";
import { Payments } from "@/src/objects/settings/payments/Payments";
import { PaymentApi } from "@/src/api/payment";

test.describe.skip("Services tests", () => {
  let services: Services;
  let payments: Payments;

  test.beforeEach(async ({ page, api, login }) => {
    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();

    services = new Services(page);
    payments = new Payments(page);

    await login.loginToPortal();
    await services.open();
  });

  test("Backup service modal", async () => {
    await services.openBackupServiceModal();
    await services.closeBackupServiceModal.click();
    await services.clickSwitchInBackupServiceModal();
    await payments.cancelButton.click();
  });

  test("Disk storage modal", async () => {
    await services.openDiskStorageModal();
    await services.checkAdditionalStorage();
    await services.topUpLinkClick();
    await services.backTopUpButton.click();
    await services.diskStorageCancelButton.click();
  });

  test("Activate and deactivate backup service", async ({ page }) => {
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
  });

  test("Buy disk storage", async ({ page }) => {
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

  test("Downgrade disk storage", async ({ page }) => {
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

  test("Upgrade disk storage", async ({ page }) => {
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

  // TODO: payment.ashx returns 404, Stripe redirect is broken — bug on DocSpace side
  // test("Stripe link", async ({ page }) => {
  //   const page1Promise = page.waitForEvent("popup");
  //   await payments.stripeCustomerPortalLink.click();
  //   const page1 = await page1Promise;
  //   await page1.waitForURL("https://billing.stripe.com/p/session/*");
  //   await expect(page1).toHaveURL(/billing.stripe.com/);
  //   await page1.close();
  // });

  test("Info button", async () => {
    await services.infoButton.click();
  });
});

import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Screenshot from "@/src/objects/common/Screenshot";
import StorageManagement from "@/src/objects/settings/storageManagement/StorageManagement";
import { PaymentApi } from "@/src/api/payment";

test.describe("Storage Management", () => {
  let paymentApi: PaymentApi;
  let screenshot: Screenshot;
  let storageManagement: StorageManagement;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);

    const portalInfo = await paymentApi.getPortalInfo(api.portalDomain);
    await paymentApi.makePortalPayment(portalInfo.tenantId, 10);
    await paymentApi.refreshPaymentInfo(api.portalDomain);

    screenshot = new Screenshot(page, {
      screenshotDir: "storageManagement",
      fullPage: true,
    });
    storageManagement = new StorageManagement(page);
    screenshot = new Screenshot(page, {
      screenshotDir: "storageManagement",
      fullPage: true,
    });
    storageManagement = new StorageManagement(page);

    await login.loginToPortal();
    await storageManagement.open();
  });

  test.skip("Storage Management full flow", async ({ page }) => {
    await test.step("Storage Management Render", async () => {
      await storageManagement.checkStorageManagementRender();
      await storageManagement.hideDate();
      await screenshot.expectHaveScreenshot("storage_management_render");
    });

    await test.step("Storage Management guide link", async () => {
      const page1Promise = page.waitForEvent("popup");
      await storageManagement.storageManagementGuideLink.click();
      const page1 = await page1Promise;
      await page1.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration#StorageManagement_block",
      );
      await expect(page1).toHaveURL(
        /docspace\/configuration#StorageManagement_block/,
      );
      await page1.close();
    });

    await test.step("Quota Room Activate", async () => {
      await storageManagement.QuotaRoomActivate();
      await storageManagement.hideDate();
      await screenshot.expectHaveScreenshot("storage_management_quota_room");
    });

    await test.step("Quota User Activate", async () => {
      await storageManagement.QuotaUserActivate();
      await storageManagement.hideDate();
      await screenshot.expectHaveScreenshot("storage_management_quota_user");
    });
  });
});

import { test, Page, expect } from "@playwright/test";

import API from "@/src/api";
import Login from "@/src/objects/common/Login";

import Screenshot from "@/src/objects/common/Screenshot";
import StorageManagement from "@/src/objects/settings/storageManagement/StorageManagement";
import { PaymentApi } from "@/src/api/payment";

test.describe("Storage Management", () => {
  let api: API;
  let paymentApi: PaymentApi;
  let page: Page;

  let login: Login;
  let screenshot: Screenshot;
  let storageManagement: StorageManagement;

  test.beforeAll(async ({ playwright, browser }) => {
    const apiContext = await playwright.request.newContext();
    api = new API(apiContext);
    paymentApi = new PaymentApi(apiContext, api.apisystem);
    await api.setup();
    console.log(api.portalDomain);

    const portalInfo = await paymentApi.getPortalInfo(api.portalDomain);
    await paymentApi.makePortalPayment(portalInfo.tenantId, 10);
    await paymentApi.refreshPaymentInfo(api.portalDomain);

    page = await browser.newPage();

    await page.addInitScript(() => {
      globalThis.localStorage?.setItem("integrationUITests", "true");
    });

    login = new Login(page, api.portalDomain);
    screenshot = new Screenshot(page, {
      screenshotDir: "storageManagement",
      fullPage: true,
    });
    storageManagement = new StorageManagement(page);

    await login.loginToPortal();
    await storageManagement.open();
  });

  test("Storage Management full flow", async () => {
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
      await expect(page1).toHaveURL(/docspace\/configuration\#StorageManagement_block/);
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

  test.afterAll(async () => {
    await api.cleanup();
    await page.close();
  });
});

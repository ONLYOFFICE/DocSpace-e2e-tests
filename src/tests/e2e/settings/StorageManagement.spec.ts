import { test } from "@/src/fixtures";
import StorageManagement from "@/src/objects/settings/storageManagement/StorageManagement";
import { PaymentApi } from "@/src/api/payment";
import { toastMessages } from "@/src/utils/constants/settings";

test.describe("Storage Management", () => {
  let paymentApi: PaymentApi;
  let storageManagement: StorageManagement;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);

    await paymentApi.setupPayment();

    storageManagement = new StorageManagement(page);

    await login.loginToPortal();
    await storageManagement.open();
  });

  test("Storage Management full flow", async ({ page }) => {
    await test.step("Storage Management Render", async () => {
      await storageManagement.checkStorageManagementRender();
    });

    await test.step("Storage Management guide link", async () => {
      const page1Promise = page.waitForEvent("popup");
      await storageManagement.storageManagementGuideLink.click();
      const page1 = await page1Promise;
      await page1.waitForURL(
        /https:\/\/helpcenter\.onlyoffice\.com\/docspace\/configuration\/docspace-storage-management-settings\.aspx/,
      );
      await page1.close();
    });

    await test.step("Quota Room Activate", async () => {
      await storageManagement.QuotaRoomActivate();
      await storageManagement.dismissToastSafely(
        toastMessages.roomQuotaEnabled,
      );
    });

    await test.step("Quota User Activate", async () => {
      await storageManagement.QuotaUserActivate();
      await storageManagement.dismissToastSafely(
        toastMessages.userQuotaEnabled,
      );
    });

    await test.step("Quota AI Agent Activate", async () => {
      await storageManagement.QuotaAiAgentActivate();
      await storageManagement.dismissToastSafely(toastMessages.aiQuotaEnabled);
    });
  });
});

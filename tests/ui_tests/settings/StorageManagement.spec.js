import { test, expect } from '@playwright/test';
import { StorageManagement } from "../../../page_objects/Settings/StorageManagement";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

    test.describe('Storage Management Tests', () => {  
        let apiContext;
        let portalSetup;
        let portalLoginPage;
        let storageManagement;

      test.beforeAll(async ({ playwright }) => {
            apiContext = await playwright.request.newContext();
            portalSetup = new PortalSetupApi(apiContext);
            const portalData = await portalSetup.setupPortal();
           });

    test.beforeEach(async ({ page }) => {
        storageManagement = new StorageManagement(page);
        portalLoginPage = new PortalLoginPage(page);
        await portalLoginPage.loginToPortal(portalSetup.portalDomain);
      });

      test.afterAll(async () => {
              await portalSetup.deletePortal();
              await apiContext.dispose();
            }); 

      test('Storage Management Link', async ({ page }) => {
        test.setTimeout(60000);
        await storageManagement.navigateToSettings();
        await storageManagement.navigateToStorageManagement.click();
        const page1Promise = page.waitForEvent('popup');
        await storageManagement.storageManagementGuideLink.click();
        const page1 = await page1Promise;
        await page1.waitForURL('https://*.onlyoffice.com/administration/docspace-settings.aspx#StorageManagement_block');
        await expect(page1).toHaveURL(/administration\/docspace-settings.aspx\#StorageManagement_block/);
      });

      test.skip('Quota Room - temporarily disabled due to lack of payment', async ({ page }) => {
        await storageManagement.navigateToSettings();
        await storageManagement.navigateToStorageManagement.click();
        await storageManagement.QuotaRoomActivate();
        await expect(page.locator('text=Room quota has been successfully enabled.')).toHaveText('Room quota has been successfully enabled.', { timeout: 10000 });
        await storageManagement.removeToast.click();
        await storageManagement.onOffQuotaRoom.click();
        await expect(page.locator('text=Room quota has been successfully disabled.')).toHaveText('Room quota has been successfully disabled.', { timeout: 10000 });
      });

      test.skip('Quota User - temporarily disabled due to lack of payment', async ({ page }) => {
        await storageManagement.navigateToSettings();
        await storageManagement.navigateToStorageManagement.click();
        await storageManagement.QuotaUserActivate();
        await expect(page.locator('text=User quota has been successfully enabled.')).toHaveText('User quota has been successfully enabled.', { timeout: 10000 });
        await storageManagement.removeToast2.click();
        await storageManagement.onOffQuotaUser.click();
        await expect(page.locator('text=User quota has been successfully disabled.')).toHaveText('User quota has been successfully disabled.', { timeout: 10000 });
      });
});
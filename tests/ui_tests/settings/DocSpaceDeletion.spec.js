import { test, expect } from '@playwright/test';
import { DeletionPortal } from "../../../page_objects/Settings/DeletionPortal";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

    test.describe('Security Tests', () => {  
      let apiContext;
      let portalSetup;
      let portalLoginPage;
        let deletionportal;

      test.beforeAll(async ({ playwright }) => {
            apiContext = await playwright.request.newContext();
            portalSetup = new PortalSetupApi(apiContext);
            const portalData = await portalSetup.setupPortal();
           });

    test.beforeEach(async ({ page }) => {
        deletionportal = new DeletionPortal(page);
        portalLoginPage = new PortalLoginPage(page);
        await portalLoginPage.loginToPortal(portalSetup.portalDomain);
      });

      test.afterAll(async () => {
                await portalSetup.deletePortal();
                await apiContext.dispose();
              }); 

      test('Delete Portal', async ({ page }) => {
        await deletionportal.navigateToSettings();
        await deletionportal.navigateToDeletionPortal.click();
        await page.waitForTimeout(1000);
        await deletionportal.deletionPortal();
        await page.waitForTimeout(1000);
        await expect(page.locator('text=A link to confirm the operation has been sent')).toHaveText('A link to confirm the operation has been sent', { timeout: 10000 });
      });

      test('Deactivate Portal', async ({ page }) => {
        await deletionportal.navigateToSettings();
        await deletionportal.navigateToDeletionPortal.click();
        await page.waitForTimeout(1000);
        await deletionportal.deactivationPortal();
        await page.waitForTimeout(1000);
        await expect(page.locator('text=A link to confirm the operation has been sent')).toHaveText('A link to confirm the operation has been sent', { timeout: 10000 });        
      });
    });
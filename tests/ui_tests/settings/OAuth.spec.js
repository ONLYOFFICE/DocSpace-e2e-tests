import { test, expect } from '@playwright/test';
import { OAuth } from '../../../page_objects/Settings/OAuth';
import { PortalSetupApi } from '../../../api_library/portal_setup';
import { PortalLoginPage } from '../../../page_objects/portal_login_page';

test.describe('OAuth Tests', () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let oAuth;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    const portalData = await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    oAuth = new OAuth(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

<<<<<<< HEAD
  test('OAuth Create', async ({ page }) => {
    await oAuth.navigateToSettings();
    await oAuth.navigateToOAuth();
    await oAuth.createOAuthApplication();
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Autotest')).toBeVisible({ timeout: 5000 });
  });
=======
      test('OAuth Create', async ({ page }) => {
        await oAuth.navigateToSettings();
        await oAuth.navigateToOAuth();
        await oAuth.createOAuthApplication();
        await page.waitForTimeout(2000);
        await expect(page.locator('text=Autotest')).toBeVisible({ timeout: 5000 });
      });
>>>>>>> main

  test('OAuth Edit', async ({ page }) => {
    await oAuth.navigateToSettings();
    await oAuth.navigateToOAuth();
    await oAuth.editOAuthApplication();
    await page.waitForTimeout(2000);
    await expect(page.locator('text=AutotestRename')).toBeVisible({ timeout: 10000 });
  });

  test('OAuth Token Create/Revoke', async ({ page }) => {
    await oAuth.navigateToSettings();
    await oAuth.navigateToOAuth();
    await oAuth.generateOAuthToken();
    await expect(page.locator('text=Developer token successfully copied to clipboard')).toHaveText(
      'Developer token successfully copied to clipboard',
      { timeout: 10000 }
    );
    await oAuth.oauthRemoveToast.click();
    await oAuth.oauthRevokeToken.click();
    await oAuth.generateOAuthToken();
    await expect(page.locator('text=Token revoked successfully')).toHaveText(
      'Token revoked successfully',
      { timeout: 10000 }
    );
  });

  test('Enable Disable', async ({ page }) => {
    await oAuth.navigateToSettings();
    await oAuth.navigateToOAuth();
    await oAuth.deactivationOAuthApplication();
    await expect(page.locator('text=Application disabled successfully')).toHaveText(
      'Application disabled successfully',
      { timeout: 10000 }
    );
    await oAuth.oauthRemoveToast2.click();
    await oAuth.activationOAuthApplication();
    await expect(page.locator('text=Application enabled successfully')).toHaveText(
      'Application enabled successfully',
      { timeout: 10000 }
    );
  });

<<<<<<< HEAD
  test('OAuth Delete', async ({ page }) => {
    await oAuth.navigateToSettings();
    await oAuth.navigateToOAuth();
    await oAuth.deleteOAuthApplication();
    await expect(page.locator('text=Application deleted successfully')).toHaveText(
      'Application deleted successfully',
      { timeout: 10000 }
    );
  });

  test('OAuth Link', async ({ page }) => {
    test.setTimeout(60000);
    await oAuth.navigateToSettings();
    await oAuth.navigateToOAuth();
    const page1Promise = page.waitForEvent('popup');
    await oAuth.oauthGuideLink.click();
    const page1 = await page1Promise;
    await page1.waitForURL('https://*.onlyoffice.com/administration/docspace-settings.aspx#oauth');
    await expect(page1).toHaveURL(/administration\/docspace-settings.aspx\#oauth/);
  });
});
=======
      test('OAuth Delete', async ({ page }) => {
        await oAuth.navigateToSettings();
        await oAuth.navigateToOAuth();
        await oAuth.deleteOAuthApplication();
        await expect(page.locator('text=Application deleted successfully')).toHaveText('Application deleted successfully', { timeout: 10000 });
      });
      
      test('OAuth Link', async ({ page }) => {
        test.setTimeout(60000);
        await oAuth.navigateToSettings();
        await oAuth.navigateToOAuth();
        const page1Promise = page.waitForEvent('popup');
        await oAuth.oauthGuideLink.click();
        const page1 = await page1Promise;
        await page1.waitForURL('https://*.onlyoffice.com/administration/docspace-settings.aspx#oauth');
        await expect(page1).toHaveURL(/administration\/docspace-settings.aspx\#oauth/);
      });
});
>>>>>>> main

import { test, expect } from '@playwright/test';
import { Integration } from "../../../page_objects/settings/integration";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

    test.describe('Integration tests', () => {  
      let apiContext;
      let portalSetup;
      let portalLoginPage;
      let integration;

    test.beforeAll(async ({ playwright }) => {
      apiContext = await playwright.request.newContext();
      portalSetup = new PortalSetupApi(apiContext);
      const portalData = await portalSetup.setupPortal();
    });

    test.beforeEach(async ({ page }) => {
      integration = new Integration(page);
      portalLoginPage = new PortalLoginPage(page);
      await portalLoginPage.loginToPortal(portalSetup.portalDomain);
    });

    test.afterAll(async () => {
      await portalSetup.deletePortal();
      await apiContext.dispose();
    });

      test.skip('Ldap - temporarily disabled due to lack of payment', async ({ page }) => {
        await integration.navigateToSettings();
        await integration.navigateToIntegration.click();
        await integration.activateLdap();
        await expect(page.locator('text=100% Operation has been successfully completed')).toBeVisible({ timeout: 3000 });
      });

      test.skip('Manual sync - temporarily disabled due to lack of payment', async ({ page }) => {
        await integration.navigateToSettings();
        await integration.manualSyncLdap();
        await expect(page.locator('text=100% Operation has been successfully completed.')).toBeVisible({ timeout: 3000 });
      });

      test.skip('Auto sync every hour - temporarily disabled due to lack of payment', async ({ page }) => {
        await integration.navigateToSettings();
        await integration.everyHour();
        await expect(page.locator('text=Settings have been successfully updated')).toBeVisible({ timeout: 10000 });
        await integration.removeToast.click();
        await integration.enableAutoSyncLDAP.click();
        await expect(page.locator('text=Settings have been successfully updated')).toBeVisible({ timeout: 10000 });
      });

      test.skip('Auto sync every day - temporarily disabled due to lack of payment', async ({ page }) => {
        await integration.navigateToSettings();
        await integration.everyDay();
        await expect(page.locator('text=Settings have been successfully updated')).toBeVisible({ timeout: 10000 });
        await integration.removeToast.click();
        await integration.enableAutoSyncLDAP.click();
        await expect(page.locator('text=Settings have been successfully updated')).toBeVisible({ timeout: 10000 });
      });

      test.skip('Auto sync every week - temporarily disabled due to lack of payment', async ({ page }) => {
        await integration.navigateToSettings();
        await integration.everyWeek();
        await expect(page.locator('text=Settings have been successfully updated')).toBeVisible({ timeout: 10000 });
        await integration.removeToast.click();
        await integration.enableAutoSyncLDAP.click();
        await expect(page.locator('text=Settings have been successfully updated')).toBeVisible({ timeout: 10000 });
      });

      test.skip('Auto sync every month - temporarily disabled due to lack of payment', async ({ page }) => {
        await integration.navigateToSettings();
        await integration.everyMonth();
        await expect(page.locator('text=Settings have been successfully updated')).toBeVisible({ timeout: 10000 });
        await integration.removeToast.click();
        await integration.enableAutoSyncLDAP.click();
        await expect(page.locator('text=Settings have been successfully updated')).toBeVisible({ timeout: 10000 });
      });

      test.skip('Auto sync every year - temporarily disabled due to lack of payment', async ({ page }) => {
        await integration.navigateToSettings();
        await integration.everyYear();
        await expect(page.locator('text=Settings have been successfully updated')).toBeVisible({ timeout: 10000 });
        await integration.removeToast.click();
        await integration.enableAutoSyncLDAP.click();
        await expect(page.locator('text=Settings have been successfully updated')).toBeVisible({ timeout: 10000 });
      });

      test.skip('Disable LDAP  - temporarily disabled due to lack of payment', async ({ page }) => {
        await integration.navigateToSettings();
        await integration.navigateToIntegration.click();
        await page.waitForTimeout(1000);
        await integration.disableLdap();
        await expect(page.locator('text=100% Operation has been successfully completed')).toBeVisible({ timeout: 3000 });
      });

      test('Ldap Link', async ({ page }) => {
        test.setTimeout(60000);
        await integration.navigateToSettings();
        await integration.navigateToIntegration.click();
        await page.waitForTimeout(2000);
        const page1Promise = page.waitForEvent('popup');
        await integration.ldapLink.click();
        const page1 = await page1Promise;
        await page1.waitForURL('https://*.onlyoffice.com/administration/docspace-settings.aspx#LdapSettings_block');
        await expect(page1).toHaveURL(/administration\/docspace-settings.aspx\#LdapSettings_block/);
      });

      test('Smtp', async ({ page }) => {
        await integration.navigateToSettings();
        await integration.navigateToSMTPSettings();
        await integration.activateSMTP();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
        await integration.removeToast.click();
        await integration.smtpSendTestMail.click();
        await page.waitForTimeout(2000);
        await expect(page.locator('text=Operation has been successfully completed.')).toHaveText('Operation has been successfully completed.', { timeout: 10000 });
        await integration.removeToast2.click();
        await integration.DefaultButton.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
      });

      test('Smtp link', async ({ page }) => {
        await integration.navigateToSettings();
        await integration.navigateToSMTPSettings();
        const page1Promise = page.waitForEvent('popup');
        await integration.smtpLink.click();
        const page1 = await page1Promise;
        await page1.waitForURL('https://*.onlyoffice.com/administration/docspace-settings.aspx#AdjustingIntegrationSettings_block');
        await expect(page1).toHaveURL(/administration\/docspace-settings.aspx\#AdjustingIntegrationSettings_block/);
      });

      test('Third party link', async ({ page }) => {
        await integration.navigateToSettings();
        await integration.navigateToThirdPartyServices();
        const page1Promise = page.waitForEvent('popup');
        await integration.thirdPartyLink.click();
        const page1 = await page1Promise;
        await page1.waitForURL('https://*.onlyoffice.com/administration/docspace-settings.aspx#AdjustingIntegrationSettings_block');
        await expect(page1).toHaveURL(/administration\/docspace-settings.aspx\#AdjustingIntegrationSettings_block/);
      });

      test('Facebook enable', async ({ page }) => {
        await integration.navigateToSettings();
        await integration.navigateToThirdPartyServices();
        await integration.activateFacebook();
        await expect(page.locator('text=Updated successfully')).toHaveText('Updated successfully', { timeout: 10000 });
        await integration.facebookSwitch.click();
        await expect(page.locator('text=Deactivated successfully')).toHaveText('Deactivated successfully', { timeout: 10000 });
      });

      test('AWSS3 enable', async ({ page }) => {
        await integration.navigateToSettings();
        await integration.navigateToThirdPartyServices();
        await integration.activateAWSS3();
        await expect(page.locator('text=Updated successfully')).toHaveText('Updated successfully', { timeout: 10000 });
        await integration.s3Switch.click();
        await expect(page.locator('text=Deactivated successfully')).toHaveText('Deactivated successfully', { timeout: 10000 });
      });
});



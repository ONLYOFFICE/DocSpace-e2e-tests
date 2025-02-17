import { test, expect } from '@playwright/test';
import { Security } from "../../../page_objects/Settings/Security";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

    test.describe('Security Tests', () => {  
      let apiContext;
      let portalSetup;
      let portalLoginPage;
      let security;

    test.beforeAll(async ({ playwright }) => {
            apiContext = await playwright.request.newContext();
            portalSetup = new PortalSetupApi(apiContext);
            const portalData = await portalSetup.setupPortal();
           });

    test.beforeEach(async ({ page }) => {
        security = new Security(page);
        portalLoginPage = new PortalLoginPage(page);
        await portalLoginPage.loginToPortal(portalSetup.portalDomain);
      });

      test.afterAll(async () => {
        await portalSetup.deletePortal();
        await apiContext.dispose();
      });

      test('Password Strength', async ({ page }) => {
        await security.navigateToSettings();
        await security.navigateToSecurity.click();
        await security.updatePasswordStrength(17);
        await security.removeToast.click();
        await page.waitForTimeout(1000);
        await security.updatePasswordStrength2(8);
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
      });

      test('Trusted mail Domain', async ({ page }) => {
        await security.navigateToSettings();
        await security.navigateToSecurity.click();
        await security.anyDomainsActivation();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
        await page.waitForTimeout(1000);
        await security.removeToast.click();
        await security.customDomainsActivation();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
        await page.waitForTimeout(1000);
        await security.removeToast.click();
        await security.disableDomains();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
      });

   
      test('Ip security', async ({ page }) => {
        await security.navigateToSettings();
        await security.navigateToSecurity.click();
        await security.ipActivation();
        await page.waitForTimeout(1000);
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
        await security.removeToast.click();
        await security.ipDeactivation();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
      });   
      

      test('Brute forse', async ({ page }) => {
        await security.navigateToSettings();
        await security.navigateToSecurity.click();
        await security.bruteForceActivation();
        await security.removeToast.click();
        await security.restoreToDefaultButton.click();
        const input = page.getByPlaceholder('Enter number');
        await expect(input).toHaveValue('5');
      });

      test('Administrator Message', async ({ page }) => {
        await security.navigateToSettings();
        await security.navigateToSecurity.click();
        await security.adminMessageActivation();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
        await security.removeToast.click();
        await page.waitForTimeout(1000);
        await security.adminMessageDeactivation();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
      });

      test('Security Link', async ({ page }) => {
        test.setTimeout(60000);
        await security.navigateToSettings();
        await security.navigateToSecurity.click();
        await page.waitForTimeout(2000);
        const page1Promise = page.waitForEvent('popup');
        await security.passwordStrengthGuideLink.click();
        const page1 = await page1Promise;
        await page1.waitForURL('https://*.onlyoffice.com/administration/docspace-settings.aspx#passwordstrength');
        await expect(page1).toHaveURL(/administration\/docspace-settings.aspx\#passwordstrength/);
        const page2Promise = page.waitForEvent('popup');
        await security.twoFactorAuthenticationGuideLink.click();
        const page2 = await page2Promise;
        await page2.waitForURL('https://*.onlyoffice.com/administration/docspace-two-factor-authentication.aspx');
        await expect(page2).toHaveURL(/administration\/docspace-two-factor-authentication.aspx/);
        const page3Promise = page.waitForEvent('popup');
        await security.trustedDomainGuideLink.click();
        const page3 = await page3Promise;
        await page3.waitForURL('https://*.onlyoffice.com/administration/docspace-settings.aspx#TrustedDomain');
        await expect(page3).toHaveURL(/administration\/docspace-settings.aspx\#TrustedDomain/);
        const page4Promise = page.waitForEvent('popup');
        await security.ipSecurityGuideLink.click();
        const page4 = await page4Promise;
        await page4.waitForURL('https://*.onlyoffice.com/administration/docspace-settings.aspx#ipsecurity');
        await expect(page4).toHaveURL(/administration\/docspace-settings.aspx\#ipsecurity/);
        const page5Promise = page.waitForEvent('popup');
        await security.bruteForceGuideLink.click();
        const page5 = await page5Promise;
        await page5.waitForURL('https://*.onlyoffice.com/administration/configuration.aspx#loginsettings');
        await expect(page5).toHaveURL(/administration\/configuration.aspx\#loginsettings/);
        const page6Promise = page.waitForEvent('popup');
        await security.adminMessageGuideLink.click();
        const page6 = await page6Promise;
        await page6.waitForURL('https://*.onlyoffice.com/administration/docspace-settings.aspx#administratormessage');
        await expect(page6).toHaveURL(/administration\/docspace-settings.aspx\#administratormessage/);
        const page7Promise = page.waitForEvent('popup');
        await security.sessionLifetimeGuideLink.click();
        const page7 = await page7Promise;
        await page7.getByText('Enable', { exact: true }).nth(1).click();
        await page7.waitForURL('https://*.onlyoffice.com/administration/docspace-settings.aspx#sessionlifetime');
        await expect(page7).toHaveURL(/administration\/docspace-settings.aspx\#sessionlifetime/);
      });

      test.skip('Login History - temporarily disabled due to lack of payment', async ({ page }) => {
        await security.navigateToSettings();
        await security.navigateToLoginHistory();
        await expect(page.locator('text=Successful Login via API').first()).toHaveText('Successful Login via API', { timeout: 10000 });
      });

      test.skip('Audit Trail - temporarily disabled due to lack of payment', async ({ page }) => {
        await security.navigateToSettings();
        await security.navigateToAuditTrail();
        await expect(page.locator('text=Language Updated').first()).toHaveText('Language Updated', { timeout: 10000 });
      });
        
      test.skip('Session Lifetime - portal removal method crashes', async ({ page }) => {
        await security.navigateToSettings();
        await security.navigateToSecurity.click();
        await security.sessionLifetimeActivation();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
        await security.removeToast.click();
        await page.waitForTimeout(1000);
        await security.sessionLifetimeDeactivation();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
      });
});
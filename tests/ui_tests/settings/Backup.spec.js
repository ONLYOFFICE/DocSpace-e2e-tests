import { test, expect } from '@playwright/test';
import { Backup } from "../../../page_objects/Settings/Backup";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

    test.describe('Backup Portal Tests', () => {
        let apiContext;
        let portalSetup;
        let portalLoginPage;
        let backup;

    test.beforeAll(async ({ playwright }) => {
        apiContext = await playwright.request.newContext();
        portalSetup = new PortalSetupApi(apiContext);
        const portalData = await portalSetup.setupPortal();
    });


    test.beforeEach(async ({ page }) => {
        backup = new Backup(page);
        portalLoginPage = new PortalLoginPage(page);
        await portalLoginPage.loginToPortal(portalSetup.portalDomain);
    });

    test.afterAll(async () => {
        await portalSetup.deletePortal();
       await apiContext.dispose();
    });

    test('Backup link', async ({ page }) => {
        test.setTimeout(60000);
        await backup.navigateToSettings();
        await backup.navigateTobackup.click();
        await page.waitForTimeout(1000);
        const page1 = await backup.BackupGuidePopup();
        await page1.waitForURL('https://*.onlyoffice.com/administration/docspace-settings.aspx#CreatingBackup_block');
        await expect(page1).toHaveURL(/administration\/docspace-settings.aspx\#CreatingBackup_block/);
    });

    test('Auto backup link', async ({ page }) => {
        await backup.navigateToSettings();
        await backup.navigateToAutoBackup();
        await page.waitForTimeout(1000);
        const page1 = await backup.BackupGuidePopup();
        await page1.waitForURL('https://*.onlyoffice.com/administration/docspace-settings.aspx#AutoBackup');
        await expect(page1).toHaveURL(/administration\/docspace-settings.aspx\#AutoBackup/);
    });

    test.skip('Every day auto backup - временно отключено из-за отсутствия платности', async ({ page }) => {
        await backup.navigateToSettings();
        await backup.navigateToAutoBackup();
        await backup.backupRoom();
        await backup.autoSavePeriodForEveryDay();  
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
        await backup.removeToast.click();
        await backup.disableAutoBackup();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
    });

    test.skip('Every week auto backup - временно отключено из-за отсутствия платности', async ({ page }) => {
        await backup.navigateToSettings();
        await backup.navigateToAutoBackup();
        await backup.backupRoom();
        await backup.autoSavePeriodForEveryWeek();  
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
        await backup.removeToast.click();
        await backup.disableAutoBackup();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
    });

    test.skip('Every month auto backup - временно отключено из-за отсутствия платности', async ({ page }) => {
        await backup.navigateToSettings();
        await backup.navigateToAutoBackup();
        await backup.backupRoom();
        await backup.autoSavePeriodForEveryMonth();  
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
        await backup.removeToast.click();
        await backup.disableAutoBackup();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
    });

    test('Backup temporary storage', async ({ page }) => {
        await backup.navigateToSettings();
        await backup.navigateTobackup.click();
        await backup.createBackupButton.click();
        await expect(page.locator('text=The backup copy has been successfully created.')).toBeVisible({ timeout: 30000 });
    });

    test('Backup room storage', async ({ page }) => {
        await backup.navigateToSettings();
        await backup.navigateTobackup.click();
        await backup.createBackupInRoom();
        await expect(page.locator('text=The backup copy has been successfully created.')).toBeVisible({ timeout: 30000 });
    });

    test('Backup in Third-Party storage S3', async ({ page }) => {
        await backup.navigateToSettings();
        await backup.activateAWSS3();
        await backup.s3Backup();
        await expect(page.locator('text=The backup copy has been successfully created.')).toBeVisible({ timeout: 30000 });
    });

    test.skip('Auto backup in Third-Party storage S3 - временно отключено из-за отсутствия платности', async ({ page }) => {
        await backup.navigateToSettings();
        await backup.navigateToAutoBackup();
        await backup.s3AutoBackup();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
        await backup.removeToast.click();
        await backup.disableAutoBackup();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
    });

    test('Backup in Third-Party resource NextCloud', async ({ page }) => {
        await backup.navigateToSettings();
        await backup.navigateTobackup.click();
        await backup.nextcloudBackup();
        await expect(page.locator('text=The backup copy has been successfully created.')).toBeVisible({ timeout: 30000 });
        await backup.disconnectNextcloud();
    });

    test.skip('Auto backup in Third-Party resource NextCloud - временно отключено из-за отсутствия платности', async ({ page }) => {
        await backup.navigateToSettings();
        await backup.navigateToAutoBackup();
        await backup.nextcloudAutoBackup();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
        await backup.removeToast.click();
        await backup.disableAutoBackup();
        await expect(page.locator('text=Settings have been successfully updated')).toHaveText('Settings have been successfully updated', { timeout: 10000 });
    });
});
import { test, expect } from "@playwright/test";
import { Backup } from "../../../page_objects/settings/backup";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";
import { PaymentApi } from "../../../api_library/paymentApi/paymentApi";

test.describe("Backup portal tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let backup;
  let paymentApi;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    paymentApi = new PaymentApi(apiContext, portalSetup);
    await portalSetup.setupPortal();
    await portalSetup.authenticate();
    const portalInfo = await paymentApi.getPortalInfo(portalSetup.portalDomain);
    await paymentApi.makePortalPayment(portalInfo.tenantId, 10);
    await paymentApi.refreshPaymentInfo(portalSetup.portalDomain);
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

  test("Backup link", async ({ page }) => {
    test.setTimeout(60000);
    await backup.navigateToSettings();
    await backup.navigateToBackup.click();
    await page.waitForTimeout(1000);
    const page1 = await backup.backupGuidePopup();
    await page1.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-settings.aspx#CreatingBackup_block",
    );
    await expect(page1).toHaveURL(
      /administration\/docspace-settings.aspx#CreatingBackup_block/,
    );
  });

  test("Auto backup link", async ({ page }) => {
    test.setTimeout(60000);
    await backup.navigateToSettings();
    await backup.navigateToAutoBackup();
    await page.waitForTimeout(1000);
    const page1 = await backup.backupGuidePopup();
    await page1.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-settings.aspx#AutoBackup",
    );
    await expect(page1).toHaveURL(
      /administration\/docspace-settings.aspx#AutoBackup/,
    );
  });

  test("Every day auto backup", async ({ page }) => {
    await backup.navigateToSettings();
    await backup.navigateToAutoBackup();
    await backup.backupRoom();
    await backup.autoSavePeriodForEveryDay();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await backup.removeToast.click();
    await backup.disableAutoBackup();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Every week auto backup", async ({ page }) => {
    await backup.navigateToSettings();
    await backup.navigateToAutoBackup();
    await backup.backupRoom();
    await backup.autoSavePeriodForEveryWeek();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await backup.removeToast.click();
    await backup.disableAutoBackup();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Every month auto backup", async ({ page }) => {
    await backup.navigateToSettings();
    await backup.navigateToAutoBackup();
    await backup.backupRoom();
    await backup.autoSavePeriodForEveryMonth();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await backup.removeToast.click();
    await backup.disableAutoBackup();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Backup temporary storage", async ({ page }) => {
    await backup.navigateToSettings();
    await backup.navigateToBackup.click();
    await backup.createBackupButton.click();
    await expect(
      page.locator("text=The backup copy has been successfully created."),
    ).toBeVisible({ timeout: 30000 });
  });

  test("Backup room storage", async ({ page }) => {
    test.setTimeout(60000);
    await backup.navigateToSettings();
    await backup.navigateToBackup.click();
    await backup.createBackupInRoom();
    await expect(
      page.locator("text=The backup copy has been successfully created."),
    ).toBeVisible({ timeout: 30000 });
  });

  test("Backup in Third-Party storage S3", async ({ page }) => {
    await backup.navigateToSettings();
    await backup.activateAWSS3();
    await backup.s3Backup();
    await expect(
      page.locator("text=The backup copy has been successfully created."),
    ).toBeVisible({ timeout: 30000 });
  });

  test("Auto backup in Third-Party storage S3", async ({ page }) => {
    await backup.navigateToSettings();
    await backup.navigateToAutoBackup();
    await backup.s3AutoBackup();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await backup.removeToast.click();
    await backup.disableAutoBackup();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Backup in Third-Party resource NextCloud", async ({ page }) => {
    await backup.navigateToSettings();
    await backup.navigateToBackup.click();
    await backup.nextcloudBackup();
    await expect(
      page.locator("text=The backup copy has been successfully created."),
    ).toBeVisible({ timeout: 30000 });
    await backup.disconnectService();
  });

  test("Auto backup in Third-Party resource NextCloud", async ({ page }) => {
    await backup.navigateToSettings();
    await backup.navigateToAutoBackup();
    await backup.nextcloudAutoBackup();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await backup.removeToast.click();
    await backup.disableAutoBackup();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Backup in Third-Party resource dropbox", async ({ page }) => {
    test.setTimeout(120000);
    await backup.navigateToSettings();
    await backup.navigateToBackup.click();
    await backup.Dropbox();
    await backup.connectDropbox();
    await backup.createBackupInService();
    await expect(
      page.locator("text=The backup copy has been successfully created."),
    ).toBeVisible({ timeout: 30000 });
    await backup.disconnectService();
  });

  test("Auto backup in Third-Party resource dropbox", async ({ page }) => {
    test.setTimeout(120000);
    await backup.navigateToSettings();
    await backup.navigateToAutoBackup();
    await backup.selectDropboxAutoBackup();
    await backup.connectDropbox();
    await backup.selectRoomForBackup();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await backup.removeToast.click();
    await backup.disconnectService();
    await backup.disableAutoBackup();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Backup in Third-Party resource box", async ({ page }) => {
    test.setTimeout(60000);
    await backup.navigateToSettings();
    await backup.navigateToBackup.click();
    await backup.selectThirdPartyResource.click();
    await backup.connectBox();
    await backup.createBackupInService();
    await expect(
      page.locator("text=The backup copy has been successfully created."),
    ).toBeVisible({ timeout: 60000 });
    await backup.disconnectService();
  });

  test("Auto backup in Third-Party resource box", async ({ page }) => {
    await backup.navigateToSettings();
    await backup.navigateToAutoBackup();
    await backup.selectBoxAutoBackup();
    await backup.connectBox();
    await backup.selectRoomForBackup();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 30000 });
    await backup.removeToast.click();
    await backup.disconnectService();
    await backup.disableAutoBackup();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 30000 });
  });
});

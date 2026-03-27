import { Backup } from "@/src/objects/settings/backup/Backup";
import { PaymentApi } from "@/src/api/payment";
import {
  mapAutoBackupMethodsIds,
  mapBackupMethodsIds,
  mapThirdPartyResource,
  navItems,
  toastMessages,
} from "@/src/utils/constants/settings";
import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";

test.describe("Manual backup", () => {
  let backup: Backup;

  test.beforeEach(async ({ page, api, login, services }) => {
    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();

    backup = new Backup(page);
    await login.loginToPortal();
    await services.activateBackupService();
    await backup.open();
  });

  test("Backup temporary storage", async () => {
    await test.step("Backup guide link", async () => {
      await backup.openBackupGuide();
    });

    await test.step("Create backup", async () => {
      await backup.locators.createBackupButton.click();
      await backup.dismissToastSafely(toastMessages.backCopyCreated);
    });
  });

  test("Backup room storage", async () => {
    await backup.selectBackupMethod(mapBackupMethodsIds.backupRoom);
    await backup.openRoomSelector();
    await backup.selectDocuments();
    await backup.locators.createCopyButton.click();
    await backup.dismissToastSafely(toastMessages.backCopyCreated, 40000);
  });

  test("Backup in Third-Party resource box", async () => {
    await backup.selectBackupMethod(mapBackupMethodsIds.thirdPartyResource);
    await backup.openThirdPartyDropdown();
    await backup.selectThirdPartyResource(mapThirdPartyResource.box);
    await backup.connectBox();
    await backup.createBackupInService();
    await backup.openActionMenuResource();
    await backup.disconnectService();
  });

  test("Backup in Third-Party storage S3", async () => {
    await backup.activateAWSS3();
    await backup.navigateToArticle(navItems.backup);
    await backup.selectBackupMethod(mapBackupMethodsIds.thirdPartyStorage);
    await backup.locators.bucketInput.fill("portals-manual");
    await backup.selectRegion("US East (N. Virginia) (us-east-1)");
    await backup.locators.createAmazonCopyButton.click();
    await backup.dismissToastSafely(toastMessages.backCopyCreated, 80000);
  });
});

// Skipped: bug 80298
test.describe("Auto backup", () => {
  let backup: Backup;

  test.beforeEach(async ({ page, api, login, services }) => {
    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();

    backup = new Backup(page);
    await login.loginToPortal();
    await services.activateBackupService();
    await backup.open();
  });

  test.skip("Auto backup schedule", async ({ page }) => {
    await backup.openTab("auto-backup_tab");

    await test.step("Auto backup guide link", async () => {
      await backup.openAutoBackupGuide();
    });

    await test.step("Every day auto backup", async () => {
      await backup.enableAutoBackup();

      await backup.openRoomSelector();
      await backup.selectDocuments();

      await backup.openTimeSelector();
      await backup.selectTime();

      await backup.openNumberCopySelector();
      await backup.selectNumberCopy();

      await backup.openScheduleSelector();
      await page.mouse.click(1, 1);

      await backup.saveAutoSavePeriod();
      await backup.disableAutoBackup();
    });

    await test.step("Every week auto backup", async () => {
      await backup.backupRoom();

      await backup.openScheduleSelector();
      await backup.locators.selectEveryWeek.click();

      await backup.openDaySelector();
      await backup.selectDay();

      await backup.setBackupTimeAndCopies();
      await backup.saveAutoSavePeriod();

      await backup.disableAutoBackup();
    });

    await test.step("Every month auto backup", async () => {
      await backup.backupRoom();

      await backup.openScheduleSelector();
      await backup.locators.selectEveryMonth.click();

      await backup.openMonthSelector();
      await backup.selectMonth();

      await backup.setBackupTimeAndCopies();
      await backup.saveAutoSavePeriod();
      await backup.disableAutoBackup();
    });
  });

  test.skip("Auto backup in Third-Party resource box", async () => {
    await backup.openTab("auto-backup_tab");
    await backup.enableAutoBackup();
    await backup.selectAutoBackupMethod(
      mapAutoBackupMethodsIds.thirdPartyResource,
    );
    await backup.openThirdPartyServiceAutoBackup();
    await backup.selectAutoThirdPartyResource(mapThirdPartyResource.box);
    await backup.connectBoxAutoBackup();
    await backup.selectRoomForBackup();
    await backup.openActionMenuResourceAutoBackup();
    await backup.disconnectService();
    await backup.disableAutoBackup();
  });

  test.skip("Auto backup in Third-Party storage S3", async ({ page }) => {
    await backup.activateAWSS3();
    await backup.navigateToArticle(navItems.backup);
    await backup.openTab("auto-backup_tab");
    await backup.enableAutoBackup();
    await backup.selectAutoBackupMethod(
      mapAutoBackupMethodsIds.thirdPartyStorage,
    );
    await backup.locators.bucketInput.fill("portals-manual");
    await backup.openRegionDropdown();
    await backup.regionDropdown.clickOption(
      "US East (N. Virginia) (us-east-1)",
    );
    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.request().method() === "POST" &&
          resp.url().includes("/api/2.0/portal/createbackupschedule"),
      ),
      backup.locators.saveAutoBackupButton.click(),
    ]);
    expect(response.status()).toBe(200);
    await backup.removeAllToast();
  });
});

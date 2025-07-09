import { test, Page } from "@playwright/test";
import { Backup } from "@/src/objects/settings/backup/Backup";
import API from "@/src/api";
import Login from "@/src/objects/common/Login";
import { PaymentApi } from "@/src/api/payment";
import Screenshot from "@/src/objects/common/Screenshot";

import {
  mapBackupMethodsIds,
  mapThirdPartyResource,
  navItems,
} from "@/src/utils/constants/settings";

test.describe("Backup portal tests", () => {
  let api: API;
  let paymentApi: PaymentApi;
  let page: Page;
  let backup: Backup;

  let login: Login;
  let screenshot: Screenshot;

  test.beforeAll(async ({ playwright, browser }) => {
    const apiContext = await playwright.request.newContext();
    api = new API(apiContext);
    paymentApi = new PaymentApi(apiContext, api.apisystem);
    await api.setup();
    page = await browser.newPage();
    console.log(api.portalDomain);

    const portalInfo = await paymentApi.getPortalInfo(api.portalDomain);
    await paymentApi.makePortalPayment(portalInfo.tenantId, 10);
    await paymentApi.refreshPaymentInfo(api.portalDomain);

    await page.addInitScript(() => {
      globalThis.localStorage?.setItem("integrationUITests", "true");
    });

    login = new Login(page, api.portalDomain);
    screenshot = new Screenshot(page, {
      screenshotDir: "backup",
    });

    backup = new Backup(page);
    await login.loginToPortal();
    await backup.open();
  });

  test("Backup flows", async () => {
    test.setTimeout(180000);

    await test.step("Render", async () => {
      await screenshot.expectHaveScreenshot("render_data_backup");
    });

    await test.step("Backup link", async () => {
      await backup.openBackupGuide("CreatingBackup_block");
    });

    await test.step("Backup temporary storage", async () => {
      await backup.locators.createBackupButton.click();
      // await backup.removeToast("The backup copy has been successfully created."); // note: toast is not visible
      await page.waitForTimeout(2000); // plug
      // // Wait for email to arrive
      // await new Promise((resolve) => setTimeout(resolve, 15000));

      // // Create a MailChecker instance
      // if (
      //   !config.QA_MAIL_DOMAIN ||
      //   !config.QA_MAIL_LOGIN ||
      //   !config.QA_MAIL_PASSWORD
      // ) {
      //   throw new Error("Mail configuration is missing");
      // }

      // const mailChecker = new MailChecker({
      //   url: config.QA_MAIL_DOMAIN,
      //   user: config.QA_MAIL_LOGIN,
      //   pass: config.QA_MAIL_PASSWORD,
      // });

      // // Check for email with subject containing "portal backup created"
      // const email = await mailChecker.checkEmailBySubject({
      //   subject: "portal backup created",
      //   moveOut: false,
      // });

      // // Log the found email
      // if (email) {
      //   console.log(`Found backup email with subject: "${email.subject}"`);
      // }

      // // Final verification
      // expect(email).toBeTruthy();
    });

    await test.step("Backup room storage", async () => {
      await backup.selectBackupMethod(mapBackupMethodsIds.backupRoom);
      await screenshot.expectHaveScreenshot("backup_room");
      await backup.openRoomSelector();
      // await screenshot.expectHaveScreenshot("backup_room_selector");
      await backup.locators.forwardDocSpace.click();
      await backup.locators.forwardDocuments.click();
      await backup.locators.selectButton.click();
      await screenshot.expectHaveScreenshot("backup_room_storage_selected");
      await backup.locators.createCopyButton.click();
      await page.waitForTimeout(2000); // plug
      // await backup.removeToast(
      //   "The backup copy has been successfully created.",
      // ); // note: toast is not visible
    });

    // // ISSUE: CAPTCHA OR INFINITE LOADING
    // await test.step("Backup in Third-Party resource dropbox", async () => {
    //   await backup.selectBackupMethod(mapBackupMethodsIds.thirdPartyResource);
    //   await page.waitForTimeout(500);
    //   await backup.openThirdPartyDropdown();
    //   await backup.selectThirdPartyResource(mapThirdPartyResource.dropbox);
    //   await backup.connectDropbox();
    //   await screenshot.expectHaveScreenshot("dropbox");
    //   await backup.createBackupInService();
    //   // await backup.removeSettingsUpdatedToast();
    // });

    await test.step("Backup in Third-Party resource NextCloud", async () => {
      await backup.selectBackupMethod(mapBackupMethodsIds.thirdPartyResource);
      await screenshot.expectHaveScreenshot("backup_third_party_resource");
      await backup.openThirdPartyDropdown();
      await screenshot.expectHaveScreenshot(
        "backup_third_party_resource_dropdown",
      );
      await backup.selectThirdPartyResource(mapThirdPartyResource.nextcloud);
      await backup.locators.connectButton.click();

      await backup.fillConnectingNextcloudAccount();
      await screenshot.expectHaveScreenshot(
        "backup_third_party_resource_connect_nextcloud",
      );
      await backup.locators.saveButton.click();
      await backup.openRoomSelector();
      // issue: sometimes blurred text in selector
      // await screenshot.expectHaveScreenshot(
      //   "backup_third_party_resource_select",
      // );
      await backup.locators.selectNextCloudRepo.click();
      await backup.locators.selectButton.click();
      await backup.locators.createCopyButton.click();
      await page.waitForTimeout(2000); // plug
      // await backup.removeSettingsUpdatedToast(); // note: toast is not visible
    });

    await test.step("Backup in Third-Party resource box", async () => {
      await backup.openThirdPartyDropdown();
      await backup.selectThirdPartyResource(mapThirdPartyResource.box);
      await backup.connectBox();
      await backup.createBackupInService();
      await page.waitForTimeout(10000); // plug
      // await backup.removeToast();
      await backup.openActionMenuResource();
      await screenshot.expectHaveScreenshot(
        "backup_third_party_resource_action_menu",
      );
      await backup.openDisconnectServiceDialog();
      await backup.confirmDisconnectService();
    });

    await test.step("Backup in Third-Party storage S3", async () => {
      await backup.activateAWSS3();

      await backup.navigateToArticle(navItems.backup);
      await backup.selectBackupMethod(mapBackupMethodsIds.thirdPartyStorage);
      await screenshot.expectHaveScreenshot("backup_third_party_storage");
      await backup.locators.bucketInput.fill("portals-manual");
      await backup.openRegionDropdown();
      await screenshot.expectHaveScreenshot(
        "backup_third_party_storage_region_dropdown",
      );
      await backup.regionDropdown.clickOption(
        "US East (N. Virginia) (us-east-1)",
      );
      await backup.locators.createCopyButton.click();
      await page.waitForTimeout(5000); // plug
      // await backup.removeSettingsUpdatedToast();
    });

    await test.step("Auto backup link", async () => {
      await backup.openTab("Automatic backup");
      await screenshot.expectHaveScreenshot("auto_backup");
      await backup.openBackupGuide("AutoBackup");
    });

    await test.step("Every day auto backup", async () => {
      await backup.enableAutoBackup();
      await screenshot.expectHaveScreenshot("auto_backup_enabled");

      await backup.openRoomSelector();
      // issue: sometimes blurred text in selector
      // await screenshot.expectHaveScreenshot("auto_backup_room_selector");
      await backup.selectDocuments();

      await backup.openTimeSelector();
      await screenshot.expectHaveScreenshot("auto_backup_time_selector");
      await backup.selectTime();

      await backup.openNumberCopySelector();
      await screenshot.expectHaveScreenshot("auto_backup_number_copy_selector");
      await backup.selectNumberCopy();

      await backup.openScheduleSelector();
      await screenshot.expectHaveScreenshot("auto_backup_schedule_selector");
      await page.mouse.click(1, 1);

      await backup.saveAutoSavePeriod();
      await backup.disableAutoBackup();
    });

    await test.step("Every week auto backup", async () => {
      await backup.backupRoom();

      await backup.openScheduleSelector();
      await backup.locators.selectEveryWeek.click();

      await backup.openDaySelector();
      await screenshot.expectHaveScreenshot("auto_backup_every_week_selector");
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
      await screenshot.expectHaveScreenshot("auto_backup_every_month_selector");
      await backup.selectMonth();

      await backup.setBackupTimeAndCopies();
      await backup.saveAutoSavePeriod();
    });

    await test.step("Auto backup in Third-Party resource NextCloud", async () => {
      await backup.selectBackupMethod(mapBackupMethodsIds.thirdPartyResource);
      await screenshot.expectHaveScreenshot("auto_backup_third_party_resource");

      await backup.openThirdPartyDropdown();
      await screenshot.expectHaveScreenshot(
        "auto_backup_third_party_resource_dropdown",
      );
      await backup.selectThirdPartyResource(mapThirdPartyResource.nextcloud);
      await backup.locators.connectButton.click();

      await backup.fillConnectingNextcloudAccount();
      await screenshot.expectHaveScreenshot(
        "auto_backup_third_party_resource_connect_nextcloud",
      );

      await backup.locators.saveButton.click();
      await backup.openRoomSelector();
      // issue: sometimes blurred text in selector
      // await screenshot.expectHaveScreenshot(
      //   "auto_backup_third_party_resource_select",
      // );

      await backup.locators.selectNextCloudRepo.click();
      await backup.locators.saveHereButton.click();
      await backup.locators.saveButtonAutoBackup.click();
      await backup.removeSettingsUpdatedToast();
    });

    await test.step("Auto backup in Third-Party resource box", async () => {
      await backup.openActionMenuResource();
      await screenshot.expectHaveScreenshot(
        "auto_backup_third_party_resource_action_menu",
      );
      await backup.openDisconnectServiceDialog();
      await backup.confirmDisconnectService();

      await screenshot.expectHaveScreenshot(
        "auto_backup_third_party_resource_dropdown",
      );
      await backup.connectBox();
      await backup.selectRoomForBackup();
    });

    // await test.step("Auto backup in Third-Party resource dropbox", async () => {
    //   await backup.openTab("Automatic backup");
    //   await backup.selectDropboxAutoBackup();
    //   await backup.connectDropbox();
    //   await backup.selectRoomForBackup();
    //   await backup.removeToast("Settings have been successfully updated");
    //   await backup.disconnectService();
    //   await backup.disableAutoBackup();
    //   await backup.removeToast("Settings have been successfully updated");
    // });

    await test.step("Auto backup in Third-Party storage S3", async () => {
      await backup.enableAutoBackup();
      await backup.selectBackupMethod(mapBackupMethodsIds.thirdPartyStorage);
      await screenshot.expectHaveScreenshot("auto_backup_third_party_storage");
      await backup.locators.bucketInput.fill("portals-manual");
      await backup.openRegionDropdown();
      await screenshot.expectHaveScreenshot(
        "auto_backup_third_party_storage_region_dropdown",
      );
      await backup.regionDropdown.clickOption(
        "US East (N. Virginia) (us-east-1)",
      );
      await backup.locators.saveButton2.click();
      await backup.removeAllToast();
    });
  });

  test.afterAll(async () => {
    await api.cleanup();
    await page.close();
  });
});

import Customization from "@/src/objects/settings/customization/Customization";
import { PaymentApi } from "@/src/api/payment";

import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import { toastMessages } from "@/src/utils/constants/settings";
// import MailChecker from "@/src/utils/helpers/MailChecker";
// import config from "@/config";

test.describe("Customization", () => {
  let paymentApi: PaymentApi;
  let customization: Customization;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);

    await paymentApi.setupPayment();
    customization = new Customization(page);

    await login.loginToPortal();
    await customization.open();
  });

  test.only("Customization full flow", async ({ api, page }) => {
    await test.step("Change lang&time", async () => {
      await customization.changeLanguage("English (United States)");
      await customization.changeTimezone("(UTC+05:00) Maldives Time");
      await customization.settingsTitle.click();
      await customization.languageTimeZoneSaveButton.click();
      await customization.removeToast(toastMessages.settingsUpdated);
      await customization.changeLanguage("English (United Kingdom)");
      await customization.changeTimezone("(UTC+00:00) United Kingdom Time");
      await customization.settingsTitle.click();
      await customization.languageTimeZoneSaveButton.click();
      await customization.removeToast(toastMessages.settingsUpdated);
    });

    await test.step("Welcome page settings", async () => {
      await customization.setTitle();
      await customization.customizationWelcomeSaveButton.click();
      await customization.removeToast(toastMessages.welcomePageSaved);
      await customization.customizationWelcomeCancelButton.click();
      await customization.removeToast(toastMessages.welcomePageSaved);
    });

    await test.step("Brand name", async () => {
      await customization.openTab("Branding");
      await customization.brandName();
      await customization.removeToast(toastMessages.settingsUpdated);
    });

    await test.step("Generate logo from text", async () => {
      await customization.generateLogo();
      await customization.removeToast(toastMessages.settingsUpdated);
      await customization.logoRestoreButton.click();
      await customization.removeToast(toastMessages.settingsUpdated);
    });

    await test.step("Branding upload pictures", async () => {
      await customization.uploadPictures();
      await customization.removeToast(toastMessages.settingsUpdated);
      await customization.logoRestoreButton.click();
      await customization.removeToast(toastMessages.settingsUpdated);
    });

    await test.step("Appearance", async () => {
      await customization.openTab("Appearance");
      await customization.selectTheme();
      await customization.darkThemeOption.click();
      await customization.saveButtonAppearance.first().click();
      await customization.removeToast(toastMessages.settingsUpdated);
      await customization.selectTheme2();
      await customization.saveButtonAppearance.click();
      await customization.removeToast(toastMessages.settingsUpdated);
    });

    await test.step("Custom appereance", async () => {
      await customization.createCustomTheme("##0EEDE9", "#931073");
      await customization.removeToast(toastMessages.settingsUpdated);
      await customization.darkThemeOption.click();
      await customization.saveButtonAppearance.click();
      await customization.removeToast(toastMessages.settingsUpdated);
      await customization.deleteCustomTheme();
      await customization.removeToast(toastMessages.settingsUpdated);
      await customization.checkCustomThemeNotExist();
    });

    await test.step("General link", async () => {
      await customization.openTab("General");

      // 1. Language & Time Zone guide
      const page1Promise = page.waitForEvent("popup");
      await customization.docspaceLanguageGuideLink.click();
      const page1 = await page1Promise;
      await page1.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration/docspace-customization-settings.aspx#languageandtimezonesettings_block",
      );
      await expect(page1).toHaveURL(
        /docspace-customization-settings\.aspx#languageandtimezonesettings_block/,
      );
      await page1.close();

      // 2. Welcome Page Settings guide
      const page2Promise = page.waitForEvent("popup");
      await customization.docspaceTitleGuideLink.click();
      const page2 = await page2Promise;
      await page2.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration/docspace-customization-settings.aspx#welcomepagesettings_block",
      );
      await expect(page2).toHaveURL(
        /docspace-customization-settings\.aspx#welcomepagesettings_block/,
      );
      await page2.close();

      // 3. DNS Settings guide
      const page3Promise = page.waitForEvent("popup");
      await customization.docspaceAlternativeUrlGuideLink.click();
      const page3 = await page3Promise;
      await page3.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration/docspace-customization-settings.aspx#dnssettings_block",
      );
      await expect(page3).toHaveURL(
        /docspace-customization-settings\.aspx#dnssettings_block/,
      );
      await page3.close();

      // 4. DocSpace Renaming guide
      const page4Promise = page.waitForEvent("popup");
      await customization.docspaceRenamingGuideLink.click();
      const page4 = await page4Promise;
      await page4.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration/docspace-customization-settings.aspx#docspacerenaming_block",
      );
      await expect(page4).toHaveURL(
        /docspace-customization-settings\.aspx#docspacerenaming_block/,
      );
      await page4.close();
    });

    await test.step("Rename portal", async () => {
      const { originalName, newName } = await customization.renamePortal();

      // This is to remove the portal if the test falls
      api.apisystem.setPortalDomain(`${newName}.onlyoffice.io`);
      api.apisystem.setPortalName(newName);
      await page.waitForURL(
        `https://${newName}.onlyoffice.io/rooms/shared/**`,
        {
          timeout: 30000,
        },
      );
      await page.waitForLoadState("domcontentloaded");

      // console.log("Portal renamed successfully, wait for email");

      // // Wait for email to arrive
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      // // Create a MailChecker instance
      // const mailChecker = new MailChecker({
      //   url: config.QA_MAIL_DOMAIN ?? "",
      //   user: config.QA_MAIL_LOGIN ?? "",
      //   pass: config.QA_MAIL_PASSWORD ?? "",
      // });

      // // Check for email with subject "Change of portal address"
      // const email = await mailChecker.checkEmailBySubject({
      //   subject: "Change of portal address",
      //   timeoutSeconds: 30,
      //   moveOut: false,
      //   timeoutSeconds: 60,
      // });

      // if (email) {
      //   console.log(
      //     `Found portal address change email with subject: "${email.subject}"`,
      //   );
      // }

      // // Final verification
      // expect(email).toBeTruthy();
      // // Final verification
      // expect(email).toBeTruthy();

      await customization.renamePortalBack(originalName);
      api.apisystem.setPortalDomain(`${originalName}.onlyoffice.io`);
      api.apisystem.setPortalName(originalName);
      await page.waitForURL(`https://${originalName}.onlyoffice.io/**`, {
        timeout: 30000,
        waitUntil: "load",
      });
    });

    await test.step("Configure deep link", async () => {
      await customization.open();
      await customization.choseDeepLink();
      await customization.removeToast(toastMessages.settingsUpdated);
      await customization.webOnly.click({ force: true });
      await customization.configureDeepLinkSaveButton.click();
      await customization.removeToast(toastMessages.settingsUpdated);
      await customization.webOrApp.click({ force: true });
      await customization.configureDeepLinkSaveButton.click();
      await customization.removeToast(toastMessages.settingsUpdated);
    });

    await test.step("Brand name email verification", async () => {
      // const profile = new Profile(page);

      // Set brand name to "autoTest"
      await customization.openTab("Branding");
      await customization.textInputBrandName.first().fill("autoTest");
      await customization.brandNameSaveButton.click();
      await customization.removeToast(toastMessages.settingsUpdated);

      // Request password change
      // await profile.navigateToProfile();
      // await profile.changePassword();

      // // Wait for email to arrive
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      // // Create a MailChecker instance
      // const mailChecker = new MailChecker({
      //   url: config.QA_MAIL_DOMAIN ?? "",
      //   user: config.QA_MAIL_LOGIN ?? "",
      //   pass: config.QA_MAIL_PASSWORD ?? "",
      // });

      // // Check for email with subject "Confirm changing your password" and sender "autoTest"
      // const email = await mailChecker.checkEmailBySenderAndSubject({
      //   subject: "Confirm changing your password",
      //   sender: "autoTest",
      //   moveOut: false,
      // });

      // // Final verification
      // expect(email).toBeTruthy();
      // // Final verification
      // expect(email).toBeTruthy();
    });
  });
});

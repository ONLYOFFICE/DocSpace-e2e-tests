import Customization from "@/src/objects/settings/customization/Customization";
import { PaymentApi } from "@/src/api/payment";

import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import { toastMessages } from "@/src/utils/constants/settings";
import MailChecker from "@/src/utils/helpers/MailChecker";
import config from "@/config";
import { Profile } from "@/src/objects/profile/Profile";

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

  // TODO: Save button stays disabled when only language is changed — investigate why changing language alone doesn't dirty the form
  test.skip("Change and save language", async () => {
    await customization.changeLanguage("English (United Kingdom)");
    await customization.settingsTitle.click();
    await expect(customization.languageTimeZoneSaveButton).toBeEnabled();
    await customization.languageTimeZoneSaveButton.click();
    await customization.removeToast(toastMessages.settingsUpdated);
    await customization.changeLanguage("English (United States)");
    await customization.settingsTitle.click();
    await expect(customization.languageTimeZoneSaveButton).toBeEnabled();
    await customization.languageTimeZoneSaveButton.click();
    await customization.removeToast(toastMessages.settingsUpdated);
  });

  test("Change and save timezone", async () => {
    await customization.changeTimezone("(UTC+05:00) Maldives Time");
    await customization.settingsTitle.click();
    await expect(customization.languageTimeZoneSaveButton).toBeEnabled();
    await customization.languageTimeZoneSaveButton.click();
    await customization.removeToast(toastMessages.settingsUpdated);
    await customization.changeTimezone("(UTC+00:00) United Kingdom Time");
    await customization.settingsTitle.click();
    await expect(customization.languageTimeZoneSaveButton).toBeEnabled();
    await customization.languageTimeZoneSaveButton.click();
    await customization.removeToast(toastMessages.settingsUpdated);
  });

  test("Welcome page settings", async () => {
    await customization.setTitle();
    await customization.customizationWelcomeSaveButton.click();
    await customization.removeToast(toastMessages.welcomePageSaved);
    await customization.customizationWelcomeCancelButton.click();
    await customization.removeToast(toastMessages.welcomePageSaved);
  });

  test("Branding: change brand name", async () => {
    await customization.openTab("Branding");
    await customization.brandName();
    await customization.removeToast(toastMessages.settingsUpdated);
    await customization.checkBrandNameValue("AutoTesting");
  });

  test("Branding: generate logo from text and restore to default", async () => {
    await customization.openTab("Branding");
    await customization.generateLogo();
    await customization.removeToast(toastMessages.settingsUpdated);
    await customization.logoRestoreButton.click();
    await customization.removeToast(toastMessages.settingsUpdated);
    await customization.checkLogoTextEmpty();
  });

  test("Branding: upload logo pictures and restore to default", async () => {
    await customization.openTab("Branding");
    await customization.uploadPictures();
    await customization.removeToast(toastMessages.settingsUpdated);
    await customization.logoRestoreButton.click();
    await customization.removeToast(toastMessages.settingsUpdated);
  });

  test("Appearance: switch between themes", async () => {
    await customization.openTab("Appearance");
    await customization.selectTheme();
    await customization.darkThemeOption.click();
    await customization.saveButtonAppearance.first().click();
    await customization.removeToast(toastMessages.settingsUpdated);
    await customization.selectTheme2();
    await customization.saveButtonAppearance.click();
    await customization.removeToast(toastMessages.settingsUpdated);
  });

  test("Appearance: create and delete custom theme", async () => {
    await customization.openTab("Appearance");
    await customization.createCustomTheme("##0EEDE9", "#931073");
    await customization.removeToast(toastMessages.settingsUpdated);
    await customization.darkThemeOption.click();
    await customization.saveButtonAppearance.click();
    await customization.removeToast(toastMessages.settingsUpdated);
    await customization.deleteCustomTheme();
    await customization.removeToast(toastMessages.settingsUpdated);
    await customization.checkCustomThemeNotExist();
  });

  test("General: documentation links open correct URLs", async ({ page }) => {
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

  test("Rename portal and revert", async ({ api, page }) => {
    const { originalName, newName } = await customization.renamePortal();

    // This is to remove the portal if the test falls
    api.apisystem.setPortalDomain(`${newName}.onlyoffice.io`);
    api.apisystem.setPortalName(newName);
    await page.waitForURL(`https://${newName}.onlyoffice.io/rooms/shared/**`, {
      timeout: 30000,
    });
    await page.waitForLoadState("domcontentloaded");

    await customization.renamePortalBack(originalName);
    api.apisystem.setPortalDomain(`${originalName}.onlyoffice.io`);
    api.apisystem.setPortalName(originalName);
    await page.waitForURL(`https://${originalName}.onlyoffice.io/**`, {
      timeout: 30000,
      waitUntil: "load",
    });
  });

  test("Deep link: switch between opening modes", async () => {
    await customization.choseDeepLink();
    await customization.removeToast(toastMessages.settingsUpdated);
    await customization.checkDeepLinkOption("appOnly");

    await customization.webOnly.click({ force: true });
    await customization.configureDeepLinkSaveButton.click();
    await customization.removeToast(toastMessages.settingsUpdated);
    await customization.checkDeepLinkOption("webOnly");

    await customization.webOrApp.click({ force: true });
    await customization.configureDeepLinkSaveButton.click();
    await customization.removeToast(toastMessages.settingsUpdated);
    await customization.checkDeepLinkOption("webOrApp");
  });

  test.skip("Rename portal email notification", async ({ api, page }) => {
    const mailCheckerConfirm = new MailChecker({
      url: config.QA_MAIL_DOMAIN ?? "",
      user: config.QA_MAIL_LOGIN ?? "",
      pass: config.QA_MAIL_PASSWORD ?? "",
    });
    const confirmLink = await mailCheckerConfirm.extractPortalLink({
      subject: "Welcome to ONLYOFFICE DocSpace!",
      portalName: api.portalDomain,
      timeoutSeconds: 30,
    });
    if (confirmLink) {
      await page.goto(confirmLink);
      await page.waitForLoadState("domcontentloaded");
      await customization.open();
    }

    const { originalName, newName } = await customization.renamePortal();

    api.apisystem.setPortalDomain(`${newName}.onlyoffice.io`);
    api.apisystem.setPortalName(newName);
    await page.waitForURL(`https://${newName}.onlyoffice.io/rooms/shared/**`, {
      timeout: 30000,
    });
    await page.waitForLoadState("domcontentloaded");

    // Wait for email to arrive
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const mailChecker = new MailChecker({
      url: config.QA_MAIL_DOMAIN ?? "",
      user: config.QA_MAIL_LOGIN ?? "",
      pass: config.QA_MAIL_PASSWORD ?? "",
    });

    const email = await mailChecker.checkEmailBySubject({
      subject: "Change of portal address",
      timeoutSeconds: 60,
      moveOut: false,
    });

    expect(email).toBeTruthy();

    await customization.renamePortalBack(originalName);
    api.apisystem.setPortalDomain(`${originalName}.onlyoffice.io`);
    api.apisystem.setPortalName(originalName);
    await page.waitForURL(`https://${originalName}.onlyoffice.io/**`, {
      timeout: 30000,
      waitUntil: "load",
    });
  });

  test.skip("Brand name email notification", async ({ api, page }) => {
    const mailCheckerConfirm = new MailChecker({
      url: config.QA_MAIL_DOMAIN ?? "",
      user: config.QA_MAIL_LOGIN ?? "",
      pass: config.QA_MAIL_PASSWORD ?? "",
    });
    const confirmLink = await mailCheckerConfirm.extractPortalLink({
      subject: "Welcome to ONLYOFFICE DocSpace!",
      portalName: api.portalDomain,
      timeoutSeconds: 30,
    });
    if (confirmLink) {
      await page.goto(confirmLink);
      await page.waitForLoadState("domcontentloaded");
      await customization.open();
    }

    const profile = new Profile(page);

    await customization.openTab("Branding");
    await customization.textInputBrandName.first().fill("autoTest");
    await customization.brandNameSaveButton.click();
    await customization.removeToast(toastMessages.settingsUpdated);

    await profile.navigateToProfile();
    await profile.changePassword();

    // Wait for email to arrive
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const mailChecker = new MailChecker({
      url: config.QA_MAIL_DOMAIN ?? "",
      user: config.QA_MAIL_LOGIN ?? "",
      pass: config.QA_MAIL_PASSWORD ?? "",
    });

    const email = await mailChecker.checkEmailBySenderAndSubject({
      subject: "Confirm changing your password",
      sender: "autoTest",
      moveOut: false,
    });

    expect(email).toBeTruthy();
  });
});

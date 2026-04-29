import Customization from "@/src/objects/settings/customization/Customization";
import { PaymentApi } from "@/src/api/payment";

import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import { toastMessages } from "@/src/utils/constants/settings";

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

  test("Change and save language", async ({ page }) => {
    await customization.changeLanguage("Español (España)");
    await page.mouse.click(1, 1); // close dropdown
    await expect(customization.languageTimeZoneSaveButton).toBeEnabled({
      timeout: 30000,
    });
    await customization.languageTimeZoneSaveButton.click();
    await customization.dismissToastSafely(toastMessages.settingsUpdated);
    await expect(customization.languageTimeZoneSaveButton).toHaveAttribute(
      "aria-label",
      "Guardar",
    );
  });

  test("Change and save timezone", async () => {
    await customization.changeTimezone("(UTC+05:00) Maldives Time");
    await customization.settingsTitle.click();
    await expect(customization.languageTimeZoneSaveButton).toBeEnabled();
    await customization.languageTimeZoneSaveButton.click();
    await customization.dismissToastSafely(toastMessages.settingsUpdated);
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
    const page1Promise = page.waitForEvent("popup", { timeout: 30000 });
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
    const page2Promise = page.waitForEvent("popup", { timeout: 30000 });
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
    const page3Promise = page.waitForEvent("popup", { timeout: 30000 });
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
    const page4Promise = page.waitForEvent("popup", { timeout: 30000 });
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
});

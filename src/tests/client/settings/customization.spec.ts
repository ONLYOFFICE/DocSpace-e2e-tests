import { test, Page, expect } from "@playwright/test";

import API from "@/src/api";
import Login from "@/src/objects/common/Login";

import Screenshot from "@/src/objects/common/Screenshot";
import Customization from "@/src/objects/settings/customization/Customization";
import { PaymentApi } from "@/src/api/payment";

import config from "@/config";
import MailChecker from "@/src/utils/helpers/MailChecker";
import { Profile } from "@/src/objects/profile/Profile";

test.describe("Customization", () => {
  let api: API;
  let paymentApi: PaymentApi;
  let page: Page;

  let login: Login;
  let screenshot: Screenshot;
  let customization: Customization;

  test.beforeAll(async ({ playwright, browser }) => {
    const apiContext = await playwright.request.newContext();
    api = new API(apiContext);
    paymentApi = new PaymentApi(apiContext, api.apisystem);
    await api.setup();
    console.log(api.portalDomain);

    const portalInfo = await paymentApi.getPortalInfo(api.portalDomain);
    await paymentApi.makePortalPayment(portalInfo.tenantId, 10);
    await paymentApi.refreshPaymentInfo(api.portalDomain);

    page = await browser.newPage();

    await page.addInitScript(() => {
      globalThis.localStorage?.setItem("integrationUITests", "true");
    });

    login = new Login(page, api.portalDomain);
    screenshot = new Screenshot(page, {
      screenshotDir: "customization",
      fullPage: true,
    });
    customization = new Customization(page);

    await login.loginToPortal();
    await customization.open();
  });

  test("Customization full flow", async () => {
    await test.step("Change lang&time", async () => {
      await customization.changeLanguage("English (United States)");
      await customization.changeTimezone("(UTC) Antarctica/Troll");
      await customization.settingsTitle.click();
      await customization.saveButton.first().click();
      await customization.removeToast();
      await customization.changeLanguage("English (United Kingdom)");
      await customization.changeTimezone("(UTC) Europe/London");
      await customization.settingsTitle.click();
      await customization.saveButton.first().click();
      await customization.removeToast();
    });

    await test.step("Welcom page settings", async () => {
      await customization.setTitle();
      await customization.removeToast();
      await customization.restoreButton.nth(1).click();
      await customization.removeToast();
    });

    await test.step("Brand name", async () => {
      await customization.openTab("Branding");
      await customization.brandName();
      await customization.removeToast();
      await screenshot.expectHaveScreenshot("brand_name");
    });

    await test.step("Generate logo from text", async () => {
      await customization.generateLogo();
      await customization.removeToast();
      await screenshot.expectHaveScreenshot("generated_logo_from_text");
      await customization.restoreButton.nth(1).click();
      await customization.removeToast();
    });

    await test.step("Branding upload pictures", async () => {
      await customization.uploadPictures();
      await customization.removeToast();
      await screenshot.expectHaveScreenshot("branding_upload_pictures");
      await customization.restoreButton.nth(1).click();
      await customization.removeToast();
    });

    await test.step("Appearance", async () => {
      await customization.openTab("Appearance");
      await screenshot.expectHaveScreenshot("appearance_light_theme");
      await customization.selectTheme();
      await customization.darkThemeOption.click();
      await customization.saveButtonAppearance.first().click();
      await customization.removeToast();
      await screenshot.expectHaveScreenshot("appearance_dark_theme_1");
      await customization.selectTheme2();
      await customization.saveButtonAppearance.first().click();
      await customization.removeToast();
      await screenshot.expectHaveScreenshot("appearance_dark_theme_2");
    });

    await test.step("Custom appereance", async () => {
      await customization.createCustomTheme("##0EEDE9", "#931073");
      await customization.removeToast();
      await screenshot.expectHaveScreenshot("custom_appearance_theme_1");
      await customization.darkThemeOption.click();
      await customization.saveButtonAppearance.first().click();
      await customization.removeToast();
      await screenshot.expectHaveScreenshot("custom_appearance_theme_2");
      await customization.deleteCustomTheme();
      await customization.removeToast();
      await screenshot.expectHaveScreenshot("custom_appearance_deleted_theme");
    });

    await test.step("General link", async () => {
      await customization.openTab("General");
      await customization.renamingString.fill("empty-string-for-screenshot");
      await customization.hideDnsSettingsInput();
      await screenshot.expectHaveScreenshot("general");
      const page1Promise = page.waitForEvent("popup");
      await customization.docspaceLanguageGuideLink.click();
      const page1 = await page1Promise;
      await page1.waitForURL(
        "https://*.onlyoffice.com/administration/docspace-settings.aspx#DocSpacelanguage",
      );
      await expect(page1).toHaveURL(
        /administration\/docspace-settings.aspx#DocSpacelanguage/,
      );
      await page1.close();
      const page2Promise = page.waitForEvent("popup");
      await customization.docspaceTitleGuideLink.click();
      const page2 = await page2Promise;
      await page2.waitForURL(
        "https://*.onlyoffice.com/administration/docspace-settings.aspx#DocSpacetitle",
      );
      await expect(page2).toHaveURL(
        /administration\/docspace-settings.aspx#DocSpacetitle/,
      );
      await page2.close();
      const page3Promise = page.waitForEvent("popup");
      await customization.docspaceAlternativeUrlGuideLink.click();
      const page3 = await page3Promise;
      await page3.waitForURL(
        "https://*.onlyoffice.com/administration/docspace-settings.aspx#alternativeurl",
      );
      await expect(page3).toHaveURL(
        /administration\/docspace-settings.aspx#alternativeurl/,
      );
      await page3.close();
      const page4Promise = page.waitForEvent("popup");
      await customization.docspaceRenamingGuideLink.click();
      const page4 = await page4Promise;
      await page4.waitForURL(
        "https://*.onlyoffice.com/administration/docspace-settings.aspx#DocSpacerenaming",
      );
      await expect(page4).toHaveURL(
        /administration\/docspace-settings.aspx#DocSpacerenaming/,
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

      // Wait for email to arrive
      await new Promise((resolve) => setTimeout(resolve, 15000));

      // Create a MailChecker instance
      const mailChecker = new MailChecker({
        url: config.QA_MAIL_DOMAIN ?? "",
        user: config.QA_MAIL_LOGIN ?? "",
        pass: config.QA_MAIL_PASSWORD ?? "",
      });

      // Check for email with subject "Change of portal address"
      const email = await mailChecker.checkEmailBySubject({
        subject: "Change of portal address",
        timeoutSeconds: 30,
        moveOut: false,
      });

      // Log the found email
      if (email) {
        console.log(
          `Found portal address change email with subject: "${email.subject}"`,
        );
      }

      // Final verification
      expect(email).toBeTruthy();

      await customization.renamePortalBack(originalName);
      api.apisystem.setPortalDomain(`${originalName}.onlyoffice.io`);
      api.apisystem.setPortalName(originalName);
      await page.waitForURL(`https://${originalName}.onlyoffice.io/**`, {
        timeout: 30000,
      });
      await page.waitForLoadState("domcontentloaded");
    });

    await test.step("Configure deep link", async () => {
      await customization.open();
      await customization.choseDeepLink();
      await customization.removeToast();
      await customization.webOnly.click({ force: true });
      await customization.saveButton.nth(3).click();
      await customization.removeToast();
      await customization.webOrApp.click({ force: true });
      await customization.saveButton.nth(3).click();
      await customization.removeToast();
    });

    await test.step("Brand name email verification", async () => {
      const profile = new Profile(page);

      // Set brand name to "autoTest"
      await customization.openTab("Branding");
      await customization.textInput.first().fill("autoTest");
      await customization.saveButton.first().click();

      // Request password change
      await profile.navigateToProfile();
      await profile.changePassword();

      // Wait for email to arrive
      await new Promise((resolve) => setTimeout(resolve, 15000));

      // Create a MailChecker instance
      const mailChecker = new MailChecker({
        url: config.QA_MAIL_DOMAIN ?? "",
        user: config.QA_MAIL_LOGIN ?? "",
        pass: config.QA_MAIL_PASSWORD ?? "",
      });

      // Check for email with subject "Confirm changing your password" and sender "autoTest"
      const email = await mailChecker.checkEmailBySenderAndSubject({
        subject: "Confirm changing your password",
        sender: "autoTest",
        timeoutSeconds: 30,
        moveOut: false,
      });

      // Final verification
      expect(email).toBeTruthy();
    });
  });

  test.afterAll(async () => {
    await api.cleanup();
  });
});

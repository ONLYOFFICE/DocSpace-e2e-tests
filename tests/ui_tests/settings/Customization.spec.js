import { test, expect } from "@playwright/test";
import { Customization } from "../../../page_objects/settings/Customization";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";
import { PaymentApi } from "../../../api_library/paymentApi/paymentApi";
import { ProfilePage } from "../../../page_objects/accounts/profilePage";
import MailChecker from "../../../utils/mailChecker";
import config from "../../../config/config.js";

test.describe("Customization portal tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let customization;
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
    customization = new Customization(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("Change lang&time", async ({ page }) => {
    await customization.navigateToSettings();
    await customization.changeLanguage("English (United States)");
    await customization.changeTimezone("(UTC) Antarctica/Troll");
    await customization.settingsTitle.click();
    await customization.saveButton.first().click();
    await customization.removeToast.click();
    await customization.changeLanguage("English (United Kingdom)");
    await customization.changeTimezone("(UTC) Europe/London");
    await customization.settingsTitle.click();
    await customization.saveButton.first().click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Welcom page settings", async ({ page }) => {
    await customization.navigateToSettings();
    await customization.setTitle();
    await customization.removeToast2.click();
    await customization.restoreButton.nth(1).click();
    await expect(
      page.locator("text=Welcome Page settings have been successfully saved"),
    ).toHaveText("Welcome Page settings have been successfully saved", {
      timeout: 10000,
    });
  });

  test("Brand name", async ({ page }) => {
    await customization.navigateToSettings();
    await page.getByText("Branding").click();
    await customization.brandName();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Generate logo from text", async ({ page }) => {
    await customization.navigateToSettings();
    await page.getByText("Branding").click();
    await customization.generateLogo();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await customization.removeToast.click();
    await customization.restoreButton.nth(1).click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Branding upload pictures", async ({ page }) => {
    await customization.navigateToSettings();
    await page.getByText("Branding").click();
    await customization.uploadPictures();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await customization.removeToast.click();
    await customization.restoreButton.nth(1).click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Appearance", async ({ page }) => {
    await customization.navigateToSettings();
    await customization.navigateToAppearance.click();
    await customization.selectTheme();
    await customization.darkThemeOption.click();
    await customization.saveButtonAppearance.first().click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await customization.removeToast.click();
    await customization.selectTheme2();
    await customization.saveButtonAppearance.first().click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Custom appereance", async ({ page }) => {
    await customization.navigateToSettings();
    await customization.navigateToAppearance.click();
    await customization.createCustomTheme("##0EEDE9", "#931073");
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await customization.removeToast.click();
    await customization.darkThemeOption.click();
    await customization.saveButtonAppearance.first().click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await customization.removeToast.click();
    await customization.deleteCustomTheme();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("General link", async ({ page }) => {
    test.setTimeout(120000);
    await customization.navigateToSettings();
    const page1Promise = page.waitForEvent("popup");
    await customization.docspaceLanguageGuideLink.click();
    const page1 = await page1Promise;
    await page1.waitForLoadState("load");
    await page1.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-settings.aspx#DocSpacelanguage",
    );
    await expect(page1).toHaveURL(
      /administration\/docspace-settings.aspx#DocSpacelanguage/,
    );
    const page2Promise = page.waitForEvent("popup");
    await customization.docspaceTitleGuideLink.click();
    const page2 = await page2Promise;
    await page2.waitForLoadState("load");
    await page2.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-settings.aspx#DocSpacetitle",
    );
    await expect(page2).toHaveURL(
      /administration\/docspace-settings.aspx#DocSpacetitle/,
    );
    const page3Promise = page.waitForEvent("popup");
    await customization.docspaceAlternativeUrlGuideLink.click();
    const page3 = await page3Promise;
    await page3.waitForLoadState("load");
    await page3.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-settings.aspx#alternativeurl",
    );
    await expect(page3).toHaveURL(
      /administration\/docspace-settings.aspx#alternativeurl/,
    );
    const page4Promise = page.waitForEvent("popup");
    await customization.docspaceRenamingGuideLink.click();
    const page4 = await page4Promise;
    await page4.waitForLoadState("load");
    await page4.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-settings.aspx#DocSpacerenaming",
    );
    await expect(page4).toHaveURL(
      /administration\/docspace-settings.aspx#DocSpacerenaming/,
    );
  });

  test("Rename portal", async ({ page }) => {
    test.setTimeout(90000);
    await customization.navigateToSettings();
    const { originalName, newName } = await customization.renamePortal();
    await page.waitForURL(`https://${newName}.onlyoffice.io/**`, {
      timeout: 30000,
    });
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(`https://${newName}.onlyoffice.io/`);

    // Wait for email to arrive
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // Create a MailChecker instance
    const mailChecker = new MailChecker({
      url: config.QA_MAIL_DOMAIN,
      user: config.QA_MAIL_LOGIN,
      pass: config.QA_MAIL_PASSWORD,
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
    await page.waitForURL(`https://${originalName}.onlyoffice.io/**`, {
      timeout: 30000,
    });
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(`https://${originalName}.onlyoffice.io/`);
  });

  test("Configure deep link", async ({ page }) => {
    await customization.navigateToSettings();
    await customization.choseDeepLink();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await customization.removeToast.click();
    await customization.webOnly.click({ force: true });
    await customization.saveButton.nth(3).click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await customization.removeToast.click();
    await page.waitForTimeout(1000);
    await customization.webOrApp.click({ force: true });
    await customization.saveButton.nth(3).click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Brand name email verification", async ({ page }) => {
    test.setTimeout(60000);
    const profilePage = new ProfilePage(page);

    // Set brand name to "autoTest"
    await customization.navigateToSettings();
    await page.getByText("Branding").click();
    await customization.textInput.first().fill("autoTest");
    await customization.saveButton.first().click();

    // Request password change
    await profilePage.navigateToProfile();
    await profilePage.changePassword();

    // Wait for email to arrive
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // Create a MailChecker instance
    const mailChecker = new MailChecker({
      url: config.QA_MAIL_DOMAIN,
      user: config.QA_MAIL_LOGIN,
      pass: config.QA_MAIL_PASSWORD,
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

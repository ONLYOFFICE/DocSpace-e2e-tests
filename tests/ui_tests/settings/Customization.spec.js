import { test, expect } from "@playwright/test";
import { Customization } from "../../../page_objects/settings/customization";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";
import { PaymentApi } from "../../../api_library/paymentApi/paymentApi";

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
    await page.waitForTimeout(1000);
    await customization.changeLanguage("English (United States)");
    await customization.changeTimezone("(UTC) Antarctica/Troll");
    await customization.settingsTitle.click();
    await customization.saveButton.click();
    await page.waitForTimeout(1000);
    await customization.RemoveToast.click();
    await customization.changeLanguage("English (United Kingdom)");
    await customization.changeTimezone("(UTC) Europe/London");
    await customization.settingsTitle.click();
    await customization.saveButton.click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Welcom page settings", async ({ page }) => {
    await customization.navigateToSettings();
    await customization.setTitle("DocSpace Autotest Portal");
    await customization.settingsTitleWelcomePage.click();
    await customization.saveButtonWelcomePage.click();
    await customization.RemoveToast2.click();
    await customization.restoreButton.click();
    await expect(
      page.locator("text=Welcome Page settings have been successfully saved"),
    ).toHaveText("Welcome Page settings have been successfully saved", {
      timeout: 10000,
    });
  });

  test("Branding use as logo", async ({ page }) => {
    await customization.navigateToSettings();
    await page.getByText("Branding").click();
    await customization.setBrandingText("AutoTesting");
    await customization.fieldContainerButton.click();
    await customization.sectionWrapper.click();
    await customization.saveButton.click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await customization.RemoveToast.click();
    await page.waitForTimeout(1000);
    await customization.restoreButton.click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("Appearance", async ({ page }) => {
    await customization.navigateToSettings();
    await customization.navigateToAppearance.click();
    await page.waitForTimeout(2000);
    await customization.themeContainer.click();
    await page.waitForTimeout(2000);
    await customization.selectTheme(5);
    await customization.darkThemeOption.click();
    await customization.saveButtonAppearance.click();
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await customization.RemoveToast.click();
    await page.waitForTimeout(1000);
    await customization.selectTheme(2);
    await customization.saveButtonAppearance.click();
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
    await customization.RemoveToast.click();
    await customization.darkThemeOption.click();
    await customization.saveButton.click();
    await page.waitForTimeout(1000);
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
    await customization.RemoveToast.click();
    await customization.deleteCustomTheme();
    await page.waitForTimeout(1000);
    await expect(
      page.locator("text=Settings have been successfully updated"),
    ).toHaveText("Settings have been successfully updated", { timeout: 10000 });
  });

  test("General link", async ({ page }) => {
    test.setTimeout(120000);
    await customization.navigateToSettings();
    await page.waitForTimeout(1000);
    const page1Promise = page.waitForEvent("popup");
    await customization.docspaceLanguageGuideLink.click();
    const page1 = await page1Promise;
    await page1.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-settings.aspx#DocSpacelanguage",
    );
    await expect(page1).toHaveURL(
      /administration\/docspace-settings.aspx#DocSpacelanguage/,
    );
    const page3Promise = page.waitForEvent("popup");
    await customization.docspaceTitleGuideLink.click();
    const page3 = await page3Promise;
    await page3.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-settings.aspx#DocSpacetitle",
    );
    await expect(page3).toHaveURL(
      /administration\/docspace-settings.aspx#DocSpacetitle/,
    );
    const page4Promise = page.waitForEvent("popup");
    await customization.docspaceAlternativeUrlGuideLink.click();
    const page4 = await page4Promise;
    await page4.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-settings.aspx#alternativeurl",
    );
    await expect(page4).toHaveURL(
      /administration\/docspace-settings.aspx#alternativeurl/,
    );
    const page5Promise = page.waitForEvent("popup");
    await customization.docspaceRenamingGuideLink.click();
    const page5 = await page5Promise;
    await page5.waitForURL(
      "https://*.onlyoffice.com/administration/docspace-settings.aspx#DocSpacerenaming",
    );
    await expect(page5).toHaveURL(
      /administration\/docspace-settings.aspx#DocSpacerenaming/,
    );
  });
});

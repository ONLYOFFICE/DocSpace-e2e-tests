import { test, expect } from "@playwright/test";
import { Plugins } from "../../../page_objects/settings/plugins";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

test.describe("Plugins tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let plugins;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    const portalData = await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    plugins = new Plugins(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("Markdown link", async ({ page }) => {
    await plugins.navigateToSettings();
    await plugins.navigateToPlugins();
    await plugins.clickMarkdownSettingsButton();
    const page1 = await plugins.guidePopup();
    await page1.waitForLoadState("load");
    await page1.waitForURL(
      "https://github.com/ONLYOFFICE/docspace-plugins/tree/master/markdown",
    );
    await expect(page1).toHaveURL(
      /ONLYOFFICE\/docspace-plugins\/tree\/master\/markdown/,
    );
  });

  test("Draw.io link", async ({ page }) => {
    await plugins.navigateToSettings();
    await plugins.navigateToPlugins();
    await plugins.clickDrawIoSettingsButton();
    const page1 = await plugins.guidePopup();
    await page1.waitForLoadState("load");
    await page1.waitForURL(
      "https://github.com/ONLYOFFICE/docspace-plugins/tree/master/draw.io",
    );
    await expect(page1).toHaveURL(
      /ONLYOFFICE\/docspace-plugins\/tree\/master\/draw\.io/,
    );
  });

  test("Draw.io change settings", async ({ page }) => {
    await plugins.navigateToSettings();
    await plugins.navigateToPlugins();
    await plugins.clickDrawIoSettingsButton();
    await plugins.changeDrawIoSettings();
    await expect(page.locator("text=Data is saved")).toBeVisible({
      timeout: 5000,
    });
  });

  test("Speech to text link", async ({ page }) => {
    await plugins.navigateToSettings();
    await plugins.navigateToPlugins();
    await plugins.clickSpeechToTextSettingsButton();
    const page1 = await plugins.guidePopup();
    await page1.waitForLoadState("load");
    await page1.waitForURL(
      "https://github.com/ONLYOFFICE/docspace-plugins/tree/master/speech-to-text",
    );
    await expect(page1).toHaveURL(
      /ONLYOFFICE\/docspace-plugins\/tree\/master\/speech-to-text/,
    );
  });

  test("Pdf converter link", async ({ page }) => {
    await plugins.navigateToSettings();
    await plugins.navigateToPlugins();
    await plugins.clickPdfConverterSettingsButton();
    const page1 = await plugins.guidePopup();
    await page1.waitForLoadState("load");
    await page1.waitForURL(
      "https://github.com/ONLYOFFICE/docspace-plugins/tree/master/pdf-converter",
    );
    await expect(page1).toHaveURL(
      /ONLYOFFICE\/docspace-plugins\/tree\/master\/pdf-converter/,
    );
  });

  test("Markdown enable", async ({ page }) => {
    const currentUrl = new URL(page.url());
    const portalDomain = currentUrl.hostname;
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url() ===
          `https://${portalDomain}/api/2.0/settings/webplugins/markdown` &&
        response.request().method() === "PUT",
    );
    await plugins.navigateToSettings();
    await plugins.navigateToPlugins();
    await plugins.clickMarkdownEnableSwitch();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });

  test("Draw.io enable", async ({ page }) => {
    const currentUrl = new URL(page.url());
    const portalDomain = currentUrl.hostname;
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url() ===
          `https://${portalDomain}/api/2.0/settings/webplugins/draw.io` &&
        response.request().method() === "PUT",
    );
    await plugins.navigateToSettings();
    await plugins.navigateToPlugins();
    await plugins.clickDrawIoEnableSwitch();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });

  test("Speech to text add key", async ({ page }) => {
    await plugins.navigateToSettings();
    await plugins.navigateToPlugins();
    await plugins.clickSpeechToTextSettingsButton();
    await plugins.fillSpeechToTextToken();
    await expect(page.locator("text=Token is saved")).toBeVisible({
      timeout: 5000,
    });
  });

  test("Speech to text enable", async ({ page }) => {
    const currentUrl = new URL(page.url());
    const portalDomain = currentUrl.hostname;
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url() ===
          `https://${portalDomain}/api/2.0/settings/webplugins/speech-to-text` &&
        response.request().method() === "PUT",
    );
    await plugins.navigateToSettings();
    await plugins.navigateToPlugins();
    await plugins.clickSpeechToTextEnableSwitch();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });

  test("Pdf converter add key", async ({ page }) => {
    await plugins.navigateToSettings();
    await plugins.navigateToPlugins();
    await plugins.clickPdfConverterSettingsButton();
    await plugins.fillPdfConverterToken();
    await expect(page.locator("text=Token is saved")).toBeVisible({
      timeout: 5000,
    });
  });

  test("Pdf converter enable", async ({ page }) => {
    const currentUrl = new URL(page.url());
    const portalDomain = currentUrl.hostname;
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url() ===
          `https://${portalDomain}/api/2.0/settings/webplugins/pdf-converter` &&
        response.request().method() === "PUT",
    );
    await plugins.navigateToSettings();
    await plugins.navigateToPlugins();
    await plugins.clickPdfConverterEnableSwitch();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });
});

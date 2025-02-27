import { test, expect } from "@playwright/test";
import { DevToolsLink } from "../../../page_objects/settings/devToolsLink";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

test.describe("Developer tools link tests", () => {
  let apiContext;
  let portalSetup;
  let portalLoginPage;
  let devToolsLink;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    const portalData = await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    devToolsLink = new DevToolsLink(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("Api link", async ({ page }) => {
    await devToolsLink.navigateToSettings();
    await devToolsLink.navigateToDevTools.click();
    const page1Promise = page.waitForEvent("popup");
    await devToolsLink.clickLearnMoreButton();
    const page1 = await page1Promise;
    await page1.waitForURL("https://*.onlyoffice.com/docspace/");
    await expect(page1).toHaveURL(/docspace/);
  });

  test("JSDK Integration examples link", async ({ page }) => {
    test.setTimeout(60000);
    await devToolsLink.navigateToSettings();
    await devToolsLink.navigateToDevTools.click();
    await devToolsLink.navigateJavaScriptSDK.click();
    const page1Promise = page.waitForEvent("popup");
    await devToolsLink.zoomLink.click();
    const page1 = await page1Promise;
    await page1.waitForURL("https://www.onlyoffice.com/office-for-zoom.aspx");
    await expect(page1).toHaveURL(/office-for-zoom.aspx/);
    const page2Promise = page.waitForEvent("popup");
    await devToolsLink.wordPressLink.click();
    const page2 = await page2Promise;
    await page2.waitForURL(
      "https://www.onlyoffice.com/office-for-wordpress.aspx",
    );
    await expect(page2).toHaveURL(/office-for-wordpress.aspx/);
    const page3Promise = page.waitForEvent("popup");
    await devToolsLink.drupalLink.click();
    const page3 = await page3Promise;
    await page3.waitForURL("https://www.onlyoffice.com/office-for-drupal.aspx");
    await expect(page3).toHaveURL(/office-for-drupal.aspx/);
  });

  test("JSDK link", async ({ page }) => {
    test.setTimeout(60000);
    await devToolsLink.navigateToSettings();
    await devToolsLink.navigateToDevTools.click();
    await devToolsLink.navigateJavaScriptSDK.click();
    const page1Promise = page.waitForEvent("popup");
    await devToolsLink.apiLibraryLink.click();
    const page1 = await page1Promise;
    await page1.waitForURL(
      "https://*.onlyoffice.com/docspace/javascript-sdk/get-started/basic-concepts/",
    );
    await expect(page1).toHaveURL(
      /docspace\/javascript-sdk\/get-started\/basic-concepts/,
    );
    const page2Promise = page.waitForEvent("popup");
    await devToolsLink.allConnectorsLink.click();
    const page2 = await page2Promise;
    await page2.waitForURL("https://www.onlyoffice.com/all-connectors.aspx");
    await expect(page2).toHaveURL(/all-connectors.aspx/);
  });

  test("Plugin SDK link", async ({ page }) => {
    test.setTimeout(60000);
    await devToolsLink.navigateToSettings();
    await devToolsLink.navigateToDevTools.click();
    await devToolsLink.navigateToPlaginSDK.click();
    const page1Promise = page.waitForEvent("popup");
    await devToolsLink.readInstructionsButton.click();
    const page1 = await page1Promise;
    await page1.waitForURL(
      "https://*.onlyoffice.com/docspace/plugins-sdk/get-started/basic-concepts/",
    );
    await expect(page1).toHaveURL(
      /docspace\/plugins-sdk\/get-started\/basic-concepts/,
    );
    await devToolsLink.markdownLink.click();
    const page2Promise = page.waitForEvent("popup");
    const page2 = await page2Promise;
    await page2.waitForURL(
      "https://github.com/ONLYOFFICE/docspace-plugins/tree/master/markdown",
    );
    await expect(page2).toHaveURL(
      /ONLYOFFICE\/docspace-plugins\/tree\/master\/markdown/,
    );
    await devToolsLink.drawIoLink.click();
    const page3Promise = page.waitForEvent("popup");
    const page3 = await page3Promise;
    await page3.waitForURL(
      "https://github.com/ONLYOFFICE/docspace-plugins/tree/master/draw.io",
    );
    await expect(page3).toHaveURL(
      /ONLYOFFICE\/docspace-plugins\/tree\/master\/draw.io/,
    );
    await devToolsLink.speechToTextLink.click();
    const page4Promise = page.waitForEvent("popup");
    const page4 = await page4Promise;
    await page4.waitForURL(
      "https://github.com/ONLYOFFICE/docspace-plugins/tree/master/speech-to-text",
    );
    await expect(page4).toHaveURL(
      /ONLYOFFICE\/docspace-plugins\/tree\/master\/speech-to-text/,
    );
    await devToolsLink.pdfConverterLink.click();
    const page5Promise = page.waitForEvent("popup");
    const page5 = await page5Promise;
    await page5.waitForURL(
      "https://github.com/ONLYOFFICE/docspace-plugins/tree/master/pdf-converter",
    );
    await expect(page5).toHaveURL(
      /ONLYOFFICE\/docspace-plugins\/tree\/master\/pdf-converter/,
    );
  });
});

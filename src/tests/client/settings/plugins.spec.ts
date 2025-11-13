import { Integration } from "@/src/objects/settings/integration/Integration";
import { PaymentApi } from "@/src/api/payment";
import { test } from "@/src/fixtures";
import { Plugins } from "@/src/objects/settings/integration/Plugins";
import { integrationTabs } from "@/src/utils/constants/settings";
import Screenshot from "@/src/objects/common/Screenshot";

test.describe("Integration tests - Plugins", () => {
  let paymentApi: PaymentApi;

  let screenshot: Screenshot | undefined;
  let integration: Integration;
  let plugins: Plugins;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);

    const portalInfo = await paymentApi.getPortalInfo(api.portalDomain);
    await paymentApi.makePortalPayment(portalInfo.tenantId, 10);
    await paymentApi.refreshPaymentInfo(api.portalDomain);

    screenshot = new Screenshot(page, {
      screenshotDir: "plugins",
    });
    integration = new Integration(page);
    plugins = new Plugins(page);

    await login.loginToPortal();
    await integration.open();
    await integration.openTab(integrationTabs.plugins);
  });
  test.skip("Plugins", async () => {
    await test.step("Markdown link", async () => {
      await plugins.openMarkdownSettings(screenshot);
      const page1 = await plugins.guidePopup();
      await page1.waitForURL(
        "https://github.com/ONLYOFFICE/docspace-plugins/tree/master/markdown",
      );
      await page1.close();
      await plugins.closePluginSettings();
    });

    await test.step("Draw.io link", async () => {
      await plugins.openDrawIoSettings(screenshot);
      const page1 = await plugins.guidePopup();
      await page1.waitForURL(
        "https://github.com/ONLYOFFICE/docspace-plugins/tree/master/draw.io",
      );
      await page1.close();
      await plugins.closePluginSettings();
    });

    await test.step("Draw.io change settings", async () => {
      await plugins.openDrawIoSettings();
      await plugins.changeDrawIoSettings(screenshot);
      await plugins.closePluginSettings();
    });

    await test.step("Speech to text link", async () => {
      await plugins.openSpeechToTextSettings(screenshot);
      const page1 = await plugins.guidePopup();
      await page1.waitForURL(
        "https://github.com/ONLYOFFICE/docspace-plugins/tree/master/speech-to-text",
      );
      await page1.close();
      await plugins.closePluginSettings();
    });

    await test.step("Pdf converter link", async () => {
      await plugins.openPdfConverterSettings(screenshot);
      const page1 = await plugins.guidePopup();
      await page1.waitForURL(
        "https://github.com/ONLYOFFICE/docspace-plugins/tree/master/pdf-converter",
      );
      await page1.close();
      await plugins.closePluginSettings();
    });

    await test.step("Markdown enable", async () => {
      await plugins.enableMarkdown();
      await plugins.disableMarkdown();
    });

    await test.step("Draw.io enable", async () => {
      await plugins.enableDrawIo();
      await plugins.disableDrawIo();
    });

    await test.step("Speech to text add key", async () => {
      await plugins.openSpeechToTextSettings();
      await plugins.fillSpeechToTextToken();
    });

    await test.step("Speech to text enable", async () => {
      await plugins.enableSpeechToText();
      await plugins.disableSpeechToText();
    });

    await test.step("Pdf converter add key", async () => {
      await plugins.openPdfConverterSettings();
      await plugins.fillPdfConverterToken();
    });

    await test.step("Pdf converter enable", async () => {
      await plugins.enablePdfConverter();
      await plugins.disablePdfConverter();
    });
  });
});

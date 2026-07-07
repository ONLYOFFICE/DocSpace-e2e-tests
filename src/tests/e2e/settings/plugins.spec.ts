import { Integration } from "@/src/objects/settings/integration/Integration";
import { PaymentApi } from "@/src/api/payment";
import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import { Plugins } from "@/src/objects/settings/integration/Plugins";
import MyDocuments from "@/src/objects/files/MyDocuments";
import {
  integrationTabs,
  samplePluginZip,
  toastMessages,
} from "@/src/utils/constants/settings";

const PLUGIN_REPO =
  "https://github.com/ONLYOFFICE/docspace-plugins/tree/master";

test.describe("Integration tests - Plugins", () => {
  let paymentApi: PaymentApi;
  let integration: Integration;
  let plugins: Plugins;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();

    integration = new Integration(page);
    plugins = new Plugins(page);

    await login.loginToPortal();
    await integration.open();
    await integration.openTab(integrationTabs.plugins);
  });

  test("Markdown: guide link and enable/disable", async () => {
    await test.step("Guide link opens the plugin repo", async () => {
      await plugins.openMarkdownSettings();
      const page1 = await plugins.guidePopup();
      await page1.waitForURL(`${PLUGIN_REPO}/markdown`);
      await page1.close();
      await plugins.closePluginSettings();
    });

    await test.step("Enable then disable", async () => {
      await plugins.enableMarkdown();
      await plugins.disableMarkdown();
    });
  });

  test("Draw.io: guide link, settings and enable/disable", async () => {
    await test.step("Guide link opens the plugin repo", async () => {
      await plugins.openDrawIoSettings();
      const page1 = await plugins.guidePopup();
      await page1.waitForURL(`${PLUGIN_REPO}/draw.io`);
      await page1.close();
      await plugins.closePluginSettings();
    });

    await test.step("Change plugin settings", async () => {
      await plugins.openDrawIoSettings();
      await plugins.changeDrawIoSettings();
      await plugins.closePluginSettings();
    });

    await test.step("Enable then disable", async () => {
      await plugins.enableDrawIo();
      await plugins.disableDrawIo();
    });
  });

  test("Speech to text: guide link, key and enable/disable", async () => {
    await test.step("Guide link opens the plugin repo", async () => {
      await plugins.openSpeechToTextSettings();
      const page1 = await plugins.guidePopup();
      await page1.waitForURL(`${PLUGIN_REPO}/speech-to-text`);
      await page1.close();
      await plugins.closePluginSettings();
    });

    await test.step("Add API key", async () => {
      await plugins.openSpeechToTextSettings();
      await plugins.fillSpeechToTextToken();
    });

    await test.step("Enable then disable", async () => {
      await plugins.enableSpeechToText();
      await plugins.disableSpeechToText();
    });
  });

  test("PDF converter: guide link, key and enable/disable", async () => {
    await test.step("Guide link opens the plugin repo", async () => {
      await plugins.openPdfConverterSettings();
      const page1 = await plugins.guidePopup();
      await page1.waitForURL(`${PLUGIN_REPO}/pdf-converter`);
      await page1.close();
      await plugins.closePluginSettings();
    });

    await test.step("Add API key", async () => {
      await plugins.openPdfConverterSettings();
      await plugins.fillPdfConverterToken();
    });

    await test.step("Enable then disable", async () => {
      await plugins.enablePdfConverter();
      await plugins.disablePdfConverter();
    });
  });

  test("Enabling a plugin surfaces it in the Actions menu", async ({
    page,
    api,
  }) => {
    const myDocuments = new MyDocuments(page, api.portalDomain);

    await test.step("Enable the Draw.io plugin", async () => {
      await plugins.enableDrawIo();
    });

    await test.step("Plugin appears under the My Documents Actions menu", async () => {
      await myDocuments.open();
      await myDocuments.filesNavigation.openActionsDropdown();
      await expect(page.locator("#actions_more-plugins")).toBeVisible();
    });
  });

  test("Plugin cache warning on re-upload of same version", async () => {
    await test.step("Upload plugin first time", async () => {
      await plugins.uploadPlugin(samplePluginZip.path);
      await plugins.dismissToastSafely(toastMessages.pluginLoaded);
      await expect(plugins.sdkInfoPluginArea).toBeVisible();
    });

    await test.step("Upload same plugin version again", async () => {
      await plugins.uploadPlugin(samplePluginZip.path);
    });

    await test.step("Verify cache warning dialog appears and dismiss it", async () => {
      await plugins.confirmCacheWarning();
    });
  });
});

import { Integration } from "@/src/objects/settings/integration/Integration";
import { PaymentApi } from "@/src/api/payment";
import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import { Plugins } from "@/src/objects/settings/integration/Plugins";
import Files from "@/src/objects/files/Files";
import { WorkspaceApp } from "@/src/objects/plugins/WorkspaceApp";
import { workspaceAppPlugins } from "@/src/utils/constants/plugins";
import {
  integrationTabs,
  samplePluginZip,
  toastMessages,
} from "@/src/utils/constants/settings";

const PLUGIN_REPO =
  "https://github.com/ONLYOFFICE/docspace-plugins/tree/master";
const PLUGIN_GROUP = "Sales";

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
    const files = new Files(page, api.portalDomain);

    await test.step("Enable the Draw.io plugin", async () => {
      await plugins.enableDrawIo();
    });

    await test.step("Plugin appears under the My Documents Actions menu", async () => {
      await files.open();
      await files.filesNavigation.openCreateDropdown();
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

  test("Restricted access shows Deals only to the listed people and group members", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    test.setTimeout(300000);
    const workspaceApp = new WorkspaceApp(page, api.portalDomain);
    const plugin = workspaceAppPlugins.sample;

    const groupMember = await apiSdk.profiles.addMemberWithId("owner", "User");
    // A plain name: the plugin shows names as the API returns them, HTML-encoded
    const listedUser = await apiSdk.profiles.addMemberWithId("owner", "User", {
      firstName: "Listed",
      lastName: "Person",
    });
    const outsider = await apiSdk.profiles.addMemberWithId("owner", "User");
    await apiSdk.groups.create("owner", PLUGIN_GROUP, [groupMember.userId]);
    const listedName = `${listedUser.userData.firstName} ${listedUser.userData.lastName}`;

    await test.step("Restrict Deals to the group and one person", async () => {
      await plugins.uploadPluginAndWait(plugin.path);
      await plugins.openUploadedPluginSettings(plugin.name);
      await plugins.restrictPluginAccess({
        groups: [PLUGIN_GROUP],
        people: [listedName],
      });
    });

    await test.step("The owner is not listed and loses the card and widget", async () => {
      await workspaceApp.expectOnHome(plugin, { card: false, widget: false });
    });

    await test.step("A group member sees the entry, card and widget", async () => {
      await login.logout();
      await login.loginWithCredentials(
        groupMember.userData.email,
        groupMember.userData.password,
      );
      await workspaceApp.expectEntryInFiles(plugin, true);
      await workspaceApp.expectOnHome(plugin, { card: true, widget: true });
    });

    await test.step("The listed person sees the card and widget", async () => {
      await login.logout();
      await login.loginWithCredentials(
        listedUser.userData.email,
        listedUser.userData.password,
      );
      await workspaceApp.expectOnHome(plugin, { card: true, widget: true });
    });

    await test.step("Anyone else sees neither and the direct link leads Home", async () => {
      await login.logout();
      await login.loginWithCredentials(
        outsider.userData.email,
        outsider.userData.password,
      );
      await workspaceApp.expectOnHome(plugin, { card: false, widget: false });
      await workspaceApp.expectPageClosed(plugin);
    });
  });

  test("The card follows the section of its entry, the widget its own roles", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    test.setTimeout(240000);
    const workspaceApp = new WorkspaceApp(page, api.portalDomain);
    // Entry in Settings only, widget for the owner and admins
    const plugin = workspaceAppPlugins.settingsOnly;
    const user = await apiSdk.profiles.addMemberWithId("owner", "User");

    await test.step("The owner finds the entry in Settings, not in Files", async () => {
      await plugins.uploadPluginAndWait(plugin.path);
      await workspaceApp.expectEntryInSettingsSidebar(plugin);
      await workspaceApp.expectEntryInFiles(plugin, false);
    });

    await test.step("The owner's card opens the plugin page in Settings", async () => {
      await workspaceApp.expectOnHome(plugin, { card: true, widget: true });
      await workspaceApp.openFromCard(plugin);
    });

    await test.step("A user cannot open Settings, so has neither card nor widget", async () => {
      await login.logout();
      await login.loginWithCredentials(
        user.userData.email,
        user.userData.password,
      );
      await workspaceApp.expectOnHome(plugin, { card: false, widget: false });
    });
  });
});

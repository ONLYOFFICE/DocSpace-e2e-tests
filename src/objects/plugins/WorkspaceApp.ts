import { expect, Locator, Page } from "@playwright/test";
import { getPortalUrl } from "@/config";
import BasePage from "../common/BasePage";
import { Dashboard } from "../dashboard/Dashboard";
import Files from "../files/Files";
import { TWorkspaceAppPlugin } from "@/src/utils/constants/plugins";

// What the workspace-app sample plugins add to the portal: an entry in the
// left menu, its card on the Home page and a widget on the Home page.
export class WorkspaceApp extends BasePage {
  private portalDomain: string;
  private dashboard: Dashboard;
  private files: Files;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
    this.dashboard = new Dashboard(page, portalDomain);
    this.files = new Files(page, portalDomain);
  }

  // A hidden item is only missing once the plugin has loaded and been
  // filtered, so a page load waits for the plugin's script
  private async loadWithPlugin(
    plugin: TWorkspaceAppPlugin,
    load: () => Promise<unknown>,
  ) {
    const pluginLoaded = this.page.waitForResponse((r) =>
      r.url().includes(`/${plugin.name}/plugin.js`),
    );
    await load();
    await pluginLoaded;
  }

  private entry(plugin: TWorkspaceAppPlugin): Locator {
    return this.page.locator(
      `[data-item-id="plugin-navigation-${plugin.entry}"]`,
    );
  }

  private pluginPage(plugin: TWorkspaceAppPlugin): Locator {
    return this.page.locator(`#${plugin.entry}-page`);
  }

  async expectOnHome(
    plugin: TWorkspaceAppPlugin,
    shown: { card: boolean; widget: boolean },
  ) {
    await this.loadWithPlugin(plugin, () => this.dashboard.open());
    await expect(this.dashboard.openFilesButton).toBeVisible();
    await expect(
      this.page.locator(
        `[data-tour-id="dashboard-app-card-plugin-${plugin.entry}"]`,
      ),
    ).toHaveCount(shown.card ? 1 : 0);
    await expect(
      this.page.getByTestId(`dashboard-plugin-widget-${plugin.widget}`),
    ).toHaveCount(shown.widget ? 1 : 0);
  }

  async expectEntryInFiles(plugin: TWorkspaceAppPlugin, shown: boolean) {
    await this.loadWithPlugin(plugin, () => this.files.open());
    await expect(this.entry(plugin)).toHaveCount(shown ? 1 : 0);
  }

  // On any Settings page, e.g. the Plugins tab the plugin was just uploaded on
  async expectEntryInSettingsSidebar(plugin: TWorkspaceAppPlugin) {
    await expect(this.entry(plugin)).toBeVisible();
  }

  // On Home, after expectOnHome
  async openFromCard(plugin: TWorkspaceAppPlugin) {
    await this.page
      .getByTestId(`dashboard-app-open-plugin-${plugin.entry}`)
      .click();
    await this.page.waitForURL(`**${plugin.pagePath}`);
    await expect(this.pluginPage(plugin)).toBeVisible();
  }

  // Someone the entry is hidden from is sent to Home instead of the plugin page
  async expectPageClosed(plugin: TWorkspaceAppPlugin) {
    await this.loadWithPlugin(plugin, () =>
      this.page.goto(`${getPortalUrl(this.portalDomain)}${plugin.pagePath}`),
    );
    await this.page.waitForURL("**/dashboard");
    await expect(this.pluginPage(plugin)).toHaveCount(0);
  }
}

import { getPortalUrl } from "../../../config";
import BasePage from "../common/BasePage";
import { expect, Locator, Page } from "@playwright/test";
import { navItems } from "@/src/utils/constants/settings";

class AiSettings extends BasePage {
  private portalDomain: string;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
  }

  private get activateButton() {
    return this.page
      .locator('[class*="AIFeaturesBanner-module__banner"]')
      .getByTestId("button");
  }

  private get editMcpConfigButton() {
    return this.page.getByRole("button", {
      name: "Edit configuration",
      exact: true,
    });
  }

  private get mcpConfigEditor() {
    return this.page.locator(".cm-content");
  }

  private get saveMcpConfigButton() {
    return this.page.getByRole("button", { name: "Save", exact: true });
  }

  private get modelsTab() {
    return this.page.getByTestId("ai-models_tab");
  }

  private get serversTab() {
    return this.page.getByTestId("mcp-servers_tab");
  }

  private get searchTab() {
    return this.page.getByTestId("web-search_tab");
  }

  private get knowledgeTab() {
    return this.page.getByTestId("knowledge_tab");
  }

  private get aiSettingsBaseUrl() {
    return `${getPortalUrl(this.portalDomain)}/portal-settings/ai-settings`;
  }

  async openDirectly() {
    await this.page.goto(`${this.aiSettingsBaseUrl}/ai-models`);
    await this.expectLoaded();
  }

  async open() {
    await this.navigateToSettings();
    await this.navigateToArticle(navItems.aiSettings);
    await this.expectLoaded();
  }

  async expectLoaded() {
    await expect(this.activateButton).toBeVisible();
  }
  async activate() {
    await this.expectLoaded();
    await this.activateButton.click();
    await this.page.waitForURL(/\/billing\/addons\/ai-services/, {
      timeout: 30000,
    });
    await this.page.waitForTimeout(3000);
  }

  async openMcpServersTab() {
    await this.openTab(this.serversTab);
  }

  async openWebSearchTab() {
    await this.openTab(this.searchTab);
  }

  async openKnowledgeTab() {
    await this.openTab(this.knowledgeTab);
  }

  // The redesigned Web search tab is informational: a description, a "Learn
  // more" help link and per-engine pricing links.
  get webSearchLearnMoreLink() {
    return this.page.locator('[class*="WebSearchSaas-module__learnMore"]');
  }

  get webSearchPricingLink() {
    return this.page
      .locator('[class*="WebSearchSaas-module__detailsLink"]')
      .first();
  }

  // The redesigned Knowledge base tab is informational too: a description, a
  // "Learn more" help link and a vectorization model pricing link.
  get knowledgeLearnMoreLink() {
    return this.page.locator('[class*="KnowledgeBaseSaas-module__learnMore"]');
  }

  get knowledgePricingLink() {
    return this.page
      .locator('[class*="KnowledgeBaseSaas-module__detailsLink"]')
      .first();
  }

  // Clicks a link that opens in a new tab and returns the opened page so the
  // test can assert the destination URL.
  async openLinkInNewTab(link: Locator): Promise<Page> {
    const [popup] = await Promise.all([
      this.page.context().waitForEvent("page"),
      link.click(),
    ]);
    await popup.waitForLoadState("domcontentloaded");
    return popup;
  }

  async addMcpServer(name: string, url: string) {
    await expect(this.editMcpConfigButton).toBeEnabled();
    await this.editMcpConfigButton.click();
    await expect(this.mcpConfigEditor).toBeVisible();

    const config = JSON.stringify({ mcpServers: { [name]: { url } } }, null, 2);
    await this.mcpConfigEditor.click();
    await this.page.keyboard.press(
      process.platform === "darwin" ? "Meta+A" : "Control+A",
    );
    await this.page.keyboard.press("Backspace");
    await this.page.keyboard.insertText(config);

    await expect(this.saveMcpConfigButton).toBeEnabled();
    await this.saveMcpConfigButton.click();
  }

  async expectMcpServerInList(name: string) {
    await expect(
      this.page.locator("p.font-bold", { hasText: name }),
    ).toBeVisible();
  }

  private async openTab(tab: Locator) {
    await this.page.goto(`${this.aiSettingsBaseUrl}/ai-models`);
    await expect(this.modelsTab).toBeVisible();
    await tab.click();
    await expect(tab).toHaveClass(/Tabs-module__selected/);
  }
}

export default AiSettings;

import BasePage from "../common/BasePage";
import { expect, Locator, Page } from "@playwright/test";

class AiSettings extends BasePage {
  private portalDomain: string;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
  }

  private get addProviderButton() {
    return this.page.locator('[aria-label="Add AI provider"]');
  }

  private get addMcpServerButton() {
    return this.page.locator(
      '[aria-label="Add MCP Server"][data-testid="button"]',
    );
  }

  private get providersTab() {
    return this.page.getByTestId("providers_tab");
  }

  private get serversTab() {
    return this.page.getByTestId("servers_tab");
  }

  private get searchTab() {
    return this.page.getByTestId("search_tab");
  }

  private get knowledgeTab() {
    return this.page.getByTestId("knowledge_tab");
  }

  private get comboButtons() {
    return this.page.locator('[data-test-id="combo-button"]');
  }

  private get webSearchCombo() {
    return this.comboButtons.nth(0);
  }

  private get knowledgeCombo() {
    return this.comboButtons.nth(0);
  }

  private get aiArticleNavItem() {
    return this.article.articleNavItems.filter({ hasText: /\bAI\b/i }).first();
  }

  private get aiSettingsBaseUrl() {
    return `https://${this.portalDomain}/portal-settings/ai-settings`;
  }

  async openDirectly() {
    await this.page.goto(`${this.aiSettingsBaseUrl}/providers`);
    await this.expectLoaded();
  }

  async open() {
    await this.navigateToSettings();
    const navItem = this.aiArticleNavItem;
    await expect(navItem).toBeVisible();
    await navItem.click();
    await this.expectLoaded();
  }

  async expectLoaded() {
    await expect(this.addProviderButton).toBeVisible();
  }

  async openProvidersTab() {
    await this.openTab(this.providersTab);
  }

  async expectAddProviderButtonVisible() {
    await expect(this.addProviderButton).toBeVisible();
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

  async expectAddMcpServerDisabled() {
    await expect(this.addMcpServerButton).toBeVisible();
    await expect(this.addMcpServerButton).toBeDisabled();
  }

  async expectWebSearchSelectDisabled() {
    await this.expectComboDisabled(this.webSearchCombo);
  }

  async expectKnowledgeSelectDisabled() {
    await this.expectComboDisabled(this.knowledgeCombo);
  }

  private async openTab(tab: Locator) {
    await tab.click();
  }

  private async expectComboDisabled(combo: Locator) {
    await expect(combo).toBeVisible();
    await expect(combo).toHaveAttribute("aria-disabled", "true");
    await expect(combo.getByTestId("text")).toContainText("Select");
  }
}

export default AiSettings;

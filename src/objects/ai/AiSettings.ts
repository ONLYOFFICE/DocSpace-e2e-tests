import BasePage from "../common/BasePage";
import { expect, Locator, Page } from "@playwright/test";
import { BaseDropdown } from "../common/BaseDropdown";

class AiSettings extends BasePage {
  private portalDomain: string;
  private dropdown: BaseDropdown;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
    this.dropdown = new BaseDropdown(page, {
      menu: this.page.getByRole("listbox"),
    });
  }

  private get addProviderButton() {
    return this.page.getByTestId("add-provider-button");
  }

  private get addMcpServerButton() {
    return this.page.getByTestId("add-mcp-button");
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

  async expectAddMcpServerVisible() {
    await expect(this.addMcpServerButton).toBeVisible();
  }

  async expectWebSearchSelectVisible() {
    await this.expectComboVisible(this.webSearchCombo);
  }

  async expectWebSearchSelectDisabled() {
    await this.expectComboDisabled(this.webSearchCombo);
  }

  async expectKnowledgeSelectVisible() {
    await this.expectComboVisible(this.knowledgeCombo);
  }

  async expectKnowledgeSelectDisabled() {
    await this.expectComboDisabled(this.knowledgeCombo);
  }

  async clickAddProviderButton() {
    await this.addProviderButton.click();
  }

  async selectProviderType(providerName: string) {
    await this.page.getByTestId("provider-type-combobox").click();
    await this.dropdown.clickOption(providerName);
  }

  async fillProviderTitle(title: string) {
    await this.page.getByTestId("provider-title-input").fill(title);
  }

  async fillProviderKey(key: string) {
    await this.page
      .getByTestId("provider-key-input")
      .locator("input")
      .fill(key);
  }

  async saveProvider() {
    const button = this.page.getByTestId("provider-save-button");
    await expect(button).toBeEnabled();
    await button.click();
  }

  async selectWebSearchEngine(engineName: string) {
    await this.page.getByTestId("web-search-engine-combobox").click();
    const webSearchDropdown = new BaseDropdown(this.page, {
      menu: this.page.getByTestId("web-search-engine-dropdown"),
    });
    await webSearchDropdown.clickOption(engineName);
  }

  async fillWebSearchKey(key: string) {
    await this.page
      .getByTestId("web-search-key-input")
      .locator("input")
      .fill(key);
  }

  async saveWebSearch() {
    await this.page.getByTestId("web-search-save-button").click();
  }

  async expectWebSearchSaved() {
    await expect(
      this.page.getByTestId("web-search-key-hidden-banner"),
    ).toBeVisible();
  }

  async expectProviderInList(title: string) {
    await expect(
      this.page
        .getByTestId("ai-provider-list")
        .getByRole("heading", { name: title }),
    ).toBeVisible();
  }

  private async openTab(tab: Locator) {
    await tab.click();
  }

  private async expectComboVisible(combo: Locator) {
    await expect(combo).toBeVisible();
  }

  private async expectComboDisabled(combo: Locator) {
    await expect(combo).toBeVisible();
    await expect(combo).toHaveAttribute("aria-disabled", "true");
    await expect(combo.getByTestId("text")).toContainText("Select");
  }
}

export default AiSettings;

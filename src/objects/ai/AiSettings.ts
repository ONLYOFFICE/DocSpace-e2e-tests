import { getPortalUrl } from "../../../config";
import BasePage from "../common/BasePage";
import { expect, Locator, Page } from "@playwright/test";
import { BaseDropdown } from "../common/BaseDropdown";
import { navItems } from "@/src/utils/constants/settings";

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

  private get activateButton() {
    return this.page
      .locator('[class*="AIFeaturesBanner-module__banner"]')
      .getByTestId("button");
  }

  private get addMcpServerButton() {
    return this.page.getByTestId("add-mcp-button");
  }

  private get providersTab() {
    return this.page.getByTestId("providers_tab");
  }

  private get modelsTab() {
    return this.page.getByTestId("models_tab");
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

  private get aiSettingsBaseUrl() {
    return `${getPortalUrl(this.portalDomain)}/portal-settings/ai-settings`;
  }

  async openDirectly() {
    await this.page.goto(`${this.aiSettingsBaseUrl}/models`);
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
    await this.page.waitForURL(/\/payments\/services\/ai-services/, {
      timeout: 30000,
    });
    await this.page.waitForTimeout(3000);
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

  async selectFirstAvailableModel() {
    const addModelAnchor = this.page.locator(
      '[role="button"]:has([data-testid="add-model-button"])',
    );
    const popup = this.page.getByTestId("model-selector-popup");

    await addModelAnchor.scrollIntoViewIfNeeded();
    await expect(async () => {
      await addModelAnchor.click({ force: true });
      await expect(popup).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 10000 });

    const firstRow = popup.locator('[data-testid^="model-row-"]').first();
    await expect(firstRow).toBeVisible();
    await firstRow.getByTestId("checkbox").click({ force: true });
    await expect(
      this.page.locator('[data-testid^="model-tag-"]').first(),
    ).toBeVisible();
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

  // The redesigned Web search tab is informational: a description, a "Learn
  // more" help link and per-engine pricing links.
  get webSearchLearnMoreLink() {
    return this.page.locator('[class*="WebSearch-module__learnMore"]');
  }

  get webSearchPricingLink() {
    return this.page
      .locator('[class*="WebSearch-module__detailsLink"]')
      .first();
  }

  // The redesigned Knowledge base tab is informational too: a description, a
  // "Learn more" help link and a vectorization model pricing link.
  get knowledgeLearnMoreLink() {
    return this.page.locator('[class*="KnowledgeBase-module__learnMore"]');
  }

  get knowledgePricingLink() {
    return this.page
      .locator('[class*="KnowledgeBase-module__detailsLink"]')
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

  async expectProviderInList(title: string) {
    await expect(
      this.page
        .getByTestId("ai-provider-list")
        .getByRole("heading", { name: title }),
    ).toBeVisible();
  }

  async expectProviderNotInList(title: string) {
    await expect(
      this.page
        .getByTestId("ai-provider-list")
        .getByRole("heading", { name: title, exact: true }),
    ).toBeHidden();
  }

  private providerCard(title: string): Locator {
    return this.page.getByTestId("ai-provider-tile").filter({
      has: this.page.getByRole("heading", { name: title, exact: true }),
    });
  }

  async openProviderMenu(title: string) {
    const card = this.providerCard(title);
    await card.getByTestId("context-menu-button").click();
  }

  async openProviderSettings(title: string) {
    await this.openProviderMenu(title);
    await this.page.getByTestId("settings_item").click();
    await expect(this.page.getByTestId("update-provider-form")).toBeVisible();
  }

  async openDeleteProviderDialog(title: string) {
    await this.openProviderMenu(title);
    await this.page.getByTestId("delete_item").click();
    await expect(this.page.getByTestId("delete-provider-button")).toBeVisible();
  }

  async confirmDeleteProvider() {
    await this.page.getByTestId("delete-provider-button").click();
  }

  async renameProvider(oldTitle: string, newTitle: string) {
    await this.openProviderSettings(oldTitle);
    const titleInput = this.page.getByTestId("provider-title-input");
    await titleInput.fill(newTitle);
    const saveButton = this.page.getByTestId("provider-save-button");
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
  }

  async clickAddMcpServerButton() {
    await expect(this.addMcpServerButton).toBeEnabled();
    await this.addMcpServerButton.click();
    await expect(this.page.getByTestId("add-mcp-form")).toBeVisible();
  }

  async fillMcpServerName(name: string) {
    await this.page.getByTestId("mcp-title-input").fill(name);
  }

  async fillMcpServerUrl(url: string) {
    await this.page.getByTestId("mcp-url-input").fill(url);
  }

  async fillMcpServerDescription(description: string) {
    await this.page.getByTestId("mcp-description-textarea").fill(description);
  }

  async saveMcpServer() {
    const button = this.page.getByTestId("mcp-save-button");
    await expect(button).toBeEnabled();
    await button.click();
  }

  async expectMcpServerInList(name: string) {
    await expect(
      this.page.getByTestId("custom-mcp-list").getByRole("heading", { name }),
    ).toBeVisible();
  }

  async selectKnowledgeProvider(providerName: string) {
    await this.page.getByTestId("knowledge-provider-combobox").click();
    const knowledgeDropdown = new BaseDropdown(this.page, {
      menu: this.page.getByTestId("knowledge-provider-dropdown"),
    });
    await knowledgeDropdown.clickOption(providerName);
  }

  async fillKnowledgeKey(key: string) {
    await this.page
      .getByTestId("knowledge-key-input")
      .locator("input")
      .fill(key);
  }

  async saveKnowledge() {
    const button = this.page.getByTestId("knowledge-save-button");
    await expect(button).toBeEnabled();
    await button.click();
  }

  async expectKnowledgeSaved() {
    await expect(
      this.page.getByTestId("knowledge-key-hidden-banner"),
    ).toBeVisible();
  }

  private async openTab(tab: Locator) {
    await this.page.goto(`${this.aiSettingsBaseUrl}/models`);
    await expect(this.modelsTab).toBeVisible();
    await tab.click();
    await expect(tab).toHaveClass(/Tabs-module__selected/);
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

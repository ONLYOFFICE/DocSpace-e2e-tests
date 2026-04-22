import { getPortalUrl } from "../../../config";
import BasePage from "../common/BasePage";
import { expect, Page } from "@playwright/test";

export class AiAgents extends BasePage {
  private portalDomain: string;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
  }

  private get emptyProvidersHeading() {
    return this.page.getByText("AI provider is not available yet");
  }

  private get goToSettingsButton() {
    return this.page.locator("#go-to-ai-provider-settings");
  }

  private get aiAgentsNavigationItem() {
    return this.page.locator(
      'a[href*="/ai-agents"] #document_catalog-undefined',
    );
  }

  private get createAgentEmptyViewItem() {
    return this.page.locator("#create-ai-agent");
  }

  private get agentNameInput() {
    return this.page.getByTestId("create_edit_agent_input");
  }

  private get providerCombobox() {
    return this.page.getByTestId("create_agent_provider_combobox");
  }

  private get modelCombobox() {
    return this.page.getByTestId("create_agent_model_combobox");
  }

  private get instructionsTextarea() {
    return this.page.getByTestId("create_agent_instructions_textarea");
  }

  private get createAgentButton() {
    return this.page.getByTestId("create_agent_dialog_save");
  }

  private agentNameCell(name: string) {
    return this.page
      .locator('[data-testid^="rooms-cell-name-"]')
      .filter({ hasText: name });
  }

  private get chatInputButtons() {
    return this.page.getByTestId("chat-input-buttons");
  }

  async openDirectly() {
    await this.page.goto(`${getPortalUrl(this.portalDomain)}/ai-agents/filter`);
    await this.waitForAiAgentsPage();
  }

  async open() {
    const navItem = this.aiAgentsNavigationItem;
    await expect(navItem).toBeVisible();
    await navItem.click();
    await this.waitForAiAgentsPage();
  }

  async expectNoProvidersMessage() {
    await expect(this.emptyProvidersHeading).toBeVisible();
  }

  async goToSettings() {
    await this.goToSettingsButton.click();
  }

  private async waitForAiAgentsPage() {
    await expect(this.page).toHaveURL(/\/ai-agents/);
  }

  async openCreateAgentDialog() {
    await this.createAgentEmptyViewItem.click();
    await expect(this.agentNameInput).toBeVisible();
  }

  async fillAgentName(name: string) {
    await this.agentNameInput.fill(name);
  }

  async selectProvider(providerTitle: string) {
    await this.providerCombobox.click();
    await this.page
      .getByRole("listbox")
      .filter({ hasText: providerTitle })
      .getByText(providerTitle, { exact: true })
      .click();
  }

  async fillInstructions(text: string) {
    await this.instructionsTextarea.fill(text);
  }

  async saveAgent() {
    await expect(this.createAgentButton).toBeEnabled();
    await expect(this.modelCombobox).toBeVisible();
    await this.createAgentButton.click();
  }

  async expectAgentInList(name: string) {
    await expect(this.agentNameCell(name).first()).toBeVisible();
  }

  async expectChatOpened() {
    await expect(this.chatInputButtons).toBeVisible();
  }
}

export default AiAgents;

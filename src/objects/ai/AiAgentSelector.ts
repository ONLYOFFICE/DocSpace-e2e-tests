import { expect, Page } from "@playwright/test";

// Side panel for choosing an AI agent, opened by the "Ask AI" file action.
class AiAgentSelector {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get panel() {
    return this.page.getByTestId("ai_agent_selector");
  }

  private get submitButton() {
    return this.panel.getByTestId("selector_submit_button");
  }

  private agentItem(name: string) {
    return this.panel
      .locator('[data-testid^="selector-item-"]')
      .filter({ hasText: name });
  }

  async expectOpened() {
    await expect(this.panel).toBeVisible();
  }

  async selectAgent(name: string) {
    const item = this.agentItem(name);
    await expect(item).toBeVisible();
    await item.click();
  }

  async submit() {
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }

  async selectAgentAndSubmit(name: string) {
    await this.selectAgent(name);
    await this.submit();
  }
}

export default AiAgentSelector;

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

  private get noProvidersNavigationLink() {
    return this.page.getByText(/no providers/i);
  }

  get learnMoreLink() {
    return this.page.getByRole("link", { name: "Learn more" });
  }

  async openDirectly() {
    await this.page.goto(`https://${this.portalDomain}/ai-agents/filter`);
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
}

export default AiAgents;

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

  private get addProviderButton() {
    return this.page.locator('[aria-label="Add AI provider"]');
  }

  get learnMoreLink() {
    return this.page.getByRole("link", { name: "Learn more" });
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/ai-agents/filter`);
  }

  async expectNoProvidersMessage() {
    await expect(this.emptyProvidersHeading).toBeVisible();
  }

  async goToSettings() {
    await this.goToSettingsButton.click();
    await expect(this.addProviderButton).toBeVisible();
  }
}

export default AiAgents;

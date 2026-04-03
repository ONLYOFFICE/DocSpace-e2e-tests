import { expect, Locator, Page } from "@playwright/test";
import BaseDevTools from "./BaseDevTools";

class EmbedSDK extends BaseDevTools {
  constructor(page: Page) {
    super(page);
  }

  get allowedDomainsInput(): Locator {
    return this.page.getByTestId("allowed_domains_text_input");
  }

  get allowedDomainsAddButton(): Locator {
    return this.page.getByTestId("allowed_domains_add_button");
  }

  async open() {
    await this.openDevTools();
    await this.navigateToSection("javascript-sdk");
  }

  async addAllowedDomain(url: string) {
    await this.allowedDomainsInput.fill(url);
    await this.allowedDomainsAddButton.click();
  }

  async checkDomainVisible(url: string) {
    await expect(this.page.getByText(url)).toBeVisible();
  }
}

export default EmbedSDK;

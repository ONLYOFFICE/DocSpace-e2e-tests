import { Locator, Page } from "@playwright/test";
import BaseDevTools from "./BaseDevTools";

class Overview extends BaseDevTools {
  constructor(page: Page) {
    super(page);
  }

  private cardLink(text: string): Locator {
    return this.page.getByTestId("link").filter({ hasText: text });
  }

  get learnMoreLink(): Locator {
    return this.cardLink("Learn more");
  }

  get startEmbeddingLink(): Locator {
    return this.cardLink("Start embedding");
  }

  get readInstructionsLink(): Locator {
    return this.cardLink("Read instructions");
  }

  get createWebhookLink(): Locator {
    return this.cardLink("Create webhook");
  }

  get registerAppLink(): Locator {
    return this.cardLink("Register app");
  }

  get createKeyLink(): Locator {
    return this.cardLink("Create key");
  }

  async open() {
    await this.openDevTools();
    await this.navigateToSection("overview");
  }
}

export default Overview;

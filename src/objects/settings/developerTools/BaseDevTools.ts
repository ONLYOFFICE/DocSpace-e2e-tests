import { Page } from "@playwright/test";
import BasePage from "@/src/objects/common/BasePage";

class BaseDevTools extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openDevTools() {
    await this.navigateToSettings();
    await this.page.getByTestId("dev-tools-bar").click();
    await this.page.waitForLoadState("load");
  }

  async navigateToSection(sectionId: string) {
    const url = new URL(`/developer-tools/${sectionId}`, this.page.url());
    await this.page.goto(url.toString());
    await this.page.waitForLoadState("load");
  }
}

export default BaseDevTools;

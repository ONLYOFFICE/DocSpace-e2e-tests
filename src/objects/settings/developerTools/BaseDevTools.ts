import { expect, Page } from "@playwright/test";
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
    await expect(async () => {
      await this.page.goto(url.toString());
    }).toPass({ timeout: 30000 });
    await this.page.waitForLoadState("load");
  }
}

export default BaseDevTools;

import { expect, Page } from "@playwright/test";

const TOGGLE_INFO_PANEL = "#info-panel-toggle--open";

class MyDocuments {
  page: Page;
  portalDomain: string;

  constructor(page: Page, portalDomain: string) {
    this.page = page;
    this.portalDomain = portalDomain;
  }

  private get toggleInfoPanel() {
    return this.page.locator(TOGGLE_INFO_PANEL);
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/rooms/personal`);

    await this.page.waitForURL(/.*rooms\/personal.*/, {
      waitUntil: "networkidle",
    });
  }

  async openRecentlyAccessibleTab() {
    await this.page.getByText("Recently accessible via link").click();
  }

  async openInfoPanel() {
    await this.toggleInfoPanel.click();
  }
}

export default MyDocuments;

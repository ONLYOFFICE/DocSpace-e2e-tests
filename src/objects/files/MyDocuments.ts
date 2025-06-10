import { expect, Page } from "@playwright/test";

class MyDocuments {
  page: Page;
  portalDomain: string;

  constructor(page: Page, portalDomain: string) {
    this.page = page;
    this.portalDomain = portalDomain;
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/rooms/personal`);
    await this.page.waitForLoadState("load");
    await expect(this.page).toHaveURL(/.*rooms\/personal.*/);
  }

  async openRecentlyAccessibleTab() {
    await this.page.getByText("Recently accessible via link").click();
  }
}

export default MyDocuments;

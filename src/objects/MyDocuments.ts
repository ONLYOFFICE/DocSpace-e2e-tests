import { Page } from "@playwright/test";

class MyDocuments {
  page: Page;

  portalDomain: string;

  constructor(page: Page, portalDomain: string) {
    this.page = page;
    this.portalDomain = portalDomain;
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/rooms/personal`);

    await this.page.waitForURL(/.*rooms\/personal.*/, {
      waitUntil: "networkidle",
    });
  }
}

export default MyDocuments;

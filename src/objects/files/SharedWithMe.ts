import { expect, Page } from "@playwright/test";
import BasePage from "../common/BasePage";

const SHARED_WITH_ME_URL = /shared-with-me/;

class SharedWithMe extends BasePage {
  private portalDomain: string;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/shared-with-me/filter`);
    await this.waitForSharedWithMePage();
  }

  private async waitForSharedWithMePage() {
    await expect(this.page).toHaveURL(SHARED_WITH_ME_URL);
    await this.page.waitForLoadState("domcontentloaded");
  }

  async checkEmptyViewVisible() {
    await expect(this.page.getByTestId("empty-view")).toBeVisible();
  }
}

export default SharedWithMe;

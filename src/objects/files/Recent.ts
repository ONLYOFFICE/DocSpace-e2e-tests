import { expect, Page } from "@playwright/test";
import BasePage from "../common/BasePage";
import FilesEmptyView from "./FilesEmptyView";

const RECENT_NAV_ITEM = "#document_catalog-recent";

class Recent extends BasePage {
  private portalDomain: string;
  filesEmptyView: FilesEmptyView;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
    this.filesEmptyView = new FilesEmptyView(page);
  }

  private async waitForRecentPage() {
    await expect(this.page).toHaveURL(/\/recent\/filter/);
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/recent/filter`);
    await this.waitForRecentPage();
  }

  async openFromNavigation() {
    const navItem = this.page.locator(RECENT_NAV_ITEM);
    await expect(navItem).toBeVisible();
    await navItem.click();
    await this.waitForRecentPage();
  }

  async checkNoRecentFilesTextExist() {
    await expect(
      this.page.getByText("No recent files here yet", { exact: true }),
    ).toBeVisible();
  }
}

export default Recent;

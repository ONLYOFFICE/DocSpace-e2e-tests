import { expect, Page } from "@playwright/test";

const NO_ITEM_TEXT = ".no-item-text";

class InfoPanel {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get noItemText() {
    return this.page.locator(NO_ITEM_TEXT);
  }

  async checkNoItemTextExist() {
    return await expect(this.noItemText).toBeVisible();
  }
}

export default InfoPanel;

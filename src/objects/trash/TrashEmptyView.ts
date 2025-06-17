import { expect, Page } from "@playwright/test";

class TrashEmptyView {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async checkNoDocsTextExist() {
    await expect(this.page.getByText("No docs here yet")).toBeVisible();
  }
}

export default TrashEmptyView;

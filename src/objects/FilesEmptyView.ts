import { expect, Page } from "@playwright/test";

const GOTO_DOCUMENTS_BUTTON = "#empty-view-goto-personal";

class FilesEmptyView {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async checkNoDocsTextExist() {
    await expect(this.page.getByText("No docs here yet")).toBeVisible();
  }

  async checkNoFilesTextExist() {
    await expect(this.page.getByText("No files here yet")).toBeVisible();
  }

  async clickGotoDocumentsButton() {
    await this.page.locator(GOTO_DOCUMENTS_BUTTON).click();
  }
}

export default FilesEmptyView;

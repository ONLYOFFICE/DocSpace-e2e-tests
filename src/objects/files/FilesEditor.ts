import { expect, Page } from "@playwright/test";

class FilesEditor {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected get frame() {
    return this.page.frameLocator('iframe[name="frameEditor"]');
  }

  get docName() {
    return this.frame.locator("#box-doc-name");
  }

  protected get favicon() {
    return this.page.locator("#favicon");
  }

  async waitForLoad() {
    await this.page.waitForSelector('iframe[name="frameEditor"]', {
      state: "attached",
      timeout: 60000,
    });
    await expect(this.docName).toBeVisible({ timeout: 30000 });
  }

  async close() {
    await this.page.close();
  }
}

export default FilesEditor;

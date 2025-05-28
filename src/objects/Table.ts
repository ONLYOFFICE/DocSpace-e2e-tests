import { Page } from "@playwright/test";

class Table {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async openSettings() {
    await this.page
      .locator('[data-iconname*="settings.desc.react.svg"]')
      .click();
  }

  async hideSettings() {
    await this.page.mouse.click(1, 1);
  }

  async hideModified() {
    await this.openSettings();

    // Find the checkbox with "Modified" text
    const modifiedCheckbox = this.page.locator(
      ".table-container_settings-checkbox:has(span:text-is('Modified'))",
    );

    // Check if it's currently checked
    const isChecked = await modifiedCheckbox.locator("input").isChecked();

    // If it's checked, click to uncheck it
    if (isChecked) {
      await modifiedCheckbox.click();
    }

    await this.hideSettings();
  }
}

export default Table;

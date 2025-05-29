import { expect, Page } from "@playwright/test";

const DELETE_BUTTON = "#menu-delete";
const DELETE_BUTTON_SUMBIT = "#delete-file-modal_submit";
const TABLE_LIST_ITEM = ".table-list-item.window-item";

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

  async selectAllRows() {
    const rows = this.page.locator(TABLE_LIST_ITEM);
    const countRows = await rows.count();

    for (let i = 0; i < countRows; i++) {
      await this.page.keyboard.down("Control"); // или 'Meta' на Mac
      await rows.nth(i).click();
      await this.page.keyboard.up("Control");
    }

    return countRows;
  }

  async deleteAllRows() {
    const countRows = await this.selectAllRows();

    if (countRows > 1) {
      await this.page.locator(DELETE_BUTTON).click();
      await this.page.locator(DELETE_BUTTON_SUMBIT).click();
    }

    await expect(this.page.locator(TABLE_LIST_ITEM)).toHaveCount(0);
  }
}

export default Table;

import { expect, Page } from "@playwright/test";

const DELETE_BUTTON = "#menu-delete";
const DELETE_BUTTON_SUMBIT = "#delete-file-modal_submit";
const TABLE_LIST_ITEM = ".table-list-item.window-item";
const SETTINGS_ICON = '[data-iconname*="settings.desc.react.svg"]';
const MODIFIED_CHECKBOX =
  ".table-container_settings-checkbox:has(span:text-is('Modified'))";

class Table {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async openSettings() {
    await this.page.locator(SETTINGS_ICON).click();
  }

  async hideSettings() {
    await this.page.mouse.click(1, 1);
  }

  async hideModified() {
    await this.openSettings();

    // Find the checkbox with "Modified" text
    const modifiedCheckbox = this.page.locator(MODIFIED_CHECKBOX);

    // Check if it's currently checked
    const isChecked = await modifiedCheckbox.locator("input").isChecked();

    // If it's checked, click to uncheck it
    if (isChecked) {
      await modifiedCheckbox.click();
    }

    await this.hideSettings();
  }

  // locators

  private get tableRows() {
    return this.page.locator(TABLE_LIST_ITEM);
  }

  private get deleteButton() {
    return this.page.locator(DELETE_BUTTON);
  }

  private get deleteButtonSubmit() {
    return this.page.locator(DELETE_BUTTON_SUMBIT);
  }

  // methods

  async selectAllRows() {
    const rows = this.tableRows;
    const countRows = await rows.count();

    for (let i = 0; i < countRows; i++) {
      await this.page.keyboard.down("Control"); // or 'Meta' on Mac
      await rows.nth(i).click();
      await this.page.keyboard.up("Control");
    }

    return countRows;
  }

  async deleteAllRows() {
    const countRows = await this.selectAllRows();

    if (countRows > 1) {
      await this.deleteButton.click();
      await this.deleteButtonSubmit.click();
    }

    await expect(this.tableRows).toHaveCount(0);
  }
}

export default Table;

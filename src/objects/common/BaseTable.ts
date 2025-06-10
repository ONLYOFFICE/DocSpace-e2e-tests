import { expect, Locator, Page } from "@playwright/test";

const TABLE_LIST_ITEM = ".table-list-item.window-item";
const SETTINGS_ICON = '[data-iconname*="settings.desc.react.svg"]';

const DELETE_BUTTON = "#menu-delete";
const DELETE_BUTTON_SUMBIT = "#delete-file-modal_submit";

class BaseTable {
  protected table: Locator;
  protected page: Page;

  constructor(table: Locator) {
    this.table = table;
    this.page = table.page();
  }

  private get deleteButton() {
    return this.page.locator(DELETE_BUTTON);
  }

  private get deleteButtonSubmit() {
    return this.page.locator(DELETE_BUTTON_SUMBIT);
  }

  protected get tableRows() {
    return this.table.locator(TABLE_LIST_ITEM);
  }

  async toggleSettings() {
    await this.table.locator(SETTINGS_ICON).click();
  }

  async hideTableColumn(checkboxLocator: Locator) {
    await this.toggleSettings();

    const isChecked = await checkboxLocator.locator("input").isChecked();
    if (isChecked) await checkboxLocator.click();

    await this.toggleSettings();
  }

  async openContextMenuRow(rowLocator: Locator) {
    await expect(rowLocator).toBeVisible();
    await rowLocator.click({ button: "right" });
  }

  async selectAllRows() {
    const rows = this.tableRows;
    const count = await rows.count();
    expect(count > 0).toBeTruthy();

    for (let i = 0; i < count; i++) {
      await this.page.keyboard.down("Control");
      await rows.nth(i).click();
      await this.page.keyboard.up("Control");
    }

    return count;
  }

  async deleteAllRows() {
    const countRows = await this.selectAllRows();
    if (countRows > 1) {
      await this.deleteButton.click();
      await this.deleteButtonSubmit.click();
    }

    await expect(this.tableRows).toHaveCount(0);
  }

  async resetSelect() {
    await this.page.keyboard.press("Escape");
  }
}

export default BaseTable;

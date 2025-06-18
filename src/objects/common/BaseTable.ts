import { expect, Locator, Page } from "@playwright/test";

const TABLE_LIST_ITEM = ".table-list-item.window-item";
const SETTINGS_ICON = '[data-iconname*="settings.desc.react.svg"]';
import { UAParser } from "ua-parser-js";

class BaseTable {
  protected table: Locator;
  protected page: Page;

  constructor(table: Locator) {
    this.table = table;
    this.page = table.page();
  }

  get tableRows() {
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

  async checkTableExist() {
    await expect(this.table).toBeVisible();
  }

  async selectAllRows() {
    const rows = this.tableRows;
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();

    const userAgent = await this.page.evaluate(() => navigator.userAgent);
    const ua = UAParser(userAgent);
    const isMac = ua.os.name?.includes("Mac");
    const modifier = isMac ? "Meta" : "Control";

    for (let i = 0; i < count; i++) {
      await this.page.keyboard.down(modifier);
      await rows.nth(i).click();
      await this.page.keyboard.up(modifier);
    }

    return count;
  }

  async selectRow(title: string) {
    const row = this.tableRows.filter({ hasText: title });
    await row.click();
  }

  async checkRowExist(title: string) {
    const row = this.tableRows.filter({ hasText: title });
    await expect(row).toBeVisible();
  }

  async resetSelect() {
    await this.page.keyboard.press("Escape");
  }

  async openFooterContextMenu() {
    const box = await this.table.boundingBox();
    if (!box) {
      throw new Error("Table not found");
    }

    const clickX = box.x;
    const clickY = box.y + box.height + 50;

    await this.page.mouse.click(clickX, clickY, { button: "right" });
  }
}

export default BaseTable;

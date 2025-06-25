import { expect, Locator, Page } from "@playwright/test";

const TABLE_LIST_ITEM = ".table-list-item.window-item";
const SETTINGS_ICON = '[data-iconname*="settings.desc.react.svg"]';
const TABLE_SETTING_CONTAINER = ".table-container_settings";
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

  get tableSettings() {
    return this.page.locator(TABLE_SETTING_CONTAINER);
  }

  async openSettings() {
    const isSettingsVisible = await this.tableSettings.isVisible();
    if (!isSettingsVisible) {
      await this.table.locator(SETTINGS_ICON).click();
    }
  }

  async closeSettings() {
    const isSettingsVisible = await this.tableSettings.isVisible();
    if (isSettingsVisible) {
      await this.page.mouse.click(1, 1);
    }
  }

  async toggleSettings() {
    await this.table.locator(SETTINGS_ICON).click();
  }

  async hideTableColumn(checkboxLocator: Locator) {
    await this.openSettings();

    const isChecked = await checkboxLocator.locator("input").isChecked();
    if (isChecked) await checkboxLocator.click();

    await this.closeSettings();
  }

  async openContextMenu(title: string) {
    await this.checkRowExist(title);
    const row = await this.getRowByTitle(title);
    await row.click({ button: "right" });
  }

  async openContextMenuRow(row: Locator) {
    await row.waitFor({ state: "visible", timeout: 10000 });
    await row.click({ button: "right" });
  }

  async checkTableExist() {
    await expect(this.table).toBeVisible();
  }

  async selectAllRows() {
    const rows = this.tableRows;
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      await this.page.keyboard.down("Meta");
      await rows.nth(i).click();
      await this.page.keyboard.up("Meta");
    }

    return count;
  }

  async getRowByTitle(title: string) {
    return this.tableRows.filter({
      has: this.page.locator(".table-container_cell").first().getByText(title, {
        exact: true,
      }),
    });
  }
  async selectRow(title: string) {
    const row = await this.getRowByTitle(title);

    if (await row.getByRole("checkbox", { checked: true }).isVisible()) {
      return;
    }

    await expect(row).toBeVisible();
    await row.click();
  }

  async checkRowExist(title: string) {
    const row = await this.getRowByTitle(title);
    await expect(row).toBeVisible();
  }

  async checkRowNotExist(title: string) {
    const row = await this.getRowByTitle(title);
    await expect(row).not.toBeVisible();
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

import { expect, Locator, Page } from "@playwright/test";

const TABLE_CONTAINER = "#table-container";
const TABLE_LIST_ITEM = ".table-list-item.window-item";
const SETTINGS_ICON = '[data-iconname*="settings.desc.react.svg"]';
const TABLE_SETTING_CONTAINER = ".table-container_settings";

export type TBaseTableLocators = {
  tableContainer?: Locator;
  tableRows?: Locator;
};

/* eslint-disable no-unused-vars */
type TMapTableRowsCallback = (
  row: Locator,
  index: number,
) => Promise<void> | void;
/* eslint-enable no-unused-vars */

class BaseTable {
  page: Page;
  tableContainer: Locator;
  tableRows: Locator;

  constructor(page: Page, locators?: TBaseTableLocators) {
    this.page = page;
    this.tableContainer =
      locators?.tableContainer || this.page.locator(TABLE_CONTAINER);
    this.tableRows = locators?.tableRows || this.page.locator(TABLE_LIST_ITEM);

    console.log(this.tableRows);
  }

  get tableSettings() {
    return this.page.locator(TABLE_SETTING_CONTAINER);
  }

  async openSettings() {
    const isSettingsVisible = await this.tableSettings.isVisible();
    if (!isSettingsVisible) {
      await this.tableContainer.locator(SETTINGS_ICON).click();
    }
  }

  async closeSettings() {
    const isSettingsVisible = await this.tableSettings.isVisible();
    if (isSettingsVisible) {
      await this.page.mouse.click(1, 1);
    }
  }

  async toggleSettings() {
    await this.tableContainer.locator(SETTINGS_ICON).click();
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
    await expect(this.tableContainer).toBeVisible();
  }

  async selectAllRows() {
    const rows = this.tableRows;
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();

    await this.mapTableRows(async (row) => {
      await this.page.keyboard.down("Control");
      await row.click();
      await this.page.keyboard.up("Control");
    });

    return count; // TODO: REMOVE IT FROM HERE IN THE FEATURE, FALLBACK
  }

  async mapTableRows(callback: TMapTableRowsCallback) {
    const rows = this.tableRows;
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      await callback(rows.nth(i), i);
    }
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
    const box = await this.tableContainer.boundingBox();
    if (!box) {
      throw new Error("Table not found");
    }

    const clickX = box.x;
    const clickY = box.y + box.height + 50;

    await this.page.mouse.click(clickX, clickY, { button: "right" });
  }
}

export default BaseTable;

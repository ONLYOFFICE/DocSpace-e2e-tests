import { expect, Locator, Page } from "@playwright/test";
import { test } from "@playwright/test";

const TABLE_CONTAINER = "#table-container";
const TABLE_LIST_ITEM = ".table-list-item.window-item";
// const SETTINGS_ICON = 'icon-button-svg';
const TABLE_SETTING_CONTAINER = "settings-block";

export type TBaseTableLocators = {
  tableContainer?: Locator;
  tableRows?: Locator;
};

type TMapTableRowsCallback = (
  row: Locator,
  index: number,
) => Promise<void> | void;

class BaseTable {
  page: Page;
  tableContainer: Locator;
  tableRows: Locator;

  constructor(page: Page, locators?: TBaseTableLocators) {
    this.page = page;
    this.tableContainer =
      locators?.tableContainer || this.page.locator(TABLE_CONTAINER);
    this.tableRows = locators?.tableRows || this.page.locator(TABLE_LIST_ITEM);
  }

  get tableSettings() {
    return this.page.getByTestId(TABLE_SETTING_CONTAINER);
  }

  get settingsButton() {
    return this.page.getByTestId("table-settings-button");
  }

  get checkboxModified() {
    return this.page.getByTestId("table_settings_Modified");
  }

  get firstRow() {
    return this.page.getByTestId("files-cell-name-0");
  }

  get mainMenuCheckbox() {
    return this.page.getByTestId("table_group_menu_checkbox");
  }

  async clickSettingsMenu() {
    await this.settingsButton.click();
  }

  async hideTableColumn() {
    return test.step("Hide table column", async () => {
      await this.clickSettingsMenu();

      const isChecked = await this.checkboxModified.isChecked();
      if (isChecked) await this.checkboxModified.click();

      await this.clickSettingsMenu();
    });
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
    return test.step("Select all rows", async () => {
      await this.firstRow.click();
      await this.mainMenuCheckbox.click();
      await this.mapTableRows(async (row) => {
        await this.expectRowIsChecked(row);
      });
    });
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

  async expectRowIsChecked(row: Locator) {
    await expect(row.getByRole("checkbox", { checked: true })).toBeVisible();
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
    return test.step("Check row exist", async () => {
      const row = await this.getRowByTitle(title);
      await expect(row).toBeVisible();
    });
  }

  async checkRowNotExist(title: string) {
    const row = await this.getRowByTitle(title);
    await expect(row).not.toBeVisible();
  }

  async resetSelect() {
    return test.step("Reset select", async () => {
      await this.mainMenuCheckbox.click();
    });
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

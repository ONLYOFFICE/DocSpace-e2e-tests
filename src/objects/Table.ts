import { expect, Page } from "@playwright/test";

const DELETE_BUTTON = "#menu-delete";
const DELETE_BUTTON_SUMBIT = "#delete-file-modal_submit";
const TABLE_LIST_ITEM = ".table-list-item.window-item";
const SETTINGS_ICON = '[data-iconname*="settings.desc.react.svg"]';
const MODIFIED_CHECKBOX =
  ".table-container_settings-checkbox:has(span:text-is('Modified'))";

const DOCX_FILE_LINK = ".files-item a[title$='.docx']";

class Table {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async toggleSettings() {
    await this.page.locator(SETTINGS_ICON).click();
  }

  async hideModified() {
    const countTableRows = await this.tableRows.count();

    if (countTableRows === 0) {
      return;
    }

    await this.toggleSettings();

    // Find the checkbox with "Modified" text
    const modifiedCheckbox = this.page.locator(MODIFIED_CHECKBOX);

    // Check if it's currently checked
    const isChecked = await modifiedCheckbox.locator("input").isChecked();

    // If it's checked, click to uncheck it
    if (isChecked) {
      await modifiedCheckbox.click();
    }

    await this.toggleSettings();
  }

  private get tableRows() {
    return this.page.locator(TABLE_LIST_ITEM);
  }

  private get deleteButton() {
    return this.page.locator(DELETE_BUTTON);
  }

  private get deleteButtonSubmit() {
    return this.page.locator(DELETE_BUTTON_SUMBIT);
  }

  async selectAllRows() {
    const rows = this.tableRows;
    const countRows = await rows.count();

    expect(countRows > 0).toBeTruthy();

    for (let i = 0; i < countRows; i++) {
      await this.page.keyboard.down("Control"); // or 'Meta' on Mac
      await rows.nth(i).click();
      await this.page.keyboard.up("Control");
    }

    return countRows;
  }

  async resetSelect() {
    await this.page.keyboard.press("Escape");
  }

  async selectDocxFile() {
    const docxFile = this.page.locator(TABLE_LIST_ITEM, {
      has: this.page.locator(DOCX_FILE_LINK),
    });
    await expect(docxFile).toBeVisible();
    await docxFile.click();
  }

  async selectFolderByName(name: string) {
    const folder = this.page.locator(TABLE_LIST_ITEM, {
      hasText: name,
    });
    await expect(folder).toBeVisible();
    await folder.click();
  }

  async openContextMenu() {
    const docxFile = this.page.locator(TABLE_LIST_ITEM, {
      has: this.page.locator(DOCX_FILE_LINK),
    });
    await expect(docxFile).toBeVisible();

    await docxFile.click({ button: "right" });
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

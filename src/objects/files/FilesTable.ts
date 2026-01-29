import { expect, Page } from "@playwright/test";
import BaseTable from "../common/BaseTable";
import { BaseContextMenu } from "../common/BaseContextMenu";
import { initialDocNames } from "@/src/utils/constants/files";

const TABLE_LIST_ITEM = ".table-list-item.window-item";

const DOCX_FILE_LINK = ".files-item [data-document-title$='.docx']";
const PDF_FILE_LINK = ".files-item [data-document-title$='.pdf']";
const MODIFIED_CHECKBOX =
  ".table-container_settings-checkbox:has(span:text-is('Modified'))";
const TABLE_SETTINGS_DROPDOWN = "[data-testid='dropdown'][role='listbox']";
const TABLE_SETTINGS_CHECKBOX_AUTHOR = "[data-testid='table_settings_Author']";
const TABLE_SETTINGS_CHECKBOX_CREATED =
  "[data-testid='table_settings_Created']";
const TABLE_SETTINGS_CHECKBOX_MODIFIED =
  "[data-testid='table_settings_Modified']";
const TABLE_SETTINGS_CHECKBOX_SIZE = "[data-testid='table_settings_Size']";
const TABLE_SETTINGS_CHECKBOX_TYPE = "[data-testid='table_settings_Type']";
const TABLE_HEADER_AUTHOR = "[data-testid='column-Author']";
const TABLE_HEADER_CREATED = "[data-testid='column-Created']";
const TABLE_HEADER_MODIFIED = "[data-testid='column-Modified']";
const TABLE_HEADER_SIZE = "[data-testid='column-Size']";
const TABLE_HEADER_TYPE = "[data-testid='column-Type']";

class FilesTable extends BaseTable {
  contextMenu: BaseContextMenu;

  constructor(page: Page) {
    super(page);
    this.contextMenu = new BaseContextMenu(page);
  }

  private get docxFile() {
    return this.page.locator(TABLE_LIST_ITEM, {
      has: this.page.locator(DOCX_FILE_LINK),
    });
  }

  async selectDocxFile() {
    await expect(this.docxFile).toBeVisible();
    await this.docxFile.click();
  }
  private get pdfFile() {
    return this.page.locator(TABLE_LIST_ITEM, {
      has: this.page.locator(PDF_FILE_LINK),
    });
  }

  async selectPdfFile() {
    await expect(this.pdfFile).toBeVisible();
    await this.pdfFile.click();
  }

  async selectFolderByName(name: string) {
    const folder = this.page.locator(TABLE_LIST_ITEM, { hasText: name });
    await expect(folder).toBeVisible();
    await folder.click();
  }

  async openContextMenu() {
    await this.openContextMenuRow(this.docxFile);
  }

  async openContextMenuForItem(name: string) {
    const item = this.page.locator(TABLE_LIST_ITEM, { hasText: name });
    await expect(item).toBeVisible();
    await this.openContextMenuRow(item);
  }

  async checkInitialDocsExist() {
    await expect(this.tableContainer).toBeVisible();
    const promises = initialDocNames.map((docName) =>
      expect(this.tableContainer.getByText(docName)).toBeVisible(),
    );

    await Promise.all(promises);
  }

  async hideModifiedColumn() {
    await this.hideTableColumn(this.page.locator(MODIFIED_CHECKBOX));
  }

  private get tableSettingsDropdown() {
    return this.page.locator(TABLE_SETTINGS_DROPDOWN, {
      has: this.page.locator(TABLE_SETTINGS_CHECKBOX_AUTHOR),
    });
  }

  private getColumnCheckbox(column: string) {
    switch (column) {
      case "Author":
        return this.page.locator(TABLE_SETTINGS_CHECKBOX_AUTHOR);
      case "Created":
        return this.page.locator(TABLE_SETTINGS_CHECKBOX_CREATED);
      case "Modified":
        return this.page.locator(TABLE_SETTINGS_CHECKBOX_MODIFIED);
      case "Size":
        return this.page.locator(TABLE_SETTINGS_CHECKBOX_SIZE);
      case "Type":
        return this.page.locator(TABLE_SETTINGS_CHECKBOX_TYPE);
      default:
        throw new Error(`Unknown column: ${column}`);
    }
  }

  private getHeaderCell(column: string) {
    switch (column) {
      case "Author":
        return this.page.locator(TABLE_HEADER_AUTHOR);
      case "Created":
        return this.page.locator(TABLE_HEADER_CREATED);
      case "Modified":
        return this.page.locator(TABLE_HEADER_MODIFIED);
      case "Size":
        return this.page.locator(TABLE_HEADER_SIZE);
      case "Type":
        return this.page.locator(TABLE_HEADER_TYPE);
      default:
        throw new Error(`Unknown column: ${column}`);
    }
  }

  async openTableSettings() {
    await this.openTableSettingsDropdown(this.tableSettingsDropdown);
  }

  async closeTableSettings() {
    await this.closeTableSettingsDropdown(this.tableSettingsDropdown);
  }

  async setColumnVisible(column: string) {
    await this.setColumnVisibility(column, true);
  }

  async setColumnVisibility(column: string, visible: boolean) {
    await this.openTableSettings();

    const checkbox = this.getColumnCheckbox(column);
    const isChecked = await checkbox.locator("input").isChecked();

    if (isChecked !== visible) {
      await checkbox.click();
    }

    await this.expectColumnVisibility(column, visible);
  }

  async setColumnNotVisible(column: string) {
    await this.setColumnVisibility(column, false);
  }

  private async expectColumnVisibility(column: string, visible: boolean) {
    const headerCell = this.getHeaderCell(column);
    const enableValue = visible ? "true" : "false";

    await expect(headerCell).toHaveAttribute("data-enable", enableValue);
  }

  async expectColumnVisible(column: string) {
    await this.expectColumnVisibility(column, true);
  }

  async expectColumnNotVisible(column: string) {
    await this.expectColumnVisibility(column, false);
  }
}

export default FilesTable;

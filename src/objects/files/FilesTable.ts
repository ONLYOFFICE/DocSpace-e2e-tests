import { expect, Page } from "@playwright/test";
import BaseTable from "../common/BaseTable";
import { BaseContextMenu } from "../common/BaseContextMenu";
import { initialDocNames } from "@/src/utils/constants/files";

const TABLE_LIST_ITEM = ".table-list-item.window-item";

const DOCX_FILE_LINK = ".files-item a[title$='.docx']";
const PDF_FILE_LINK = ".files-item a[title$='.pdf']";
const MODIFIED_CHECKBOX =
  ".table-container_settings-checkbox:has(span:text-is('Modified'))";

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
}

export default FilesTable;

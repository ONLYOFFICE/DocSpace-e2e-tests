import { expect, Page } from "@playwright/test";
import BaseTable from "../common/BaseTable";
import BaseContenxtMenu from "../common/BaseContextMenu";

const TABLE_LIST_ITEM = ".table-list-item.window-item";

const DOCX_FILE_LINK = ".files-item a[title$='.docx']";
const MODIFIED_CHECKBOX =
  ".table-container_settings-checkbox:has(span:text-is('Modified'))";

const FILES_TABLE = "#table-container";

class FilesTable extends BaseTable {
  contextMenu: BaseContenxtMenu;

  constructor(page: Page) {
    const tableLocator = page.locator(FILES_TABLE);
    super(tableLocator);

    this.contextMenu = new BaseContenxtMenu(page);
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

  async selectFolderByName(name: string) {
    const folder = this.page.locator(TABLE_LIST_ITEM, { hasText: name });
    await expect(folder).toBeVisible();
    await folder.click();
  }

  async openContextMenu() {
    await this.openContextMenuRow(this.docxFile);
  }

  async hideModifiedColumn() {
    await this.hideTableColumn(this.page.locator(MODIFIED_CHECKBOX));
  }
}

export default FilesTable;

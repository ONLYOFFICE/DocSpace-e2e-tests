import { expect, Page, test } from "@playwright/test";
import BaseTable from "../common/BaseTable";
import { BaseContextMenu } from "../common/BaseContextMenu";
import { initialDocNames } from "@/src/utils/constants/files";

const TABLE_LIST_ITEM = "files-cell-name-0";
const TABLE_LIST_ITEM_DOCX = "files-cell-name-4";
const DOCX_FILE_LINK = ".files-item a[title$='.docx']";

class FilesTable extends BaseTable {
  contextMenu: BaseContextMenu;

  constructor(page: Page) {
    super(page);
    this.contextMenu = new BaseContextMenu(page);
  }

  private get docxFile() {
    return this.page.getByTestId(TABLE_LIST_ITEM_DOCX);
  }

  async selectDocxFile() {
    return test.step('Select docx file', async () => {
    await expect(this.docxFile).toBeVisible();
    await this.docxFile.click();
  });
}

  async selectFolderByName(name: string) {
    return test.step('Select folder by name', async () => {
    const folder = this.page.getByTestId(TABLE_LIST_ITEM);
    await expect(folder).toBeVisible();
    await folder.click();
  });
}

  async openContextMenu() {
    return test.step('Open context menu', async () => {
    await this.openContextMenuRow(this.docxFile);
  });
}

  async openContextMenuForItem() {
    return test.step('Open context menu for item', async () => {
    const item = this.page.getByTestId(TABLE_LIST_ITEM);
    await expect(item).toBeVisible();
    await this.openContextMenuRow(item);
  });
}

  async checkInitialDocsExist() {
    return test.step('Check initial docs exist', async () => {
    await expect(this.tableContainer).toBeVisible();
    const promises = initialDocNames.map((docName) =>
      expect(this.tableContainer.getByText(docName)).toBeVisible(),
    );

    await Promise.all(promises);
  });
}
}

export default FilesTable;

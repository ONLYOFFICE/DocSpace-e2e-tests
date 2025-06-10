import { Page } from "@playwright/test";
import BaseTable from "../common/BaseTable";

import BaseContenxtMenu from "../common/BaseContextMenu";

const LAST_ACTIVITY_CHECKBOX =
  ".table-container_settings-checkbox:has(span:text-is('Last activity'))";
const ROOMS_TABLE = "#table-container";

class RoomsTable extends BaseTable {
  contextMenu: BaseContenxtMenu;

  constructor(page: Page) {
    const tableLocator = page.locator(ROOMS_TABLE);
    super(tableLocator);
    this.contextMenu = new BaseContenxtMenu(page);
  }

  async hideLastActivityColumn() {
    await this.hideTableColumn(this.page.locator(LAST_ACTIVITY_CHECKBOX));
  }

  async openContextMenu(title: string) {
    const roomLocator = this.table.getByText(title, {
      exact: true,
    });
    await this.openContextMenuRow(roomLocator);
  }
}

export default RoomsTable;

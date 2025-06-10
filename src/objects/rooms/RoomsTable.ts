import { expect, Page } from "@playwright/test";
import BaseTable from "../common/BaseTable";
import { ROOM_CREATE_TITLES } from "@/src/utils/constants/rooms";
const LAST_ACTIVITY_CHECKBOX =
  ".table-container_settings-checkbox:has(span:text-is('Last activity'))";
const ROOMS_TABLE = "#table-container";

class RoomsTable extends BaseTable {
  constructor(page: Page) {
    const tableLocator = page.locator(ROOMS_TABLE);
    super(tableLocator);
  }

  async hideLastActivityColumn() {
    await this.hideTableColumn(this.page.locator(LAST_ACTIVITY_CHECKBOX));
  }

  async openContextMenu() {
    const publicRoomLocator = this.table.getByText(ROOM_CREATE_TITLES.PUBLIC, {
      exact: true,
    });
    await expect(publicRoomLocator).toBeVisible();
    await this.openContextMenuRow(publicRoomLocator);
  }
}

export default RoomsTable;

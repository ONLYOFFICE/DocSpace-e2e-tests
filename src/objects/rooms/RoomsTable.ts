import { expect, Page } from "@playwright/test";
import BaseTable from "../common/BaseTable";

import BaseContextMenu from "../common/BaseContextMenu";
import {
  TRoomContextMenuOption,
  TTemplateContextMenuOption,
} from "@/src/utils/constants/rooms";

const LAST_ACTIVITY_CHECKBOX =
  ".table-container_settings-checkbox:has(span:text-is('Last activity'))";
const ROOMS_TABLE = "#table-container";

const TABLE_ITEM_PINNED_TO_TOP = ".icons-group.is-pinned";

class RoomsTable extends BaseTable {
  contextMenu: BaseContextMenu;

  constructor(page: Page) {
    const tableLocator = page.locator(ROOMS_TABLE);
    super(tableLocator);
    this.contextMenu = new BaseContextMenu(page);
  }

  async hideLastActivityColumn() {
    await this.hideTableColumn(this.page.locator(LAST_ACTIVITY_CHECKBOX));
  }

  async checkRoomPinnedToTopExist() {
    await expect(this.table.locator(TABLE_ITEM_PINNED_TO_TOP)).toBeVisible();
  }

  async openContextMenu(title: string) {
    const roomLocator = this.table.getByText(title.trim(), {
      exact: true,
    });
    await this.openContextMenuRow(roomLocator);
  }

  async clickContextMenuOption(
    option: TTemplateContextMenuOption | TRoomContextMenuOption,
  ) {
    await this.contextMenu.clickOption(option);
  }

  async checkRoomExist(roomName: string) {
    await expect(this.table.getByText(roomName).first()).toBeVisible({
      timeout: 10000,
    });
  }

  async checkRoomNotExist(roomName: string) {
    await expect(this.table.getByText(roomName)).not.toBeVisible({
      timeout: 10000,
    });
  }
}

export default RoomsTable;

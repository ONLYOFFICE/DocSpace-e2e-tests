import { expect, Page } from "@playwright/test";
import BaseTable from "../common/BaseTable";

import BaseContextMenu from "../common/BaseContextMenu";
import {
  TRoomContextMenuOption,
  TTemplateContextMenuOption,
} from "@/src/utils/constants/rooms";

const LAST_ACTIVITY_CHECKBOX =
  ".table-container_settings-checkbox:has(span:text-is('Last activity'))";

const TABLE_ITEM_PINNED_TO_TOP = ".icons-group.is-pinned";

class RoomsTable extends BaseTable {
  contextMenu: BaseContextMenu;

  constructor(page: Page) {
    super(page);
    this.contextMenu = new BaseContextMenu(page);
  }

  async hideLastActivityColumn() {
    await this.hideTableColumn(this.page.locator(LAST_ACTIVITY_CHECKBOX));
  }

  async checkRoomPinnedToTopExist() {
    await expect(
      this.tableContainer.locator(TABLE_ITEM_PINNED_TO_TOP),
    ).toBeVisible();
  }

  async clickContextMenuOption(
    option: TTemplateContextMenuOption | TRoomContextMenuOption,
  ) {
    await this.contextMenu.clickOption(option);
  }
}

export default RoomsTable;

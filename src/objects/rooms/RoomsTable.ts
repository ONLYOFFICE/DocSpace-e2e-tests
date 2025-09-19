import { expect, Page, test } from "@playwright/test";
import BaseTable from "../common/BaseTable";

import { BaseContextMenu } from "../common/BaseContextMenu";
import {
  TRoomContextMenuOption,
  TTemplateContextMenuOption,
} from "@/src/utils/constants/rooms";

const LAST_ACTIVITY_CHECKBOX = "table_settings_Activity";

const TABLE_ITEM_PINNED_TO_TOP = ".icons-group.is-pinned";

class RoomsTable extends BaseTable {
  contextMenu: BaseContextMenu;

  constructor(page: Page) {
    super(page);
    this.contextMenu = new BaseContextMenu(page);
  }

  async hideLastActivityColumn() {
    return test.step('Hide last activity column', async () => {
      await this.clickSettingsMenu();
  
      const isChecked = await this.page.getByTestId(LAST_ACTIVITY_CHECKBOX).isChecked();
      if (isChecked) await this.page.getByTestId(LAST_ACTIVITY_CHECKBOX).click();
  
      await this.clickSettingsMenu();
      });
    }

  async clickTag(tagValue: string) {
    await this.page.locator(`[data-tag="${tagValue}"]`).click();
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

  async openRoomByName(roomName: string) {
    await this.page.getByRole("link", { name: roomName }).click();
    await this.page.waitForURL(/rooms\/shared\/filter\?folder=/);
  }
}

export default RoomsTable;

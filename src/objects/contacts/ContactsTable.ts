import { expect, Page } from "@playwright/test";
import BaseTable from "../common/BaseTable";
import {
  TContactType,
  TGroupsContextMenuOption,
  TGuestsContextMenuOption,
  TMembersContextMenuOption,
  TOwnerContextMenuOption,
} from "@/src/utils/constants/contacts";
import BaseContextMenu from "../common/BaseContextMenu";

class ContactsTable extends BaseTable {
  contextMenu: BaseContextMenu;
  constructor(page: Page) {
    super(page.locator("#table-container"));
    this.contextMenu = new BaseContextMenu(page);
  }

  async getDisabledBadge(value: string) {
    const row = await this.getRowByTitle(value);
    return row.locator(".disabled-badge");
  }

  async getCountPaidUsers() {
    const countPaidUsers = this.tableRows.filter({
      has: this.page.locator(".paid-badge"),
    });
    const count = await countPaidUsers.count();
    return count - 1; // without current user
  }

  async checkDisabledUserExist(value: string) {
    const disabledBadge = await this.getDisabledBadge(value);
    await expect(disabledBadge).toBeVisible();
  }

  async checkContactType(value: string, type: TContactType) {
    const row = await this.getRowByTitle(value);
    const contactType = row.locator(".table-cell_type");
    await expect(contactType).toContainText(type);
  }

  async clickContextMenuOption(
    option:
      | TMembersContextMenuOption
      | TGroupsContextMenuOption
      | TGuestsContextMenuOption
      | TOwnerContextMenuOption,
  ) {
    await this.contextMenu.clickOption(option);
  }

  async checkEnabledUserExist(value: string) {
    const disabledBadge = await this.getDisabledBadge(value);
    await expect(disabledBadge).not.toBeVisible();
  }
}

export default ContactsTable;

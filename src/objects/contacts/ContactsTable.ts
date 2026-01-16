import { expect, Page } from "@playwright/test";
import BaseTable from "../common/BaseTable";
import {
  TContactType,
  TGroupsContextMenuOption,
  TGuestsContextMenuOption,
  TMembersContextMenuOption,
  TOwnerContextMenuOption,
} from "@/src/utils/constants/contacts";
import { BaseContextMenu } from "../common/BaseContextMenu";

class ContactsTable extends BaseTable {
  contextMenu: BaseContextMenu;
  constructor(page: Page) {
    super(page);
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
    return count;
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

  async selectRow(title: string) {
    const row = await this.getRowByTitle(title);
    await expect(row).toBeVisible();
    const avatar = row.getByTestId("avatar");
    await avatar.click({ force: true });
  }

  async selectGroupRow(title: string) {
    const row = await this.getRowByTitle(title);
    await expect(row).toBeVisible();
    await row.locator(".table-container_cell").first().click({ force: true });
  }

  async selectRowByIndex(index: number) {
    const row = this.tableRows.nth(index);
    await expect(row).toBeVisible();
    const avatar = row.getByTestId("avatar");
    await avatar.click({ force: true });
  }

  async checkEnabledUserExist(value: string) {
    const disabledBadge = await this.getDisabledBadge(value);
    await expect(disabledBadge).not.toBeVisible();
  }
}

export default ContactsTable;

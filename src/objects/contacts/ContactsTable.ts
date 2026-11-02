import { expect, Page } from "@playwright/test";
import BaseTable from "../common/BaseTable";

const ME_LABEL = ".me-label";
const CONTACTS_TABLE_SETTINGS = "table-settings";
const COLUMN_SETTINGS_DROPDOWN = "dropdown";
const COLUMN_SETTING_TYPE = "table_settings_Type";
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

  private get columnSettingsDropdown() {
    return this.page
      .getByTestId(COLUMN_SETTINGS_DROPDOWN)
      .filter({ has: this.page.getByTestId(COLUMN_SETTING_TYPE) });
  }

  // Contacts has its own table settings button ("table-settings"), not the
  // shared "table-settings-button". Checkbox testids are
  // "table_settings_<key>" where the key differs from the label
  // (e.g. "Department" = Group, "Mail" = Email, "AISpending" = AI spending).
  async openColumnSettings() {
    await this.page.getByTestId(CONTACTS_TABLE_SETTINGS).click();
    await expect(this.columnSettingsDropdown).toBeVisible();
  }

  async closeColumnSettings() {
    await this.page.mouse.click(1, 1);
    await expect(this.columnSettingsDropdown).toBeHidden();
  }

  // The checkbox input "checked" state is unreliable, so the caller checks
  // the result in the table itself.
  async toggleColumnSetting(settingTestId: string) {
    await this.openColumnSettings();
    await this.columnSettingsDropdown.getByTestId(settingTestId).click();
    await this.closeColumnSettings();
  }

  // Checks whether a column is offered at all; the other checkboxes prove the
  // list is rendered.
  async expectColumnSettingAvailable(
    settingTestId: string,
    available: boolean,
  ) {
    await this.openColumnSettings();
    const setting = this.columnSettingsDropdown.getByTestId(settingTestId);
    if (available) {
      await expect(setting).toBeVisible();
    } else {
      await expect(setting).toHaveCount(0);
    }
    await this.closeColumnSettings();
  }

  async getDisabledBadge(value: string) {
    const row = await this.getRowByTitle(value);
    return row.locator(".disabled-badge");
  }

  async getRowByNameText(name: string) {
    return this.tableRows.filter({
      has: this.page
        .getByTestId("contacts_users_username_text")
        .filter({ hasText: name }),
    });
  }

  async checkRowExistByNameText(name: string) {
    const row = await this.getRowByNameText(name);
    await expect(row).toBeVisible();
  }

  async checkLdapUserExist() {
    await expect(
      this.page.getByTestId("badge-text").filter({ hasText: "LDAP" }).first(),
    ).toBeVisible();
  }

  async checkNoLdapUser() {
    await expect(
      this.page.getByTestId("badge-text").filter({ hasText: "LDAP" }),
    ).toHaveCount(0);
  }

  async selectRowByNameText(name: string) {
    const row = await this.getRowByNameText(name);
    await expect(row).toBeVisible();
    const avatar = row.getByTestId("avatar");
    await avatar.click({ force: true });
  }

  async openContextMenuByNameText(name: string) {
    const row = await this.getRowByNameText(name);
    await expect(row).toBeVisible();
    await row.click({ button: "right" });
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

  async checkMeLabelVisible(name: string) {
    const row = await this.getRowByNameText(name);
    await expect(row.locator(ME_LABEL)).toBeVisible();
  }
}

export default ContactsTable;

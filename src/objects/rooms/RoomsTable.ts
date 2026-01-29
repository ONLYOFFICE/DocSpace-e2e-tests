import { expect, Page } from "@playwright/test";
import BaseTable from "../common/BaseTable";

import { BaseContextMenu } from "../common/BaseContextMenu";
import {
  TRoomContextMenuOption,
  TTemplateContextMenuOption,
} from "@/src/utils/constants/rooms";

const LAST_ACTIVITY_CHECKBOX =
  ".table-container_settings-checkbox:has(span:text-is('Last activity'))";

const TABLE_ITEM_PINNED_TO_TOP = ".icons-group.is-pinned";
const TABLE_SETTINGS_DROPDOWN = "[data-testid='dropdown'][role='listbox']";
const TABLE_SETTINGS_CHECKBOX_TYPE = "[data-testid='table_settings_Type']";
const TABLE_SETTINGS_CHECKBOX_TAGS = "[data-testid='table_settings_Tags']";
const TABLE_SETTINGS_CHECKBOX_OWNER = "[data-testid='table_settings_Owner']";
const TABLE_SETTINGS_CHECKBOX_ACTIVITY =
  "[data-testid='table_settings_Activity']";
const TABLE_HEADER_NAME = "[data-testid='column-Name']";
const TABLE_HEADER_TYPE = "[data-testid='column-Type']";
const TABLE_HEADER_TAGS = "[data-testid='column-Tags']";
const TABLE_HEADER_OWNER = "[data-testid='column-Owner']";
const TABLE_HEADER_ACTIVITY = "[data-testid='column-Activity']";

class RoomsTable extends BaseTable {
  contextMenu: BaseContextMenu;

  constructor(page: Page) {
    super(page);
    this.contextMenu = new BaseContextMenu(page);
  }

  async hideLastActivityColumn() {
    await this.hideTableColumn(this.page.locator(LAST_ACTIVITY_CHECKBOX));
  }

  private get tableSettingsDropdown() {
    return this.page.locator(TABLE_SETTINGS_DROPDOWN, {
      has: this.page.locator(TABLE_SETTINGS_CHECKBOX_TAGS),
    });
  }

  private getColumnCheckbox(column: string) {
    switch (column) {
      case "Type":
        return this.page.locator(TABLE_SETTINGS_CHECKBOX_TYPE);
      case "Tags":
        return this.page.locator(TABLE_SETTINGS_CHECKBOX_TAGS);
      case "Owner":
        return this.page.locator(TABLE_SETTINGS_CHECKBOX_OWNER);
      case "Last activity":
        return this.page.locator(TABLE_SETTINGS_CHECKBOX_ACTIVITY);
      default:
        throw new Error(`Unknown column: ${column}`);
    }
  }

  private getHeaderCell(column: string) {
    switch (column) {
      case "Name":
        return this.page.locator(TABLE_HEADER_NAME);
      case "Type":
        return this.page.locator(TABLE_HEADER_TYPE);
      case "Tags":
        return this.page.locator(TABLE_HEADER_TAGS);
      case "Owner":
        return this.page.locator(TABLE_HEADER_OWNER);
      case "Last activity":
        return this.page.locator(TABLE_HEADER_ACTIVITY);
      default:
        throw new Error(`Unknown column: ${column}`);
    }
  }

  async openTableSettings() {
    await this.openTableSettingsDropdown(this.tableSettingsDropdown);
  }

  async closeTableSettings() {
    await this.closeTableSettingsDropdown(this.tableSettingsDropdown);
  }

  async setColumnVisible(column: string) {
    await this.setColumnVisibility(column, true);
  }

  async setColumnVisibility(column: string, visible: boolean) {
    await this.openTableSettings();

    const checkbox = this.getColumnCheckbox(column);
    const isChecked = await checkbox.locator("input").isChecked();

    if (isChecked !== visible) {
      await checkbox.click();
    }

    await this.expectColumnVisibility(column, visible);
  }

  async setColumnNotVisible(column: string) {
    await this.setColumnVisibility(column, false);
  }

  private async expectColumnVisibility(column: string, visible: boolean) {
    const headerCell = this.getHeaderCell(column);
    const enableValue = visible ? "true" : "false";
    await expect(headerCell).toHaveAttribute("data-enable", enableValue);
  }

  async expectColumnVisible(column: string) {
    await this.expectColumnVisibility(column, true);
  }

  async expectColumnNotVisible(column: string) {
    await this.expectColumnVisibility(column, false);
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
    await this.page.waitForURL(/rooms\/shared\/.*\/filter\?folder=/);
  }
}

export default RoomsTable;

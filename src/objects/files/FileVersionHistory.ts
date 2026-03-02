import { expect, Page } from "@playwright/test";
import BaseDialog from "../common/BaseDialog";

const VERSION_ROW = '[data-testid^="version_row_"]';
const VERSION_CONTEXT_MENU_BUTTON = '[data-testid="context-menu-button"]';
const VERSION_CONTEXT_MENU =
  ".p-contextmenu.p-component.p-contextmenu-enter-done";

export type TVersionMenuOption =
  | "Open"
  | "Edit comment"
  | "Restore"
  | "Download"
  | "Delete";

class FileVersionHistory extends BaseDialog {
  constructor(page: Page) {
    super(page);
  }

  // Returns all version row elements in the dialog
  get versionItems() {
    return this.dialog.locator(VERSION_ROW);
  }

  // Returns a specific version row by its 1-based index
  getVersionRow(index: number) {
    return this.dialog.locator(`[data-testid="version_row_${index}"]`);
  }

  // Opens the context menu for the version at the given index
  async openVersionContextMenu(index: number) {
    const row = this.getVersionRow(index);
    await row.locator(VERSION_CONTEXT_MENU_BUTTON).click();
  }

  // Opens the context menu for the given version and clicks the specified option
  async clickVersionMenuOption(index: number, option: TVersionMenuOption) {
    await this.openVersionContextMenu(index);
    await this.page
      .locator(VERSION_CONTEXT_MENU)
      .getByText(option, { exact: false })
      .click();
  }

  // Opens the context menu for the given version and verifies which options are visible/hidden.
  // Closes the menu with Escape when done.
  async checkVersionMenuOptions(
    index: number,
    visibleOptions: TVersionMenuOption[],
    notVisibleOptions?: TVersionMenuOption[],
  ) {
    await this.openVersionContextMenu(index);
    const menu = this.page.locator(VERSION_CONTEXT_MENU);
    for (const option of visibleOptions) {
      await expect(menu.getByText(option, { exact: false })).toBeVisible();
    }
    if (notVisibleOptions) {
      for (const option of notVisibleOptions) {
        await expect(
          menu.getByText(option, { exact: false }),
        ).not.toBeVisible();
      }
    }
    await this.page.keyboard.press("Escape");
  }

  // Asserts that the file name is visible in the dialog header
  async checkFileNameVisible(fileName: string) {
    await expect(this.dialog.getByText(fileName)).toBeVisible();
  }

  // Asserts that at least one version row is visible
  async checkVersionsVisible() {
    await expect(this.versionItems.first()).toBeVisible();
  }

  // Returns the total number of version rows
  async getVersionCount() {
    return this.versionItems.count();
  }
}

export default FileVersionHistory;

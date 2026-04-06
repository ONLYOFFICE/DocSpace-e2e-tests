import { expect, Page } from "@playwright/test";
import BaseDialog from "../common/BaseDialog";

const VERSION_ROW = '[data-testid^="version_row_"]';
const VERSION_CONTEXT_MENU_BUTTON = '[data-testid="context-menu-button"]';
const VERSION_CONTEXT_MENU =
  ".p-contextmenu.p-component.p-contextmenu-enter-done";
const VERSION_TEXTAREA = '[data-testid="version_textarea"]';
const VERSION_SAVE_BUTTON = '[data-testid="version_save_button"]';
const VERSION_MENU_OPEN = '[data-testid="open"]';
const VERSION_MENU_EDIT_COMMENT = '[data-testid="edit"]';
const VERSION_MENU_RESTORE = '[data-testid="restore"]';
const VERSION_MENU_DOWNLOAD = '[data-testid="download"]';
const VERSION_MENU_DELETE = '[data-testid="delete"]';

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

  get versionItems() {
    return this.dialog.locator(VERSION_ROW);
  }

  getVersionRow(index: number) {
    return this.dialog.locator(`[data-testid="version_row_${index}"]`);
  }

  async openVersionContextMenu(index: number) {
    const row = this.getVersionRow(index);
    await row.locator(VERSION_CONTEXT_MENU_BUTTON).click();
  }

  private getMenuOptionSelector(option: TVersionMenuOption) {
    switch (option) {
      case "Open":
        return VERSION_MENU_OPEN;
      case "Edit comment":
        return VERSION_MENU_EDIT_COMMENT;
      case "Restore":
        return VERSION_MENU_RESTORE;
      case "Download":
        return VERSION_MENU_DOWNLOAD;
      case "Delete":
        return VERSION_MENU_DELETE;
    }
  }

  async clickVersionMenuOption(index: number, option: TVersionMenuOption) {
    await this.openVersionContextMenu(index);
    const menu = this.page.locator(VERSION_CONTEXT_MENU);
    await menu.locator(this.getMenuOptionSelector(option)).click();
  }

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

  async editComment(index: number, comment: string) {
    await this.openVersionContextMenu(index);
    const menu = this.page.locator(VERSION_CONTEXT_MENU);
    await menu.locator(VERSION_MENU_EDIT_COMMENT).click();
    const textarea = this.page.locator(VERSION_TEXTAREA);
    await expect(textarea).toBeVisible();
    await textarea.click();
    await textarea.fill(comment);
    await this.page.locator(VERSION_SAVE_BUTTON).click();
    await textarea.waitFor({ state: "detached" });
  }

  async getComment(index: number) {
    return this.getVersionRow(index).locator(".version_text").textContent();
  }

  async checkComment(index: number, expectedText: string, timeout = 10000) {
    await expect(async () => {
      const comment = await this.getComment(index);
      expect(comment).toContain(expectedText);
    }).toPass({ timeout });
  }

  async restoreVersion(index: number) {
    await this.openVersionContextMenu(index);
    const menu = this.page.locator(VERSION_CONTEXT_MENU);
    await menu.locator(VERSION_MENU_RESTORE).click();
  }

  async downloadVersion(index: number) {
    await this.openVersionContextMenu(index);
    const menu = this.page.locator(VERSION_CONTEXT_MENU);
    await menu.locator(VERSION_MENU_DOWNLOAD).click();
  }

  async deleteVersion(index: number) {
    await this.openVersionContextMenu(index);
    const menu = this.page.locator(VERSION_CONTEXT_MENU);
    await menu.locator(VERSION_MENU_DELETE).click();

    const confirmButton = this.page.getByRole("button", { name: "Delete" });
    await confirmButton.click();
  }

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

  async checkVersionCount(expected: number, timeout = 30000) {
    await expect(async () => {
      const count = await this.versionItems.count();
      expect(count).toBe(expected);
    }).toPass({ timeout });
  }

  // Returns the revision ID of the earliest (last displayed) version row
  async getEarliestVersionIndex(): Promise<number> {
    const lastRow = this.versionItems.last();
    const testId = await lastRow.getAttribute("data-testid");
    const match = testId?.match(/version_row_(\d+)/);
    return match ? parseInt(match[1]) : 1;
  }
}

export default FileVersionHistory;

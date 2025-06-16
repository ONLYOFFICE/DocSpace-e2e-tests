import { expect, Page } from "@playwright/test";
import ContextMenu from "./BaseContextMenu";

const HEADER_ADD_BUTTON = "#header_add-button";
const BACK_ARROW_ICON =
  ".navigation-arrow-container [data-testid='icon-button']";

// const MOVE_ARCHIVE_BUTTON = "#menu-archive";
// const MOVE_ARCHIVE_BUTTON_SUBMIT = "#shared_move-to-archived-modal_submit";

// const DELETE_BUTTON = "#menu-delete";
// const DELETE_BUTTON_SUBMIT = "#delete-file-modal_submit";

// const actions = {
//   moveToArchive: {
//     button: MOVE_ARCHIVE_BUTTON,
//     submit: MOVE_ARCHIVE_BUTTON_SUBMIT,
//   },
//   delete: {
//     button: DELETE_BUTTON,
//     submit: DELETE_BUTTON_SUBMIT,
//   },
// } as const;

type TAction = {
  button?: string;
  submit?: string;
};
type TActions = Record<string, TAction>;

class BaseNavigation {
  contextMenu: ContextMenu;
  page: Page;
  actions: TActions;

  constructor(page: Page, actions: TActions) {
    this.page = page;
    this.actions = actions;
    this.contextMenu = new ContextMenu(page);
  }

  private get headerAddButton() {
    return this.page.locator(HEADER_ADD_BUTTON);
  }

  private get backArrowIcon() {
    return this.page.locator(BACK_ARROW_ICON);
  }

  async openCreateDropdown() {
    await expect(this.headerAddButton).toBeVisible();
    await this.headerAddButton.click();
    await this.contextMenu.checkContextMenuExists();
  }

  async openCreateDialog() {
    await expect(this.headerAddButton).toBeVisible();
    await this.headerAddButton.click();
  }

  async gotoBack() {
    await expect(this.backArrowIcon).toBeVisible();
    await this.backArrowIcon.click();
  }

  async closeCreateDropdown() {
    await this.contextMenu.close();
  }

  async performAction(action: TAction) {
    if (action?.button) {
      const actionButton = this.page.locator(action.button);
      await expect(actionButton).toBeVisible();
      await actionButton.click();
    } else {
      throw new Error(`Action ${action} not found`);
    }

    if (action?.submit) {
      const actionButtonSubmit = this.page.locator(action.submit);
      await expect(actionButtonSubmit).toBeVisible();
      await actionButtonSubmit.click();
    }
  }
}

export default BaseNavigation;

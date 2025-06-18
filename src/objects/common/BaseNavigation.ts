import { expect, Page } from "@playwright/test";
import ContextMenu from "./BaseContextMenu";

const HEADER_ADD_BUTTON = "#header_add-button";
const BACK_ARROW_ICON =
  ".navigation-arrow-container [data-testid='icon-button']";

type TAction = {
  button: string;
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

  async clickAddButton() {
    await this.headerAddButton.click();
  }

  async gotoBack() {
    await expect(this.backArrowIcon).toBeVisible();
    await this.backArrowIcon.click();
  }

  async closeCreateDropdown() {
    await this.contextMenu.close();
  }

  async openContextMenu() {
    await this.page.locator("#header_optional-button").click();
    await this.contextMenu.checkContextMenuExists();
  }

  async performAction(action: TAction) {
    const actionButton = this.page.locator(action.button);
    await expect(actionButton).toBeVisible();
    await actionButton.click();

    if (action?.submit) {
      const actionButtonSubmit = this.page.locator(action.submit);
      await expect(actionButtonSubmit).toBeVisible();
      await actionButtonSubmit.click();
    }
  }
}

export default BaseNavigation;

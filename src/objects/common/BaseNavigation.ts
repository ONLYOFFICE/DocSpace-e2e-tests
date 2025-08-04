import { expect, Page } from "@playwright/test";
import { BaseContextMenu } from "./BaseContextMenu";

const CLOSE_BUTTON =
  "[data-testid='aside-header'] [data-testid='icon-button-svg']";
const HEADER_ADD_BUTTON = "#header_add-button";
const BACK_ARROW_ICON =
  ".navigation-arrow-container [data-testid='icon-button']";

type TAction = {
  button: string;
  submit?: string;
};
type TActions = Record<string, TAction>;

class BaseNavigation {
  contextMenu: BaseContextMenu;
  protected page: Page;
  protected actions: TActions;

  constructor(page: Page, actions: TActions) {
    this.page = page;
    this.actions = actions;
    this.contextMenu = new BaseContextMenu(page);
  }

  private get headerAddButton() {
    return this.page.locator(HEADER_ADD_BUTTON);
  }

  private get backArrowIcon() {
    return this.page.locator(BACK_ARROW_ICON);
  }

  private get closeButton() {
    return this.page.locator(CLOSE_BUTTON);
  }

  private get selectAllCheckbox() {
    return this.page.locator("#menu-checkbox_selected-all-file");
  }

  async openCreateDropdown() {
    await expect(this.headerAddButton).toBeVisible();
    await expect(async () => {
      await this.clickAddButton();
      await this.contextMenu.checkMenuExists(500);
    }).toPass();
  }

  async clickAddButton() {
    await this.headerAddButton.click();
  }

  async clickSelectAllCheckbox() {
    await expect(this.selectAllCheckbox).toBeVisible();
    await this.selectAllCheckbox.click();
  }

  async gotoBack() {
    await expect(this.backArrowIcon).toBeVisible();
    await this.backArrowIcon.click();
  }

  async closeContextMenu() {
    await this.contextMenu.close();
  }

  async closePanel() {
    await expect(this.closeButton).toBeVisible();
    await this.closeButton.click();
  }

  async openContextMenu() {
    await this.page.locator("#header_optional-button").click();
    await this.contextMenu.checkMenuExists();
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

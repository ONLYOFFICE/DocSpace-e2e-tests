import { expect, Locator, Page } from "@playwright/test";
import ContextMenu from "./BaseContextMenu";

const HEADER_ADD_BUTTON = "#header_add-button";
const BACK_ARROW_ICON =
  ".navigation-arrow-container [data-testid='icon-button']";

class BaseNavigation {
  contextMenu: ContextMenu;
  page: Page;

  constructor(page: Page) {
    this.page = page;
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
}

export default BaseNavigation;

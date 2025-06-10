import { expect, Page, Locator } from "@playwright/test";

const CONTEXT_MENU = ".p-contextmenu.p-component.p-contextmenu-enter-done";
const CONTEXT_SUBMENU = ".p-submenu-list";
const MENU_ITEM = "li.p-menuitem";

class BaseContextMenu {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get contextMenu() {
    return this.page.locator(CONTEXT_MENU);
  }

  get contextSubmenu() {
    return this.page.locator(CONTEXT_SUBMENU);
  }

  get menuItem() {
    return this.page.locator(MENU_ITEM);
  }

  async checkContextMenuExists() {
    await expect(this.contextMenu).toBeVisible();
  }

  async close() {
    this.page.mouse.click(1, 1);
    await expect(this.contextMenu).not.toBeVisible();
  }

  private async getMenuItem(menuRoot: Locator, text: string) {
    const menuItem = menuRoot.getByText(text, { exact: true });
    await expect(menuItem).toBeVisible();
    return menuItem;
  }

  async hoverOption(text: string, isSubmenu = false) {
    const root = isSubmenu ? this.contextSubmenu : this.contextMenu;
    const item = await this.getMenuItem(root, text);
    await item.hover();
  }

  async clickOption(text: string, isSubmenu = false) {
    const root = isSubmenu ? this.contextSubmenu : this.contextMenu;
    const item = await this.getMenuItem(root, text);
    await item.click();
  }
}

export default BaseContextMenu;

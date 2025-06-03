import { expect, Page } from "@playwright/test";

const CONTEXT_MENU = ".p-contextmenu.p-component.p-contextmenu-enter-done";
const CONTEXT_SUBMENU = ".p-submenu-list.p-contextmenusub-enter-done";
const MENU_ITEM = "li.p-menuitem";

class ContextMenu {
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

  async selectOption(menuItemText: string) {
    const menuItem = this.contextMenu.getByText(menuItemText, { exact: true });
    await expect(menuItem).toBeVisible();
    await menuItem.click();
  }
}

export default ContextMenu;

import { expect, Page, Locator } from "@playwright/test";

const CONTEXT_MENU = ".p-contextmenu.p-component.p-contextmenu-enter-done";
const CONTEXT_SUBMENU = ".p-submenu-list";

const DROPDOWN_MENU = ".dropdown-container";

export type MenuItemSelector = {
  type: "text" | "id" | "data-testid" | "class";
  value: string;
  exact?: boolean;
};

class BaseContextMenu {
  page: Page;
  menu: Locator;
  submenu: Locator;

  constructor(page: Page, isDropdown = false) {
    this.page = page;
    this.menu = isDropdown
      ? page.locator(DROPDOWN_MENU)
      : page.locator(CONTEXT_MENU);

    this.submenu = page.locator(CONTEXT_SUBMENU);
  }

  async checkContextMenuExists() {
    await expect(this.menu).toBeVisible();
  }

  async close() {
    await this.page.mouse.click(1, 1);
    await this.page.waitForTimeout(100);

    await this.page.waitForFunction(
      () =>
        // eslint-disable-next-line no-undef
        document.querySelectorAll(
          ".p-contextmenu.p-component.p-contextmenu-enter-done",
        ).length === 0,
    );
  }

  private async getMenuItem(
    menuRoot: Locator,
    selector: MenuItemSelector | string,
  ) {
    let menuItem: Locator;

    if (typeof selector === "string") {
      // Backward compatibility - treat string as text selector
      menuItem = menuRoot.getByText(selector, { exact: true });
    } else {
      switch (selector.type) {
        case "text":
          menuItem = menuRoot.getByText(selector.value, {
            exact: selector.exact ?? true,
          });
          break;
        case "id":
          menuItem = menuRoot.locator(`#${selector.value}`);
          break;
        case "data-testid":
          menuItem = menuRoot.locator(`[data-testid="${selector.value}"]`);
          break;
        case "class":
          menuItem = menuRoot.locator(`.${selector.value}`);
          break;
        default:
          throw new Error(`Unsupported selector type: ${selector}`);
      }
    }

    await expect(menuItem).toBeVisible();
    return menuItem;
  }

  async hoverOption(selector: MenuItemSelector | string, isSubmenu = false) {
    const root = isSubmenu ? this.submenu : this.menu;
    const item = await this.getMenuItem(root, selector);
    await item.hover();
  }

  async clickOption(selector: MenuItemSelector | string, isSubmenu = false) {
    const root = isSubmenu ? this.submenu : this.menu;
    const item = await this.getMenuItem(root, selector);
    await item.click();
  }

  async clickSubmenuOption(
    parentSelector: MenuItemSelector | string,
    childSelector: MenuItemSelector | string,
  ) {
    await this.hoverOption(parentSelector);
    const child = await this.getMenuItem(this.submenu, childSelector);
    await child.click();
  }
}

export default BaseContextMenu;

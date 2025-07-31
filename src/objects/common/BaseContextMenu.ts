import { Page, Locator } from "@playwright/test";
import { BaseMenu } from "./BaseMenu";

const CONTEXT_MENU = ".p-contextmenu.p-component.p-contextmenu-enter-done";
const CONTEXT_SUBMENU = ".p-submenu-list";

export type TContextMenuLocators = {
  menu: Locator;
  submenu?: Locator;
};

export class BaseContextMenu extends BaseMenu {
  constructor(page: Page, locators?: TContextMenuLocators) {
    const menu = locators?.menu ?? page.locator(CONTEXT_MENU);
    const submenu = locators?.submenu ?? page.locator(CONTEXT_SUBMENU);
    super(page, menu, submenu);
  }
}

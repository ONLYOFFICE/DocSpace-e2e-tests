import { Page } from "@playwright/test";
import { TContextMenuLocators } from "./BaseContextMenu";
import { BaseMenu } from "./BaseMenu";

const DROPDOWN_MENU = ".dropdown-container";
const CONTEXT_SUBMENU = ".p-submenu-list";

export class BaseDropdown extends BaseMenu {
  constructor(page: Page, locators?: TContextMenuLocators) {
    super(
      page,
      locators?.menu ?? page.locator(DROPDOWN_MENU),
      locators?.submenu ?? page.locator(CONTEXT_SUBMENU),
    );
  }
}

import { Page } from "@playwright/test";
import BaseNavigation from "../common/BaseNavigation";
import BaseContextMenu from "../common/BaseContextMenu";

const navActions = {
  invite: {
    button: "#menu-invite",
    submit: "#send-inite-again-modal_submit",
  },
  delete: {
    button: "#menu-disable",
    submit: "#change-user-status-modal_submit",
  },
} as const;

class ContactsNavigation extends BaseNavigation {
  contextMenu: BaseContextMenu;

  constructor(page: Page) {
    super(page, navActions);
    this.contextMenu = new BaseContextMenu(page);
  }

  private async ensureHeaderMenuOpen() {
    const isVisible = await this.contextMenu.contextMenu.isVisible();
    if (!isVisible) {
      await this.openHeaderMenu();
    }
  }

  async delete() {
    await this.performAction(navActions.delete);
  }

  async clickHeaderSubmenuOption(parentText: string, childText: string) {
    await this.ensureHeaderMenuOpen();
    await this.contextMenu.clickSubmenuOption(parentText, childText);
  }

  async openHeaderMenu() {
    await this.clickAddButton();
  }

  async openHeaderSubmenu(parentText: string) {
    await this.ensureHeaderMenuOpen();
    await this.contextMenu.hoverOption(parentText);
  }
}

export default ContactsNavigation;

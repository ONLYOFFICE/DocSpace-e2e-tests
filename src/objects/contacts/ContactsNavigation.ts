import { Page } from "@playwright/test";
import BaseNavigation from "../common/BaseNavigation";

const navActions = {
  invite: {
    button: "#menu-invite",
    submit: "#send-inite-again-modal_submit",
  },
  disable: {
    button: "#menu-disable",
    submit: "#change-user-status-modal_submit",
  },
  enable: {
    button: "#menu-enable",
    submit: "#change-user-status-modal_submit",
  },
  delete: {
    button: "#menu-delete",
    submit: ".modal-footer .delete-button",
  },
  changeType: {
    button: "#menu-change-type",
  },
  createGroup: {
    button: "#create_group",
  },
  deleteGroup: {
    button: "#menu-delete",
    submit: "#group-modal_delete",
  },
} as const;

class ContactsNavigation extends BaseNavigation {
  constructor(page: Page) {
    super(page, navActions);
  }

  private async ensureHeaderMenuOpen() {
    const isVisible = await this.contextMenu.menu.isVisible();
    if (!isVisible) {
      await this.openHeaderMenu();
    }
  }
  async disable() {
    await this.performAction(navActions.disable);
  }

  async enable() {
    await this.performAction(navActions.enable);
  }

  async deleteGroup() {
    await this.performAction(navActions.deleteGroup);
  }

  async openDialog(action: keyof typeof navActions) {
    await this.performAction({ button: navActions[action].button });
  }

  async openChangeTypeDropdown() {
    await this.performAction({ button: navActions.changeType.button });
  }

  async openCreateGroupDialog() {
    await this.openCreateDropdown();
    await this.contextMenu.clickOption({
      type: "id",
      value: "create_group",
    });
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

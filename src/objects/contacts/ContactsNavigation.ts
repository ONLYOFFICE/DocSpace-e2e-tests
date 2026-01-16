import { Page } from "@playwright/test";
import BaseNavigation from "../common/BaseNavigation";
import { headerInviteIds } from "@/src/utils/constants/contacts";

export const navActions = {
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
    button: "#create-group-option",
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
    if (!(await this.contextMenu.menu.isVisible())) {
      await this.openHeaderMenu();
      await this.contextMenu.menu.waitFor({ state: "visible" });
    }
  }

  async openDialog(action: keyof typeof navActions) {
    await this.performAction({ button: navActions[action].button });
  }

  async openChangeTypeDropdown() {
    await this.performAction({ button: navActions.changeType.button });
  }

  async openCreateGroupDialog() {
    await this.performAction({ button: navActions.createGroup.button });
  }

  async clickHeaderSubmenuOption(_parentText: string, childText: string) {
    await this.ensureHeaderMenuOpen();

    const idByText: Record<string, string> = {
      "DocSpace admin": headerInviteIds.docspaceAdmin,
      "Room admin": headerInviteIds.roomAdmin,
      User: headerInviteIds.user,
    };

    const id = idByText[childText];
    if (!id) throw new Error(`Unknown header item: ${childText}`);

    await this.contextMenu.clickOption({ type: "id", value: id });
  }

  async openHeaderMenu() {
    await this.clickAddButton();
  }
}

export default ContactsNavigation;

import { expect, Page } from "@playwright/test";

import BaseDialog from "../common/BaseDialog";
import BaseFilter from "../common/BaseFilter";
import ContactsArticle from "./ContactsArticle";
import ContactsNavigation from "./ContactsNavigation";
import {
  ADMIN_OWNER_NAME,
  contactsActionsMenu,
  GROUP_NAME,
  groupsContextMenuOption,
  ownerContextMenuOption,
  TContactType,
  TInviteResponseData,
  TUserEmail,
  userEmails,
} from "@/src/utils/constants/contacts";
import BaseContextMenu, { MenuItemSelector } from "../common/BaseContextMenu";
import ContactsInfoPanel from "./ContactsInfoPanel";
import ContactsInviteDialog from "./ContactsInviteDialog";
import ContactsTable from "./ContactsTable";
import ContactsReassignmentDialog from "./ContactsReassignmentDialog";
import ContactsGroupDialog from "./ContactsGroupDialog";

class Contacts {
  private page: Page;
  private portalDomain: string;
  private userIds: Record<TUserEmail, string> = {} as Record<
    TUserEmail,
    string
  >;

  private contextMenu: BaseContextMenu;
  dialog: BaseDialog;
  filter: BaseFilter;

  article: ContactsArticle;
  navigation: ContactsNavigation;
  infoPanel: ContactsInfoPanel;
  inviteDialog: ContactsInviteDialog;
  table: ContactsTable;
  reassignmentDialog: ContactsReassignmentDialog;
  groupDialog: ContactsGroupDialog;

  constructor(page: Page, portalDomain: string) {
    this.page = page;
    this.portalDomain = portalDomain;

    this.table = new ContactsTable(page);
    this.dialog = new BaseDialog(page);
    this.filter = new BaseFilter(page);
    this.infoPanel = new ContactsInfoPanel(page);
    this.article = new ContactsArticle(page);
    this.navigation = new ContactsNavigation(page);
    this.contextMenu = new BaseContextMenu(page);
    this.inviteDialog = new ContactsInviteDialog(page);
    this.reassignmentDialog = new ContactsReassignmentDialog(page);
    this.groupDialog = new ContactsGroupDialog(page);
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/accounts/people`, {
      waitUntil: "load",
    });
    await expect(this.page).toHaveURL(/.*accounts\/people.*/);
  }

  async openTab(tab: "Members" | "Groups" | "Guests") {
    const tabLocator = this.page.locator("span").filter({ hasText: tab });
    await expect(tabLocator).toBeVisible();
    await tabLocator.click();
    await this.page.waitForResponse(
      (response) =>
        response.url().includes("/settings") &&
        response.status() === 200 &&
        response.request().method() === "GET",
    );
  }

  async openSubmenu(source: "header" | "table" | "article") {
    switch (source) {
      case "header":
        await this.navigation.openHeaderSubmenu(
          contactsActionsMenu.invite.label,
        );
        break;
      case "table":
        {
          await this.table.openFooterContextMenu();
          await this.contextMenu.hoverOption(contactsActionsMenu.invite.label);
        }
        break;
      case "article":
        await this.article.openInviteSubmenu();
        break;
    }
  }

  async waitForInviteResponse(userEmail: string) {
    return this.page.waitForResponse(async (response) => {
      if (
        response.url().includes("people") &&
        response.status() === 200 &&
        response.request().method() === "GET"
      ) {
        const data: TInviteResponseData = await response.json();
        if (!data.response) return false;
        try {
          return data.response.email === userEmail;
        } catch {
          return false;
        }
      }
      return false;
    });
  }

  async inviteUsers() {
    for (const [access, value] of Object.entries(
      contactsActionsMenu.invite.submenu,
    )) {
      if (value === contactsActionsMenu.invite.submenu.inviteAgain) continue;
      const userEmail = userEmails[access as keyof typeof userEmails];
      await this.inviteUser(userEmail, value);
    }
  }

  async checkWarningDialog() {
    await this.dialog.checkDialogTitleExist("Warning");
    await this.dialog.close();
  }

  async inviteUser(userEmail: TUserEmail, userType: TContactType) {
    await this.navigation.clickHeaderSubmenuOption(
      contactsActionsMenu.invite.label,
      userType,
    );
    await this.inviteDialog.checkAccessSelectionExist(userType);

    await this.inviteDialog.fillSearchInviteInput(userEmail);
    await this.inviteDialog.checkUserExist(userEmail);
    await this.inviteDialog.clickAddUserToInviteList(userEmail);
    await this.inviteDialog.checkAddedUserExist(userEmail);
    const response = this.waitForInviteResponse(userEmail);
    await this.inviteDialog.submitInviteDialog();
    await this.table.checkRowExist(userEmail);
    const responseData = await response;
    const data: TInviteResponseData = await responseData.json();
    this.userIds[userEmail] = data.response.id;

    const countPaidUsers = await this.table.getCountPaidUsers();

    if (countPaidUsers === 2) {
      await this.checkWarningDialog();
    }
  }

  async openChangeContactTypeDialog(user: string, menuItem: MenuItemSelector) {
    await this.table.selectRow(user);
    await this.navigation.openChangeTypeDropdown();
    await this.navigation.dropdownMenu.clickOption(menuItem);
    await this.dialog.checkDialogTitleExist("Change contact type");
  }

  async openChangeOwnerDialog() {
    await this.table.openContextMenu(ADMIN_OWNER_NAME);
    await this.table.clickContextMenuOption(ownerContextMenuOption.changeOwner);
    await this.dialog.checkDialogTitleExist("Change owner");
  }

  async openChangeNameDialog() {
    await this.table.openContextMenu(ADMIN_OWNER_NAME);
    await this.table.clickContextMenuOption(ownerContextMenuOption.changeName);
    await this.dialog.checkDialogTitleExist("Change name");
  }

  async openChangeEmailDialog() {
    await this.table.openContextMenu(ADMIN_OWNER_NAME);
    await this.table.clickContextMenuOption(ownerContextMenuOption.changeEmail);
    await this.dialog.checkDialogTitleExist("Change email");
  }

  async openDeleteGroupDialog() {
    await this.table.openContextMenu(GROUP_NAME);
    await this.table.clickContextMenuOption(groupsContextMenuOption.delete);
    await this.dialog.checkDialogTitleExist("Delete group");
  }

  async openChangePasswordDialog() {
    await this.table.openContextMenu(ADMIN_OWNER_NAME);
    await this.table.clickContextMenuOption(
      ownerContextMenuOption.changePassword,
    );
    await this.dialog.checkDialogTitleExist("Change password");
  }

  async openChooseFromList() {
    const chooseFromListButton = this.page
      .locator(".selector-add-button")
      .filter({
        hasText: "Choose from list",
      });
    await expect(chooseFromListButton).toBeVisible();
    await chooseFromListButton.click();
  }

  async submitChangeContactTypeDialog() {
    await this.page.locator("#change-user-type-modal_submit").click();
  }

  async selectAllContacts() {
    await this.table.tableRows.nth(1).click(); // second row
    await this.navigation.clickSelectAllCheckbox();
  }

  async closeMenu() {
    await this.contextMenu.close();
  }

  async checkEmptyGroupsExist() {
    await expect(this.page.getByText("No groups here")).toBeVisible();
  }

  async checkEmptyGuestsExist() {
    await expect(this.page.getByText("No added guests yet")).toBeVisible();
  }
}

export default Contacts;

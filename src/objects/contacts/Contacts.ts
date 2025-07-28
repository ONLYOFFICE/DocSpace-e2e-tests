import { waitForGetPeopleResponse } from "./api/index";
import { expect, Page } from "@playwright/test";

import BaseDialog from "../common/BaseDialog";
import ContactsArticle from "./ContactsArticle";
import ContactsNavigation, { navActions } from "./ContactsNavigation";
import {
  ADMIN_OWNER_NAME,
  contactsActionsMenu,
  GROUP_NAME,
  groupsContextMenuOption,
  membersContextMenuOption,
  ownerContextMenuOption,
  TContactsContextMenuOption,
  TContactType,
  toastMessages,
  TUserEmail,
  userEmails,
} from "@/src/utils/constants/contacts";
import { BaseContextMenu } from "../common/BaseContextMenu";
import { BaseContextMenu } from "../common/BaseContextMenu";
import ContactsInfoPanel from "./ContactsInfoPanel";
import ContactsInviteDialog from "./ContactsInviteDialog";
import ContactsTable from "./ContactsTable";
import ContactsReassignmentDialog from "./ContactsReassignmentDialog";
import ContactsGroupDialog from "./ContactsGroupDialog";
import { TMenuItem } from "../common/BaseMenu";
import { BaseDropdown } from "../common/BaseDropdown";
import BasePage from "../common/BasePage";
import ContactsFilter from "./ContactsFilter";

class Contacts extends BasePage {
  private portalDomain: string;

  private contextMenu: BaseContextMenu;
  dialog: BaseDialog;
  peopleFilter: ContactsFilter;
  groupsFilter: ContactsFilter;

  article: ContactsArticle;
  navigation: ContactsNavigation;
  infoPanel: ContactsInfoPanel;
  inviteDialog: ContactsInviteDialog;
  table: ContactsTable;
  reassignmentDialog: ContactsReassignmentDialog;
  groupDialog: ContactsGroupDialog;
  changeContactTypeDropdown: BaseDropdown;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;

    this.table = new ContactsTable(page);
    this.dialog = new BaseDialog(page);
    this.peopleFilter = new ContactsFilter(page);
    this.groupsFilter = new ContactsFilter(page, true);
    this.infoPanel = new ContactsInfoPanel(page);
    this.article = new ContactsArticle(page);
    this.navigation = new ContactsNavigation(page);
    this.contextMenu = new BaseContextMenu(page);
    this.inviteDialog = new ContactsInviteDialog(page);
    this.reassignmentDialog = new ContactsReassignmentDialog(page);
    this.groupDialog = new ContactsGroupDialog(page);
    this.changeContactTypeDropdown = new BaseDropdown(page, {
      menu: this.page.getByText("DocSpace adminPaidRoom"),
    });
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/accounts/people`, {
      waitUntil: "load",
    });
    await expect(this.page).toHaveURL(/.*accounts\/people.*/);
  }

  private async performContactAction(
    actionType: keyof typeof navActions,
    source: "header" | "table" = "header",
    contextMenuOption: TContactsContextMenuOption,
    toastMessage: string,
  ) {
    switch (source) {
      case "header":
        await this.navigation.performAction(navActions[actionType]);
        break;
      case "table":
        await this.table.clickContextMenuOption(contextMenuOption);
        await this.page.locator(navActions[actionType].button).click();
        break;
    }
    await this.removeToast(toastMessage);
  }

  async deleteUser(source: "header" | "table" = "header") {
    await this.performContactAction(
      "delete",
      source,
      membersContextMenuOption.delete,
      toastMessages.changesSaved,
    );
  }

  async disableUser(source: "header" | "table" = "header") {
    await this.performContactAction(
      "disable",
      source,
      membersContextMenuOption.disable,
      toastMessages.userStatusChanged,
    );
  }

  async enableUser(source: "header" | "table" = "header") {
    await this.performContactAction(
      "enable",
      source,
      membersContextMenuOption.enable,
      toastMessages.userStatusChanged,
    );
  }

  async deleteGroup(source: "header" | "table" = "header") {
    await this.performContactAction(
      "deleteGroup",
      source,
      groupsContextMenuOption.delete,
      toastMessages.groupDeleted,
    );
  }

  async deleteGuest(source: "header" | "table" = "header") {
    await this.performContactAction(
      "delete",
      source,
      membersContextMenuOption.delete,
      toastMessages.guestDeleted,
    );
  }

  async enableGuest(source: "header" | "table" = "header") {
    await this.performContactAction(
      "enable",
      source,
      membersContextMenuOption.enable,
      toastMessages.guestStatusChanged,
    );
  }

  async disableGuest(source: "header" | "table" = "header") {
    await this.performContactAction(
      "disable",
      source,
      membersContextMenuOption.disable,
      toastMessages.guestStatusChanged,
    );
  }

  async openTab(tab: "Members" | "Groups" | "Guests") {
    const tabLocator = this.page.locator("span").filter({ hasText: tab });
    await expect(tabLocator).toBeVisible();
    await tabLocator.click();
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

  async checkWarningDialog() {
    await this.dialog.checkDialogTitleExist("Warning");
    await this.dialog.close();
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
    const promise = waitForGetPeopleResponse(this.page);
    await this.inviteDialog.submitInviteDialog();
    await promise;
    await this.table.checkRowExist(userEmail);

    const countPaidUsers = await this.table.getCountPaidUsers();

    if (countPaidUsers === 2) {
      await this.checkWarningDialog();
    }
    await this.removeToast(toastMessages.usersInvited);
  }

  async openChangeContactTypeDialog(user: string, menuItem: TMenuItem) {
  async openChangeContactTypeDialog(user: string, menuItem: TMenuItem) {
    await this.table.selectRow(user);
    await this.navigation.openChangeTypeDropdown();
    await this.changeContactTypeDropdown.clickOption(menuItem);
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
    await this.removeToast(toastMessages.userTypeChanged);
  }

  async selectAllContacts() {
    await this.table.selectRowByIndex(1); // second row
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

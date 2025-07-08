import { test, Page } from "@playwright/test";

import API from "@/src/api";
import Login from "@/src/objects/common/Login";
import Screenshot from "@/src/objects/common/Screenshot";
import Contacts from "@/src/objects/contacts/Contacts";
import {
  ADMIN_OWNER_NAME,
  contactsActionsMenu,
  contactTypes,
  GROUP_NAME,
  groupsContextMenuOption,
  guestsContextMenuOption,
  membersContextMenuOption,
  menuItemChangeUserType,
  userEmails,
} from "@/src/utils/constants/contacts";

test.describe(() => {
  let api: API;
  let page: Page;

  let login: Login;
  let screenshot: Screenshot;
  let contacts: Contacts;

  test.beforeAll(async ({ playwright, browser }) => {
    const apiContext = await playwright.request.newContext();
    api = new API(apiContext);
    await api.setup();
    console.log(api.portalDomain);

    page = await browser.newPage();

    await page.addInitScript(() => {
      globalThis.localStorage?.setItem("integrationUITests", "true");
    });

    login = new Login(page, api.portalDomain);
    contacts = new Contacts(page, api.portalDomain);
    screenshot = new Screenshot(page, { screenshotDir: "contacts" });
    await login.loginToPortal();
    await contacts.open();
  });

  test("Contacts", async () => {
    await test.step("EmptyView", async () => {
      await contacts.table.checkRowExist(ADMIN_OWNER_NAME);
      await screenshot.expectHaveScreenshot("empty_view_members");

      await contacts.table.openSettings();
      await screenshot.expectHaveScreenshot(
        "empty_view_members_table_settings",
      );
      await contacts.table.closeSettings();

      await contacts.openTab("Groups");
      await contacts.checkEmptyGroupsExist();
      await screenshot.expectHaveScreenshot("empty_view_groups");

      await contacts.openTab("Guests");
      await contacts.checkEmptyGuestsExist();
      await screenshot.expectHaveScreenshot("empty_view_guests");
    });

    await test.step("ActionsMenu", async () => {
      await contacts.openTab("Members");
      await contacts.table.checkRowExist(ADMIN_OWNER_NAME);
      await contacts.openSubmenu("article");
      await screenshot.expectHaveScreenshot("actions_menu_article");
      await contacts.closeMenu();

      await contacts.openSubmenu("header");
      await screenshot.expectHaveScreenshot("actions_menu_header");

      await contacts.openSubmenu("table");
      await screenshot.expectHaveScreenshot("actions_menu_table");
    });

    await test.step("InviteUsers", async () => {
      const invite = contactsActionsMenu.invite;

      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.roomAdmin,
      );
      await contacts.inviteDialog.checkAccessSelectionExist(
        invite.submenu.roomAdmin,
      );
      await contacts.inviteDialog.openAccessOptions();
      await screenshot.expectHaveScreenshot("invite_users_dialog");
      await contacts.inviteDialog.selectAccessOption(invite.submenu.roomAdmin);

      await contacts.inviteDialog.fillSearchInviteInput(userEmails.roomAdmin);
      await contacts.inviteDialog.checkUserExist(userEmails.roomAdmin);
      await screenshot.expectHaveScreenshot("invite_users_dialog_search_user");

      await contacts.inviteDialog.clickAddUserToInviteList(
        userEmails.roomAdmin,
      );
      await contacts.inviteDialog.checkAddedUserExist(userEmails.roomAdmin);
      await screenshot.expectHaveScreenshot("invite_users_dialog_added_user");

      await contacts.inviteDialog.openRowAccessSelector(
        invite.submenu.roomAdmin,
      );
      await screenshot.expectHaveScreenshot(
        "invite_users_dialog_user_access_selector",
      );
      await contacts.inviteDialog.selectAccessOption(invite.submenu.user);
      await screenshot.expectHaveScreenshot(
        "invite_users_dialog_added_user_changed_access",
      );
      await contacts.inviteDialog.openRowAccessSelector(invite.submenu.user);
      await contacts.inviteDialog.selectRemoveAccessOption();
      await screenshot.expectHaveScreenshot(
        "invite_users_dialog_removed_user_from_list",
      );
      await contacts.inviteDialog.close();

      await contacts.inviteUsers();
      await screenshot.expectHaveScreenshot("invite_users_success");
    });

    await test.step("Disable", async () => {
      await contacts.table.openContextMenu(userEmails.roomAdmin);
      await contacts.table.clickContextMenuOption(
        membersContextMenuOption.disable,
      );
      await contacts.dialog.checkDialogTitleExist("Disable user");
      await screenshot.expectHaveScreenshot("disable_diaglog");
      await contacts.dialog.close();

      await contacts.table.selectRow(userEmails.roomAdmin);
      await contacts.navigation.disable();

      await contacts.table.checkDisabledUserExist(userEmails.roomAdmin);
      await screenshot.expectHaveScreenshot("disable_users_success");
    });

    await test.step("ChangeType", async () => {
      await contacts.openChangeContactTypeDialog(
        userEmails.docspaceAdmin,
        menuItemChangeUserType.roomAdmin,
      );
      await screenshot.expectHaveScreenshot("change_type_room_admin_dialog");
      await contacts.submitChangeContactTypeDialog();
      await contacts.table.checkContactType(
        userEmails.docspaceAdmin,
        contactTypes.roomAdmin,
      );

      await contacts.openChangeContactTypeDialog(
        userEmails.docspaceAdmin,
        menuItemChangeUserType.user,
      );
      await screenshot.expectHaveScreenshot("change_type_user_dialog");
      await contacts.submitChangeContactTypeDialog();
      await contacts.table.checkContactType(
        userEmails.docspaceAdmin,
        contactTypes.user,
      );

      await contacts.openChangeContactTypeDialog(
        userEmails.docspaceAdmin,
        menuItemChangeUserType.docspaceAdmin,
      );
      await screenshot.expectHaveScreenshot(
        "change_type_docspace_admin_dialog",
      );
      await contacts.submitChangeContactTypeDialog();
      await contacts.table.checkContactType(
        userEmails.docspaceAdmin,
        contactTypes.docspaceAdmin,
      );

      await contacts.inviteUser(userEmails.guest, contactTypes.user);
      await contacts.openChangeContactTypeDialog(
        userEmails.guest,
        menuItemChangeUserType.guest,
      );
      await screenshot.expectHaveScreenshot("change_type_guest_dialog");
      await contacts.submitChangeContactTypeDialog();
      await contacts.table.checkRowNotExist(userEmails.guest);
    });

    await test.step("ChangeOwner", async () => {
      await contacts.openChangeOwnerDialog();
      await screenshot.expectHaveScreenshot("change_owner");
      await contacts.openChooseFromList();
      await screenshot.expectHaveScreenshot("change_owner_choose_from_list");
      await contacts.dialog.close();
    });

    await test.step("ChangeName", async () => {
      await contacts.openChangeNameDialog();
      await screenshot.expectHaveScreenshot("change_name");
      await contacts.dialog.close();
    });

    await test.step("ChangeEmail", async () => {
      await contacts.openChangeEmailDialog();
      await screenshot.expectHaveScreenshot("change_email");
      await contacts.dialog.close();
    });

    await test.step("ChangePassword", async () => {
      await contacts.openChangePasswordDialog();
      await screenshot.expectHaveScreenshot("change_password");
      await contacts.dialog.close();
    });

    await test.step("Delete", async () => {
      await contacts.table.selectRow(userEmails.user);
      await contacts.navigation.disable();
      await contacts.table.checkDisabledUserExist(userEmails.user);

      await contacts.table.openContextMenu(userEmails.user);
      await contacts.table.clickContextMenuOption(
        membersContextMenuOption.delete,
      );
      await contacts.dialog.checkDialogTitleExist("Delete user");
      await screenshot.expectHaveScreenshot("delete_dialog");
      await contacts.dialog.close();

      await contacts.table.selectRow(userEmails.user);
      await contacts.navigation.delete();
      await contacts.reassignmentDialog.checkReassignmentTitleExist();
      await contacts.reassignmentDialog.checkAllDataTransfered();
      await screenshot.expectHaveScreenshot("delete_success");
      await contacts.reassignmentDialog.close();
    });

    await test.step("Enabled", async () => {
      await contacts.table.openContextMenu(userEmails.roomAdmin);
      await contacts.table.clickContextMenuOption(
        membersContextMenuOption.enable,
      );
      await contacts.dialog.checkDialogTitleExist("Enable user");
      await screenshot.expectHaveScreenshot("enable_dialog");
      await contacts.dialog.close();

      await contacts.selectAllContacts();
      await contacts.navigation.enable();
      await contacts.table.checkEnabledUserExist(userEmails.roomAdmin);
    });

    await test.step("CreateGroup", async () => {
      await contacts.navigation.openCreateGroupDialog();
      await contacts.groupDialog.checkDialogExist();
      await contacts.groupDialog.fillGroupName(GROUP_NAME);
      await contacts.groupDialog.openAddMembersSelector();
      await screenshot.expectHaveScreenshot(
        "create_group_add_members_selector",
      );
      await contacts.groupDialog.selectContact(userEmails.roomAdmin);
      await contacts.groupDialog.submitSelectContacts();
      await contacts.groupDialog.openHeadOfGroupSelector();
      await contacts.groupDialog.selectContact(userEmails.docspaceAdmin, true);
      await contacts.groupDialog.removeContact(userEmails.docspaceAdmin);
      await contacts.groupDialog.openHeadOfGroupSelector();
      await contacts.groupDialog.selectContact(userEmails.docspaceAdmin, true);

      await contacts.groupDialog.submitCreateGroup();
      await screenshot.expectHaveScreenshot("create_group_success");
      await contacts.groupDialog.close();
    });

    await test.step("Members", async () => {
      await contacts.infoPanel.open();
      await contacts.table.selectRow(ADMIN_OWNER_NAME);
      await contacts.infoPanel.hideRegistrationDate();
      await screenshot.expectHaveScreenshot("members_info_panel_user_owner");

      await contacts.infoPanel.openContactsOptions();
      await screenshot.expectHaveScreenshot("members_info_panel_options");
      await contacts.infoPanel.close();

      await contacts.filter.openDropdownSortBy();
      await screenshot.expectHaveScreenshot("members_table_sort_by");

      await contacts.filter.openFilterDialog();
      await screenshot.expectHaveScreenshot("members_filter_dialog");
      await contacts.dialog.close();

      await contacts.filter.fillSearchInputAndCheckRequest(
        ADMIN_OWNER_NAME,
        "people",
      );
      await screenshot.expectHaveScreenshot("members_filter_search");

      await contacts.filter.fillSearchInputAndCheckRequest(
        "empty_search",
        "people",
      );
      await screenshot.expectHaveScreenshot("members_filter_empty_search");
      await contacts.filter.clearFilter();
      await contacts.table.checkRowExist(ADMIN_OWNER_NAME);
    });

    await test.step("Groups", async () => {
      await contacts.openTab("Groups");

      await contacts.table.openContextMenu(GROUP_NAME);
      await screenshot.expectHaveScreenshot("groups_context_menu");
      await contacts.table.clickContextMenuOption(
        groupsContextMenuOption.editGroup,
      );
      await contacts.dialog.checkDialogTitleExist("Edit group");
      await contacts.groupDialog.fillGroupName(GROUP_NAME + " EDITED");
      await contacts.groupDialog.submitEditGroup();

      await contacts.table.openContextMenu(GROUP_NAME + " EDITED");
      await contacts.table.clickContextMenuOption(
        groupsContextMenuOption.editGroup,
      );
      await contacts.dialog.checkDialogTitleExist("Edit group");
      await contacts.groupDialog.fillGroupName(GROUP_NAME);
      await contacts.groupDialog.submitEditGroup();

      await contacts.table.openSettings();
      await screenshot.expectHaveScreenshot("groups_table_settings");

      await contacts.infoPanel.open();
      await contacts.table.selectRow(GROUP_NAME);
      await contacts.infoPanel.checkGroupMemberExist();
      await screenshot.expectHaveScreenshot("groups_info_panel");

      await contacts.infoPanel.openGroupsOptions();
      await screenshot.expectHaveScreenshot("groups_info_panel_options");
      await contacts.infoPanel.close();

      await contacts.filter.openDropdownSortBy();
      await screenshot.expectHaveScreenshot("groups_table_sort_by");

      await contacts.filter.openFilterDialog();
      await screenshot.expectHaveScreenshot("groups_table_filter_dialog");
      await contacts.dialog.close();

      await contacts.filter.fillSearchInputAndCheckRequest(GROUP_NAME, "group");
      await screenshot.expectHaveScreenshot("groups_table_filter_search");

      await contacts.filter.fillSearchInputAndCheckRequest(
        "empty_search",
        "group",
      );
      await screenshot.expectHaveScreenshot("groups_filter_empty_search");
      await contacts.filter.clearFilter();
      await contacts.table.checkRowExist(GROUP_NAME);

      await contacts.openDeleteGroupDialog();
      await screenshot.expectHaveScreenshot("groups_delete_dialog");
      await contacts.dialog.close();

      await contacts.table.selectRow(GROUP_NAME);
      await contacts.navigation.deleteGroup();
      await contacts.table.checkRowNotExist(GROUP_NAME);
    });

    await test.step("Guests", async () => {
      await contacts.openTab("Guests");

      await contacts.filter.removeFilter("Me");
      await contacts.table.openContextMenu(userEmails.guest);
      await screenshot.expectHaveScreenshot("guests_context_menu");
      await contacts.closeMenu();

      await contacts.table.openSettings();
      await screenshot.expectHaveScreenshot("guests_table_settings");
      await contacts.table.closeSettings();

      await contacts.table.openContextMenu(userEmails.guest);
      await contacts.table.contextMenu.hoverOption(
        guestsContextMenuOption.changeType,
      );
      await screenshot.expectHaveScreenshot(
        "guests_context_menu_change_type",
        false,
      );

      await contacts.infoPanel.open();
      await contacts.table.selectRow(userEmails.guest);
      await screenshot.expectHaveScreenshot("guests_info_panel");

      await contacts.infoPanel.openContactsOptions();
      await screenshot.expectHaveScreenshot("guests_info_panel_options");
      await contacts.infoPanel.close();

      await contacts.navigation.disable();
      await contacts.table.checkDisabledUserExist(userEmails.guest);

      await contacts.table.selectRow(userEmails.guest);
      await contacts.navigation.enable();
      await contacts.table.checkEnabledUserExist(userEmails.guest);

      await contacts.filter.openDropdownSortBy();
      await screenshot.expectHaveScreenshot("guests_sort_by");

      await contacts.filter.openFilterDialog();
      await screenshot.expectHaveScreenshot("guests_filter_dialog");
      await contacts.dialog.close();

      await contacts.filter.fillSearchInputAndCheckRequest(
        "empty_search",
        "people",
      );
      await contacts.table.checkRowNotExist(userEmails.guest);
      await screenshot.expectHaveScreenshot("guests_filter_empty_search");

      await contacts.filter.fillSearchInputAndCheckRequest(
        userEmails.guest,
        "people",
      );
      await contacts.table.checkRowExist(userEmails.guest);
      await screenshot.expectHaveScreenshot("guests_filter_search");
    });
  });

  test.afterAll(async () => {
    await api.cleanup();
    await page.close();
  });
});

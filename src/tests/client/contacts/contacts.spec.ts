import { test } from "@/src/fixtures";
import Contacts from "@/src/objects/contacts/Contacts";
import {
  ADMIN_OWNER_NAME,
  contactsActionsMenu,
  contactTypes,
  GROUP_NAME,
  groupsContextMenuOption,
  membersContextMenuOption,
  menuItemChangeUserType,
  userEmails,
} from "@/src/utils/constants/contacts";

test.describe(() => {
  let contacts: Contacts;

  test.beforeEach(async ({ page, api, login }) => {
    contacts = new Contacts(page, api.portalDomain);
    await login.loginToPortal();
    await contacts.open();
  });

  test("Contacts", async () => {
    await test.step("EmptyView", async () => {
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);

      await contacts.table.openSettings();
      await contacts.table.closeSettings();

      await contacts.openTab("Groups");
      await contacts.checkEmptyGroupsExist();

      await contacts.openTab("Guests");
      await contacts.checkEmptyGuestsExist();
    });

    await test.step("InviteUsers", async () => {
      await contacts.openTab("Members");
      const invite = contactsActionsMenu.invite;

      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.roomAdmin,
      );
      await contacts.inviteDialog.checkAccessSelectionExist(
        invite.submenu.roomAdmin,
      );
      await contacts.inviteDialog.openAccessOptions();
      await contacts.inviteDialog.selectAccessOption(invite.submenu.roomAdmin);

      await contacts.inviteDialog.fillSearchInviteInput(userEmails.roomAdmin);
      await contacts.inviteDialog.checkUserExist(userEmails.roomAdmin);

      await contacts.inviteDialog.clickAddUserToInviteList(
        userEmails.roomAdmin,
      );
      await contacts.inviteDialog.checkAddedUserExist(userEmails.roomAdmin);

      await contacts.inviteDialog.openRowAccessSelector(
        invite.submenu.roomAdmin,
      );
      await contacts.inviteDialog.selectAccessOption(invite.submenu.user);
      await contacts.inviteDialog.openRowAccessSelector(invite.submenu.user);
      await contacts.inviteDialog.selectRemoveAccessOption();
      await contacts.inviteDialog.close();

      await contacts.inviteUsers();
    });

    await test.step("Disable", async () => {
      await contacts.table.openContextMenu(userEmails.roomAdmin);
      await contacts.table.clickContextMenuOption(
        membersContextMenuOption.disable,
      );
      await contacts.dialog.checkDialogTitleExist("Disable user");
      await contacts.dialog.close();

      await contacts.table.selectRow(userEmails.roomAdmin);
      await contacts.disableUser();

      await contacts.table.checkDisabledUserExist(userEmails.roomAdmin);
    });

    await test.step("ChangeType", async () => {
      await contacts.openChangeContactTypeDialog(
        userEmails.docspaceAdmin,
        menuItemChangeUserType.roomAdmin,
      );
      await contacts.submitChangeContactTypeDialog();
      await contacts.table.checkContactType(
        userEmails.docspaceAdmin,
        contactTypes.roomAdmin,
      );

      await contacts.openChangeContactTypeDialog(
        userEmails.docspaceAdmin,
        menuItemChangeUserType.user,
      );
      await contacts.submitChangeContactTypeDialog();
      await contacts.table.checkContactType(
        userEmails.docspaceAdmin,
        contactTypes.user,
      );

      await contacts.openChangeContactTypeDialog(
        userEmails.docspaceAdmin,
        menuItemChangeUserType.docspaceAdmin,
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
      await contacts.submitChangeContactTypeDialog();
      await contacts.table.checkRowNotExist(userEmails.guest);
    });

    await test.step("ChangeOwner", async () => {
      await contacts.openChangeOwnerDialog();
      await contacts.openChooseFromList();
      await contacts.dialog.close();
    });

    await test.step("ChangeName", async () => {
      await contacts.openChangeNameDialog();
      await contacts.dialog.close();
    });

    await test.step("ChangeEmail", async () => {
      await contacts.openChangeEmailDialog();
      await contacts.dialog.close();
    });

    await test.step("ChangePassword", async () => {
      await contacts.openChangePasswordDialog();
      await contacts.dialog.close();
    });

    await test.step("ReassignData_ChooseFromList", async () => {
      await contacts.table.selectRow(userEmails.user);
      await contacts.disableUser();
      await contacts.table.checkDisabledUserExist(userEmails.user);

      await contacts.table.openContextMenu(userEmails.user);
      await contacts.table.clickContextMenuOption(
        membersContextMenuOption.reassign,
      );
      await contacts.reassignmentDialog.checkReassignmentTitleExist();
      await contacts.reassignmentDialog.clickChooseFromList();
      await contacts.reassignmentDialog.clickCancel();
      await contacts.reassignmentDialog.close();
    });

    await test.step("Delete", async () => {
      await contacts.table.openContextMenu(userEmails.user);
      await contacts.table.clickContextMenuOption(
        membersContextMenuOption.delete,
      );
      await contacts.dialog.checkDialogTitleExist("Delete user");
      await contacts.dialog.close();

      await contacts.table.selectRow(userEmails.user);
      await contacts.deleteUser();
      await contacts.reassignmentDialog.checkReassignmentTitleExist();
      await contacts.reassignmentDialog.checkAllDataTransfered();
      await contacts.reassignmentDialog.close();
    });

    await test.step("Enabled", async () => {
      await contacts.table.openContextMenu(userEmails.roomAdmin);
      await contacts.table.clickContextMenuOption(
        membersContextMenuOption.enable,
      );
      await contacts.dialog.checkDialogTitleExist("Enable user");
      await contacts.dialog.close();

      await contacts.selectAllContacts();
      await contacts.enableUser();
      await contacts.table.checkEnabledUserExist(userEmails.roomAdmin);
    });

    await test.step("CreateGroup", async () => {
      await contacts.openTab("Groups");
      await contacts.navigation.openCreateGroupDialog();
      await contacts.groupDialog.checkDialogExist();
      await contacts.groupDialog.fillGroupName(GROUP_NAME);
      await contacts.groupDialog.openAddMembersSelector();
      await contacts.groupDialog.selectContact(userEmails.roomAdmin);
      await contacts.groupDialog.submitSelectContacts();
      await contacts.groupDialog.openHeadOfGroupSelector();
      await contacts.groupDialog.selectContact(userEmails.docspaceAdmin, true);
      await contacts.groupDialog.removeContact(userEmails.docspaceAdmin);
      await contacts.groupDialog.openHeadOfGroupSelector();
      await contacts.groupDialog.selectContact(userEmails.docspaceAdmin, true);
      await contacts.groupDialog.submitCreateGroup();
      await contacts.groupDialog.close();
    });

    await test.step("Members", async () => {
      await contacts.openTab("Members");
      await contacts.infoPanel.open();
      await contacts.table.selectRowByNameText(ADMIN_OWNER_NAME);

      await contacts.infoPanel.openContactsOptions();
      await contacts.infoPanel.close();

      await contacts.peopleFilter.openDropdownSortBy();

      await contacts.peopleFilter.openFilterDialog();
      await contacts.dialog.close();

      await contacts.peopleFilter.fillSearchContactsInputAndCheckRequest(
        ADMIN_OWNER_NAME,
      );

      await contacts.peopleFilter.fillSearchContactsInputAndCheckRequest(
        "empty_search",
      );
      await contacts.peopleFilter.clearFilter();
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);
    });

    await test.step("Groups", async () => {
      await contacts.openTab("Groups");

      await contacts.table.openContextMenu(GROUP_NAME);
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
      await contacts.infoPanel.close();

      await contacts.groupsFilter.openDropdownSortBy();
      await contacts.groupsFilter.openFilterDialog();
      await contacts.dialog.close();

      await contacts.groupsFilter.fillSearchContactsInputAndCheckRequest(
        GROUP_NAME,
      );

      await contacts.groupsFilter.fillSearchContactsInputAndCheckRequest(
        "empty_search",
      );
      await contacts.table.checkRowNotExist(GROUP_NAME);
      await contacts.groupsFilter.clearFilter();
      await contacts.table.checkRowExist(GROUP_NAME);

      await contacts.openDeleteGroupDialog();
      await contacts.dialog.close();

      await contacts.table.selectGroupRow(GROUP_NAME);
      await contacts.deleteGroup();
      await contacts.table.checkRowNotExist(GROUP_NAME);
    });

    await test.step("Guests", async () => {
      await contacts.openTab("Guests");
      await contacts.infoPanel.open();
      await contacts.table.selectRow(userEmails.guest);

      await contacts.infoPanel.openContactsOptions();
      await contacts.infoPanel.close();

      await contacts.disableGuest();
      await contacts.table.checkDisabledUserExist(userEmails.guest);

      await contacts.table.selectRow(userEmails.guest);
      await contacts.enableGuest();
      await contacts.table.checkEnabledUserExist(userEmails.guest);

      await contacts.peopleFilter.openDropdownSortBy();
      await contacts.peopleFilter.openFilterDialog();
      await contacts.dialog.close();

      await contacts.peopleFilter.fillSearchContactsInputAndCheckRequest(
        "empty_search",
      );
      await contacts.table.checkRowNotExist(userEmails.guest);

      await contacts.peopleFilter.fillSearchContactsInputAndCheckRequest(
        userEmails.guest,
      );
      await contacts.table.checkRowExist(userEmails.guest);
    });
  });
});

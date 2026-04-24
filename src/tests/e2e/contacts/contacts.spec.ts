import { test } from "@/src/fixtures";
import Contacts from "@/src/objects/contacts/Contacts";
import {
  ADMIN_OWNER_NAME,
  contactsActionsMenu,
  contactSort,
  contactTypes,
  GROUP_NAME,
  groupsContextMenuOption,
  membersContextMenuOption,
  menuItemChangeUserType,
  toastMessages,
  userEmails,
} from "@/src/utils/constants/contacts";
import { FAKER } from "@/src/utils/helpers/faker";

const faker = new FAKER();

test.describe(() => {
  let contacts: Contacts;

  test.beforeEach(async ({ page, api, login }) => {
    contacts = new Contacts(page, api.portalDomain);
    await login.loginToPortal();
    await contacts.open();
  });

  test("Empty view", async () => {
    await test.step("Check members empty view", async () => {
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);

      await contacts.table.openSettings();
      await contacts.table.closeSettings();
    });

    await test.step("Check groups empty view", async () => {
      await contacts.openTab("Groups");
      await contacts.checkEmptyGroupsExist();
    });

    await test.step("Check guests empty view", async () => {
      await contacts.openTab("Guests");
      await contacts.checkEmptyGuestsExist();
    });
  });

  test("Invite dialog", async () => {
    const invite = contactsActionsMenu.invite;

    await test.step("Open invite dialog", async () => {
      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.docspaceAdmin,
      );
    });

    await test.step("Add user and change access in invite list", async () => {
      await contacts.inviteDialog.fillSearchInviteInput(
        userEmails.docspaceAdmin,
      );
      await contacts.inviteDialog.checkUserExist(userEmails.docspaceAdmin);

      await contacts.inviteDialog.clickAddUserToInviteList(
        userEmails.docspaceAdmin,
      );
      await contacts.inviteDialog.checkAddedUserExist(userEmails.docspaceAdmin);

      await contacts.inviteDialog.openRowAccessSelector(
        invite.submenu.docspaceAdmin,
      );
      await contacts.inviteDialog.selectAccessOption(invite.submenu.user);
      await contacts.inviteDialog.openRowAccessSelector(invite.submenu.user);
      await contacts.inviteDialog.selectRemoveAccessOption();
      await contacts.inviteDialog.close();
    });

    await test.step("Invite user and verify in table", async () => {
      await contacts.inviteUser(
        userEmails.docspaceAdmin,
        contactTypes.docspaceAdmin,
      );
    });
  });

  test("Change owner name", async () => {
    const { firstName, lastName } = faker.generateUser();
    const newFullName = `${firstName} ${lastName}`;

    await test.step("Change owner name and verify", async () => {
      await contacts.changeName(firstName, lastName);
      await contacts.table.checkRowExistByNameText(newFullName);
    });
  });

  test("Send change email instructions", async () => {
    await contacts.sendChangeEmailInstructions("newemail@test.com");
  });

  test("Send change password instructions", async () => {
    await contacts.sendChangePasswordInstructions();
    await contacts.removeToast(toastMessages.passwordChangeInstructions);
  });

  test("Change portal owner", async ({ apiSdk }) => {
    const { userData } = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const userName = `${userData.firstName} ${userData.lastName}`;
    await contacts.submitChangeOwner(userName);
  });

  test("Reassign data and delete user", async () => {
    await contacts.inviteUser(
      userEmails.user,
      contactsActionsMenu.invite.submenu.user,
    );

    await test.step("Disable user", async () => {
      await contacts.table.selectRow(userEmails.user);
      await contacts.disableUser();
      await contacts.table.checkDisabledUserExist(userEmails.user);
    });

    await test.step("Reassign data to admin", async () => {
      await contacts.table.openContextMenu(userEmails.user);
      await contacts.table.clickContextMenuOption(
        membersContextMenuOption.reassign,
      );
      await contacts.reassignmentDialog.checkReassignmentTitleExist();
      await contacts.reassignmentDialog.selectUserFromList(ADMIN_OWNER_NAME);
      await contacts.reassignmentDialog.clickReassign();
      await contacts.reassignmentDialog.checkAllDataTransfered();
      await contacts.reassignmentDialog.close();
    });

    await test.step("Delete user via context menu dialog", async () => {
      await contacts.table.openContextMenu(userEmails.user);
      await contacts.table.clickContextMenuOption(
        membersContextMenuOption.delete,
      );
      await contacts.dialog.checkDialogTitleExist("Delete user");
      await contacts.dialog.close();
    });

    await test.step("Delete user via selection", async () => {
      await contacts.table.selectRow(userEmails.user);
      await contacts.deleteUser();
      await contacts.reassignmentDialog.checkReassignmentTitleExist();
      await contacts.reassignmentDialog.checkAllDataTransfered();
      await contacts.reassignmentDialog.close();
    });
  });

  test("Groups management", async () => {
    await contacts.inviteUsers();

    await test.step("Create group", async () => {
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

    await test.step("Edit group name", async () => {
      await contacts.table.openContextMenu(GROUP_NAME);
      await contacts.table.clickContextMenuOption(
        groupsContextMenuOption.editGroup,
      );
      await contacts.dialog.checkDialogTitleExist("Edit group");
      await contacts.groupDialog.fillGroupName(GROUP_NAME + " EDITED");
      await contacts.groupDialog.submitEditGroup();
    });

    await test.step("Revert group name", async () => {
      await contacts.table.openContextMenu(GROUP_NAME + " EDITED");
      await contacts.table.clickContextMenuOption(
        groupsContextMenuOption.editGroup,
      );
      await contacts.dialog.checkDialogTitleExist("Edit group");
      await contacts.groupDialog.fillGroupName(GROUP_NAME);
      await contacts.groupDialog.submitEditGroup();
      await contacts.table.openSettings();
      await contacts.infoPanel.close();
    });

    await test.step("Filter and search groups", async () => {
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
    });

    await test.step("Delete group", async () => {
      await contacts.openDeleteGroupDialog();
      await contacts.dialog.close();

      await contacts.table.selectGroupRow(GROUP_NAME);
      await contacts.deleteGroup();
      await contacts.table.checkRowNotExist(GROUP_NAME);
    });
  });

  test("Members filter and sort", async () => {
    await contacts.inviteUsers();

    await test.step("Open info panel and check options", async () => {
      await contacts.infoPanel.open();
      await contacts.table.selectRowByNameText(ADMIN_OWNER_NAME);
      await contacts.infoPanel.openContactsOptions();
      await contacts.infoPanel.close();
    });

    await test.step("Sort by type", async () => {
      await contacts.peopleFilter.applySort(contactSort.type);
    });

    await test.step("Sort by email", async () => {
      await contacts.peopleFilter.applySort(contactSort.email);
    });

    await test.step("Search for existing user", async () => {
      await contacts.peopleFilter.fillSearchContactsInputAndCheckRequest(
        ADMIN_OWNER_NAME,
      );
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);
    });

    await test.step("Search returns empty results", async () => {
      await contacts.peopleFilter.fillSearchContactsInputAndCheckRequest(
        "empty_search",
      );
    });

    await test.step("Clear filter and verify all users visible", async () => {
      await contacts.peopleFilter.clearFilter();
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);
    });
  });

  test.describe("Guests", () => {
    test.beforeEach(async () => {
      await contacts.inviteUser(userEmails.guest, contactTypes.user);
      await contacts.openChangeContactTypeDialog(
        userEmails.guest,
        menuItemChangeUserType.guest,
      );
      await contacts.submitChangeContactTypeDialog();
      await contacts.dismissQuotaWarning();
      await contacts.openTab("Guests");
    });

    test("Disable and enable guest", async () => {
      await contacts.infoPanel.open();
      await contacts.table.selectRow(userEmails.guest);
      await contacts.infoPanel.openContactsOptions();
      await contacts.infoPanel.close();

      await contacts.disableGuest();
      await contacts.table.checkDisabledUserExist(userEmails.guest);

      await contacts.table.selectRow(userEmails.guest);
      await contacts.enableGuest();
      await contacts.table.checkEnabledUserExist(userEmails.guest);
    });

    test("Guest filter and search", async () => {
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

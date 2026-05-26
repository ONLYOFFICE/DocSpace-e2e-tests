import { test } from "@/src/fixtures";
import Contacts from "@/src/objects/contacts/Contacts";
import {
  contactTypes,
  menuItemChangeUserType,
  userEmails,
} from "@/src/utils/constants/contacts";

test.describe("Contacts - Guests", () => {
  let contacts: Contacts;

  test.beforeEach(async ({ page, api, login }) => {
    contacts = new Contacts(page, api.portalDomain);
    await login.loginToPortal();
    await contacts.open();

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

  test("Info panel shows guest data fields", async () => {
    await test.step("Open info panel and select guest", async () => {
      await contacts.infoPanel.open();
      await contacts.table.selectRow(userEmails.guest);
    });

    await test.step("Check Account is Pending invite", async () => {
      await contacts.infoPanel.checkAccountStatus("Pending invite");
    });

    await test.step("Check Type is Guest", async () => {
      await contacts.infoPanel.checkUserType("Guest");
    });

    await test.step("Check Status is Free", async () => {
      await contacts.infoPanel.checkStatus("Free");
    });
  });

  test("Delete guest", async () => {
    await test.step("Disable guest first", async () => {
      await contacts.table.selectRow(userEmails.guest);
      await contacts.disableGuest();
      await contacts.table.checkDisabledUserExist(userEmails.guest);
    });

    await test.step("Select disabled guest and delete", async () => {
      await contacts.table.selectRow(userEmails.guest);
      await contacts.deleteGuest();
    });

    await test.step("Verify guest is no longer in Guests tab", async () => {
      await contacts.table.checkRowNotExist(userEmails.guest);
    });
  });
});

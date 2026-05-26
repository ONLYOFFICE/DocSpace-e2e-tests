import { test } from "@/src/fixtures";
import Contacts from "@/src/objects/contacts/Contacts";
import { ADMIN_OWNER_NAME } from "@/src/utils/constants/contacts";

test.describe("Contacts - Members: filter by status", () => {
  let contacts: Contacts;
  let userDisplayName: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    contacts = new Contacts(page, api.portalDomain);

    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    userDisplayName = `${userData.firstName} ${userData.lastName}`;

    await login.loginToPortal();
    await contacts.open();

    await contacts.table.selectRow(userDisplayName);
    await contacts.disableUser();
  });

  test("Filter by Disabled status shows only disabled users", async () => {
    await test.step("Open filter and select Disabled", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterByAccountStatus("Disabled");
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify disabled user is shown and active users are not", async () => {
      await contacts.table.checkDisabledUserExist(userDisplayName);
      await contacts.table.checkRowNotExist(ADMIN_OWNER_NAME);
    });

    await test.step("Remove filter and verify all users are visible again", async () => {
      await contacts.peopleFilter.removeFilter("Disabled");
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);
      await contacts.table.checkDisabledUserExist(userDisplayName);
    });
  });

  test("Filter by Active status shows only active users", async () => {
    await test.step("Open filter and select Active", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterByAccountStatus("Active");
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify active users are shown and disabled user is not", async () => {
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);
      await contacts.table.checkRowNotExist(userDisplayName);
    });

    await test.step("Remove filter and verify all users are visible again", async () => {
      await contacts.peopleFilter.removeFilter("Active");
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);
      await contacts.table.checkDisabledUserExist(userDisplayName);
    });
  });
});

test.describe("Contacts - Members: filter by Pending invite status", () => {
  let contacts: Contacts;
  let pendingEmail: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    contacts = new Contacts(page, api.portalDomain);

    pendingEmail = `pending_filter_${Date.now()}@test.com`;
    await apiSdk.profiles.inviteUser("owner", {
      type: "4",
      email: pendingEmail,
    });

    await login.loginToPortal();
    await contacts.open();
  });

  test("Filter by Pending invite status shows only pending users", async () => {
    await test.step("Open filter and select Pending invite", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterByAccountStatus("Pending invite");
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify pending user is shown and active users are not", async () => {
      await contacts.table.checkRowExist(pendingEmail);
      await contacts.table.checkRowNotExist(ADMIN_OWNER_NAME);
    });

    await test.step("Remove filter and verify all users are visible again", async () => {
      await contacts.peopleFilter.removeFilter("Pending invite");
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);
      await contacts.table.checkRowExist(pendingEmail);
    });
  });
});

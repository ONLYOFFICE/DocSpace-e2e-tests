import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Contacts from "@/src/objects/contacts/Contacts";
import { ADMIN_OWNER_NAME } from "@/src/utils/constants/contacts";
import { QuotaPlan, DefaultQuota, defaultQuotaToBytes } from "@/src/services";
import { PaymentApi } from "@/src/api/payment";

const FILTER_SECTIONS = [
  "Group",
  "Status",
  "Type",
  "Account",
  "Account login type",
  "Storage quota",
];

const FILTER_OPTIONS = [
  "Without group",
  "Other",
  "Active",
  "Pending invite",
  "Disabled",
  "DocSpace admin",
  "Room admin",
  "User",
  "Paid",
  "Free",
  "SSO",
  "LDAP",
  "Standard login",
  "Custom quota",
  "Default quota",
];

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

test.describe("Contacts - Members: filter dialog options", () => {
  let contacts: Contacts;

  test.beforeEach(async ({ page, api, login }) => {
    contacts = new Contacts(page, api.portalDomain);
    await login.loginToPortal();
    await contacts.open();
  });

  test("Filter dialog shows all expected sections and options, and no unexpected ones", async () => {
    await test.step("Open filter dialog", async () => {
      await contacts.peopleFilter.openFilterDialog();
    });

    await test.step("Verify all filter sections are visible", async () => {
      for (const section of FILTER_SECTIONS) {
        await expect(
          contacts.peopleFilter.filterDialog.getByText(section, {
            exact: true,
          }),
        ).toBeVisible();
      }
    });

    await test.step("Verify all filter options are visible", async () => {
      for (const option of FILTER_OPTIONS) {
        await expect(
          contacts.peopleFilter.filterDialog.getByText(option, { exact: true }),
        ).toBeVisible();
      }
    });

    await test.step("Verify options not applicable to Members are absent", async () => {
      await expect(
        contacts.peopleFilter.filterDialog.getByText("Guest", { exact: true }),
      ).not.toBeVisible();
      await expect(
        contacts.peopleFilter.filterDialog.getByText("Owner", { exact: true }),
      ).not.toBeVisible();
    });
  });
});

test.describe("Contacts - Members: filter by type", () => {
  let contacts: Contacts;
  let adminDisplayName: string;
  let roomAdminDisplayName: string;
  let userDisplayName: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    contacts = new Contacts(page, api.portalDomain);

    const { userData: adminData } = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    adminDisplayName = `${adminData.firstName} ${adminData.lastName}`;

    const { userData: roomAdminData } = await apiSdk.profiles.addMember(
      "owner",
      "RoomAdmin",
    );
    roomAdminDisplayName = `${roomAdminData.firstName} ${roomAdminData.lastName}`;

    const { userData: regularUserData } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    userDisplayName = `${regularUserData.firstName} ${regularUserData.lastName}`;

    await login.loginToPortal();
    await contacts.open();
  });

  test("Filter by DocSpace admin type shows only DocSpace admins", async () => {
    await test.step("Open filter and select DocSpace admin", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterByType("DocSpace admin");
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify DocSpace admin is shown and other types are not", async () => {
      await contacts.table.checkRowExistByNameText(adminDisplayName);
      await contacts.table.checkRowNotExist(roomAdminDisplayName);
      await contacts.table.checkRowNotExist(userDisplayName);
    });

    await test.step("Remove filter and verify all users are visible again", async () => {
      await contacts.peopleFilter.removeFilter("DocSpace admin");
      await contacts.table.checkRowExistByNameText(adminDisplayName);
      await contacts.table.checkRowExistByNameText(roomAdminDisplayName);
      await contacts.table.checkRowExistByNameText(userDisplayName);
    });
  });

  test("Filter by Room admin type shows only room admins", async () => {
    await test.step("Open filter and select Room admin", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterByType("Room admin");
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify Room admin is shown and other types are not", async () => {
      await contacts.table.checkRowExistByNameText(roomAdminDisplayName);
      await contacts.table.checkRowNotExist(adminDisplayName);
      await contacts.table.checkRowNotExist(userDisplayName);
    });

    await test.step("Remove filter and verify all users are visible again", async () => {
      await contacts.peopleFilter.removeFilter("Room admin");
      await contacts.table.checkRowExistByNameText(adminDisplayName);
      await contacts.table.checkRowExistByNameText(roomAdminDisplayName);
      await contacts.table.checkRowExistByNameText(userDisplayName);
    });
  });

  test("Filter by User type shows only regular users", async () => {
    await test.step("Open filter and select User", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterByType("User");
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify User is shown and other types are not", async () => {
      await contacts.table.checkRowExistByNameText(userDisplayName);
      await contacts.table.checkRowNotExist(adminDisplayName);
      await contacts.table.checkRowNotExist(roomAdminDisplayName);
    });

    await test.step("Remove filter and verify all users are visible again", async () => {
      await contacts.peopleFilter.removeFilter("User");
      await contacts.table.checkRowExistByNameText(adminDisplayName);
      await contacts.table.checkRowExistByNameText(roomAdminDisplayName);
      await contacts.table.checkRowExistByNameText(userDisplayName);
    });
  });
});

test.describe("Contacts - Members: filter by group", () => {
  let contacts: Contacts;
  let groupMemberDisplayName: string;
  let memberWithoutGroupDisplayName: string;
  let groupMemberEmail: string;
  const FILTER_GROUP_NAME = "FilterTestGroup";

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    contacts = new Contacts(page, api.portalDomain);

    const { userData: groupMemberData } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    groupMemberDisplayName = `${groupMemberData.firstName} ${groupMemberData.lastName}`;
    groupMemberEmail = groupMemberData.email;

    const { userData: noGroupData } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    memberWithoutGroupDisplayName = `${noGroupData.firstName} ${noGroupData.lastName}`;

    await login.loginToPortal();
    await contacts.open();
    await contacts.createGroupWithMembers(FILTER_GROUP_NAME, [
      groupMemberEmail,
    ]);
    await contacts.openTab("Members");
  });

  test("Filter by Without group shows only users not in any group", async () => {
    await test.step("Open filter and select Without group", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterByWithoutGroup();
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify user without group is shown and group member is not", async () => {
      await contacts.table.checkRowExistByNameText(
        memberWithoutGroupDisplayName,
      );
      await contacts.table.checkRowNotExist(groupMemberDisplayName);
    });

    await test.step("Remove filter and verify all users are visible again", async () => {
      await contacts.peopleFilter.removeFilter("Without group");
      await contacts.table.checkRowExistByNameText(
        memberWithoutGroupDisplayName,
      );
      await contacts.table.checkRowExistByNameText(groupMemberDisplayName);
    });
  });

  test("Filter by specific group shows only group members", async () => {
    await test.step("Open filter, click Other, and select the group", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterBySpecificGroup(
        FILTER_GROUP_NAME,
      );
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify group member is shown and user without group is not", async () => {
      await contacts.table.checkRowExistByNameText(groupMemberDisplayName);
      await contacts.table.checkRowNotExist(memberWithoutGroupDisplayName);
    });

    await test.step("Remove filter and verify all users are visible again", async () => {
      await contacts.peopleFilter.removeFilter(FILTER_GROUP_NAME);
      await contacts.table.checkRowExistByNameText(groupMemberDisplayName);
      await contacts.table.checkRowExistByNameText(
        memberWithoutGroupDisplayName,
      );
    });
  });
});

test.describe("Contacts - Members: filter by account", () => {
  let contacts: Contacts;
  // Paid: portal owner, DocSpace admins, Room admins
  // Free: regular users (User type)
  let paidUserDisplayName: string;
  let freeUserDisplayName: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    contacts = new Contacts(page, api.portalDomain);

    const { userData: adminData } = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    paidUserDisplayName = `${adminData.firstName} ${adminData.lastName}`;

    const { userData: freeData } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    freeUserDisplayName = `${freeData.firstName} ${freeData.lastName}`;

    await login.loginToPortal();
    await contacts.open();
  });

  test("Filter by Paid account shows only paid users", async () => {
    await test.step("Open filter and select Paid", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterByAccount("Paid");
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify paid users are shown and free user is not", async () => {
      await contacts.table.checkRowExistByNameText(paidUserDisplayName);
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);
      await contacts.table.checkRowNotExist(freeUserDisplayName);
    });

    await test.step("Remove filter and verify all users are visible again", async () => {
      await contacts.peopleFilter.removeFilter("Paid");
      await contacts.table.checkRowExistByNameText(paidUserDisplayName);
      await contacts.table.checkRowExistByNameText(freeUserDisplayName);
    });
  });

  test("Filter by Free account shows only free users", async () => {
    await test.step("Open filter and select Free", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterByAccount("Free");
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify free user is shown and paid users are not", async () => {
      await contacts.table.checkRowExistByNameText(freeUserDisplayName);
      await contacts.table.checkRowNotExist(paidUserDisplayName);
      await contacts.table.checkRowNotExist(ADMIN_OWNER_NAME);
    });

    await test.step("Remove filter and verify all users are visible again", async () => {
      await contacts.peopleFilter.removeFilter("Free");
      await contacts.table.checkRowExistByNameText(paidUserDisplayName);
      await contacts.table.checkRowExistByNameText(freeUserDisplayName);
    });
  });
});

test.describe("Contacts - Members: filter by login type", () => {
  let contacts: Contacts;
  let userDisplayName: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    contacts = new Contacts(page, api.portalDomain);

    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    userDisplayName = `${userData.firstName} ${userData.lastName}`;

    await login.loginToPortal();
    await contacts.open();
  });

  test("Filter by Standard login shows users with standard login", async () => {
    await test.step("Open filter and select Standard login", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterByLoginType("Standard login");
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify standard login users are shown", async () => {
      await contacts.table.checkRowExistByNameText(userDisplayName);
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);
    });

    await test.step("Remove filter and verify state is unchanged", async () => {
      await contacts.peopleFilter.removeFilter("Standard login");
      await contacts.table.checkRowExistByNameText(userDisplayName);
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);
    });
  });

  // SSO/LDAP users cannot be created in automated tests, but the filter itself
  // is testable: in a fresh portal all users use standard login, so filtering
  // by SSO or LDAP must produce an empty view.
  test("Filter by SSO shows empty list when no SSO users exist", async () => {
    await test.step("Open filter and select SSO", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterByLoginType("SSO");
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify empty view is shown", async () => {
      await contacts.peopleFilter.checkEmptyView("No members found");
    });

    await test.step("Remove filter and verify users are visible again", async () => {
      await contacts.peopleFilter.removeFilter("SSO");
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);
      await contacts.table.checkRowExistByNameText(userDisplayName);
    });
  });

  test("Filter by LDAP shows empty list when no LDAP users exist", async () => {
    await test.step("Open filter and select LDAP", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterByLoginType("LDAP");
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify empty view is shown", async () => {
      await contacts.peopleFilter.checkEmptyView("No members found");
    });

    await test.step("Remove filter and verify users are visible again", async () => {
      await contacts.peopleFilter.removeFilter("LDAP");
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);
      await contacts.table.checkRowExistByNameText(userDisplayName);
    });
  });
});

// Storage quota requires quota to be enabled at portal level (paid portal feature).
test.describe("Contacts - Members: filter by storage quota", () => {
  let contacts: Contacts;
  let customQuotaUserDisplayName: string;
  let defaultQuotaUserDisplayName: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    contacts = new Contacts(page, api.portalDomain);

    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();

    await apiSdk.settings.userquotasettings("owner", {
      defaultQuota: DefaultQuota.User,
      enableQuota: true,
    });

    // [Bug 81774] Storage quota filter in contacts only appears when room quota
    // is enabled. Enabling user quota alone is not sufficient.
    await apiSdk.settings.roomquotasettings("owner", {
      defaultQuota: defaultQuotaToBytes[DefaultQuota.Room],
      enableQuota: true,
    });

    const { response: resp1, userData: data1 } =
      await apiSdk.profiles.addMember("owner", "User");
    customQuotaUserDisplayName = `${data1.firstName} ${data1.lastName}`;
    const customQuotaUserId = (await resp1.json()).response.id as string;

    await apiSdk.peopleQuota.changeUserQuotaLimit("owner", {
      userIds: [customQuotaUserId],
      quota: QuotaPlan.Minimal,
    });

    const { userData: data2 } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    defaultQuotaUserDisplayName = `${data2.firstName} ${data2.lastName}`;

    await login.loginToPortal();
    await contacts.open();
  });

  test("Filter by Custom quota shows only users with custom quota", async () => {
    await test.step("Open filter and select Custom quota", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterByStorageQuota("Custom quota");
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify custom quota user is shown and default quota user is not", async () => {
      await contacts.table.checkRowExistByNameText(customQuotaUserDisplayName);
      await contacts.table.checkRowNotExist(defaultQuotaUserDisplayName);
    });

    await test.step("Remove filter and verify all users are visible again", async () => {
      await contacts.peopleFilter.removeFilter("Custom quota");
      await contacts.table.checkRowExistByNameText(customQuotaUserDisplayName);
      await contacts.table.checkRowExistByNameText(defaultQuotaUserDisplayName);
    });
  });

  test("Filter by Default quota shows only users with default quota", async () => {
    await test.step("Open filter and select Default quota", async () => {
      await contacts.peopleFilter.openFilterDialog();
      await contacts.peopleFilter.selectFilterByStorageQuota("Default quota");
      await contacts.peopleFilter.applyFilter();
    });

    await test.step("Verify default quota user is shown and custom quota user is not", async () => {
      await contacts.table.checkRowExistByNameText(defaultQuotaUserDisplayName);
      await contacts.table.checkRowNotExist(customQuotaUserDisplayName);
    });

    await test.step("Remove filter and verify all users are visible again", async () => {
      await contacts.peopleFilter.removeFilter("Default quota");
      await contacts.table.checkRowExistByNameText(customQuotaUserDisplayName);
      await contacts.table.checkRowExistByNameText(defaultQuotaUserDisplayName);
    });
  });
});

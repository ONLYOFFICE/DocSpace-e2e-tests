import { Integration } from "@/src/objects/settings/integration/Integration";
import Contacts from "@/src/objects/contacts/Contacts";
import { PaymentApi } from "@/src/api/payment";
import { test } from "@/src/fixtures";

test.describe("Integration tests - LDAP", () => {
  let paymentApi: PaymentApi;
  let integration: Integration;
  let contacts: Contacts;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();

    integration = new Integration(page);
    contacts = new Contacts(page, api.portalDomain);

    await login.loginToPortal();
    await integration.open();
  });

  test("LDAP sync imports users into Contacts", async () => {
    await test.step("Enable LDAP", async () => {
      await integration.activateLdap();
    });

    await test.step("Manual sync", async () => {
      await integration.manualSyncLdap();
    });

    await test.step("Verify an LDAP user appears in Contacts", async () => {
      await contacts.open();
      await contacts.table.checkLdapUserExist();
    });
  });

  test("LDAP user filter is applied on save", async () => {
    const NON_MATCHING_FILTER = "(uid=__no_such_user__)";

    await test.step("Save LDAP with a non-matching user filter", async () => {
      await integration.activateLdapExpectNoUsers(NON_MATCHING_FILTER);
    });

    await test.step("Verify no LDAP user was imported", async () => {
      await contacts.open();
      await contacts.table.checkNoLdapUser();
    });
  });
});

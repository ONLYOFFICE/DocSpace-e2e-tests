import { test } from "@/src/fixtures";
import Contacts from "@/src/objects/contacts/Contacts";
import { ADMIN_OWNER_NAME } from "@/src/utils/constants/contacts";

test.describe("Contacts - Me label", () => {
  let contacts: Contacts;

  test.beforeEach(async ({ page, api, login }) => {
    contacts = new Contacts(page, api.portalDomain);
    await login.loginToPortal();
    await contacts.open();
  });

  test("Me label is shown in contacts table", async () => {
    await test.step("Verify Me label on current user row", async () => {
      await contacts.table.checkMeLabelVisible(ADMIN_OWNER_NAME);
    });
  });

  test("Me label is shown in info panel", async () => {
    await test.step("Open info panel", async () => {
      await contacts.infoPanel.open();
    });

    await test.step("Select current user row", async () => {
      await contacts.table.selectRowByNameText(ADMIN_OWNER_NAME);
    });

    await test.step("Verify Me label in info panel", async () => {
      await contacts.infoPanel.checkMeLabel();
    });
  });

  test.skip("[Bug 78363] Me label is shown in people selector", async () => {
    await test.step("Navigate to Groups tab", async () => {
      await contacts.openTab("Groups");
    });

    await test.step("Open Create group dialog and Add members selector", async () => {
      await contacts.navigation.openCreateGroupDialog();
      await contacts.groupDialog.openAddMembersSelector();
    });

    await test.step("Verify Me label on current user in people selector", async () => {
      await contacts.groupDialog.checkMeLabelOnContact(ADMIN_OWNER_NAME);
    });
  });
});

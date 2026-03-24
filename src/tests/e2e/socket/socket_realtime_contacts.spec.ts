import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Contacts from "@/src/objects/contacts/Contacts";
import { ADMIN_OWNER_NAME } from "@/src/utils/constants/contacts";

test.describe("Socket: real-time user appears on Contacts page", () => {
  let contacts: Contacts;

  test.beforeEach(async ({ page, api, login }) => {
    contacts = new Contacts(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("New user appears in contacts via socket", async ({ apiSdk }) => {
    let userEmail: string;

    await test.step("Open contacts page", async () => {
      await contacts.open();
      await contacts.table.checkRowExistByNameText(ADMIN_OWNER_NAME);
    });

    await test.step("Create user via API", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      userEmail = userData.email;
    });

    await test.step("New user appears in contacts list without reload", async () => {
      await expect(
        contacts.table.tableContainer.getByText(userEmail),
      ).toBeVisible({ timeout: 15000 });
    });
  });
});

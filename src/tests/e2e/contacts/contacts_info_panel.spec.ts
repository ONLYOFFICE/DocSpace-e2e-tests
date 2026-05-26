import { test } from "@/src/fixtures";
import Contacts from "@/src/objects/contacts/Contacts";
import { ADMIN_OWNER_NAME } from "@/src/utils/constants/contacts";

test.describe("Contacts - Info panel", () => {
  let contacts: Contacts;

  test.beforeEach(async ({ page, api, login }) => {
    contacts = new Contacts(page, api.portalDomain);
    await login.loginToPortal();
    await contacts.open();
  });

  test("Info panel shows owner data fields", async () => {
    await test.step("Open info panel and select owner", async () => {
      await contacts.infoPanel.open();
      await contacts.table.selectRowByNameText(ADMIN_OWNER_NAME);
    });

    await test.step("Check 'Me' label is visible", async () => {
      await contacts.infoPanel.checkMeLabel();
    });

    await test.step("Check owner icon is visible on avatar", async () => {
      await contacts.infoPanel.checkOwnerIcon();
    });

    await test.step("Check Account status is Active", async () => {
      await contacts.infoPanel.checkAccountStatus("Active");
    });

    await test.step("Check Type is Owner", async () => {
      await contacts.infoPanel.checkUserType("Owner");
    });

    await test.step("Check Registration date is visible", async () => {
      await contacts.infoPanel.checkRegistrationDateVisible();
    });

    await test.step("Check Status is Paid", async () => {
      await contacts.infoPanel.checkStatus("Paid");
    });
  });

  test("Info panel shows DocSpace admin data fields", async ({ apiSdk }) => {
    const { userData } = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );
    const userName = `${userData.firstName} ${userData.lastName}`;

    await test.step("Open info panel and select DocSpace admin", async () => {
      await contacts.infoPanel.open();
      await contacts.table.selectRowByNameText(userName);
    });

    await test.step("Check admin icon is visible on avatar", async () => {
      await contacts.infoPanel.checkAdminIcon();
    });

    await test.step("Check Account status is Active", async () => {
      await contacts.infoPanel.checkAccountStatus("Active");
    });

    await test.step("Check Type is DocSpace admin", async () => {
      await contacts.infoPanel.checkUserType("DocSpace admin");
    });

    await test.step("Check Registration date is visible", async () => {
      await contacts.infoPanel.checkRegistrationDateVisible();
    });

    await test.step("Check Status is Paid", async () => {
      await contacts.infoPanel.checkStatus("Paid");
    });
  });

  test("Info panel shows user data fields", async ({ apiSdk }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    const userName = `${userData.firstName} ${userData.lastName}`;

    await test.step("Open info panel and select user", async () => {
      await contacts.infoPanel.open();
      await contacts.table.selectRowByNameText(userName);
    });

    await test.step("Check Account status is Active", async () => {
      await contacts.infoPanel.checkAccountStatus("Active");
    });

    await test.step("Check Type is User", async () => {
      await contacts.infoPanel.checkUserType("User");
    });

    await test.step("Check Registration date is visible", async () => {
      await contacts.infoPanel.checkRegistrationDateVisible();
    });

    await test.step("Check Status is Free", async () => {
      await contacts.infoPanel.checkStatus("Free");
    });
  });
});

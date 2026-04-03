import { test } from "@/src/fixtures";
import Contacts from "@/src/objects/contacts/Contacts";
import {
  contactTypes,
  menuItemChangeUserType,
} from "@/src/utils/constants/contacts";

test.describe("Role management", () => {
  let contacts: Contacts;
  let userName: string;

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    contacts = new Contacts(page, api.portalDomain);

    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    userName = `${userData.firstName} ${userData.lastName}`;

    await login.loginToPortal();
    await contacts.open();
  });

  test("Change role: User to Room admin", async () => {
    await contacts.openChangeContactTypeDialog(
      userName,
      menuItemChangeUserType.roomAdmin,
    );
    await contacts.submitChangeContactTypeDialog();
    await contacts.table.checkContactType(userName, contactTypes.roomAdmin);
  });

  test("Change role: User to DocSpace admin", async () => {
    await contacts.openChangeContactTypeDialog(
      userName,
      menuItemChangeUserType.docspaceAdmin,
    );
    await contacts.submitChangeContactTypeDialog();
    await contacts.table.checkContactType(userName, contactTypes.docspaceAdmin);
  });

  test("Change role: User to Guest", async () => {
    await contacts.openChangeContactTypeDialog(
      userName,
      menuItemChangeUserType.guest,
    );
    await contacts.submitChangeContactTypeDialog();
    await contacts.openTab("Guests");
    await contacts.table.checkRowExist(userName);
  });

  test("Disable and enable user", async () => {
    await contacts.table.selectRow(userName);
    await contacts.disableUser();
    await contacts.table.checkDisabledUserExist(userName);
    await contacts.table.selectRow(userName);
    await contacts.enableUser();
  });
});

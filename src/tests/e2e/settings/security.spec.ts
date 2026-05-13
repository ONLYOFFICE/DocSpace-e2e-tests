import { PaymentApi } from "@/src/api/payment";
import Security from "@/src/objects/settings/security/Security";
import Contacts from "@/src/objects/contacts/Contacts";
import MyRooms from "@/src/objects/rooms/Rooms";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import { Login } from "@/src/objects/common/Login";
import {
  setupIncognitoContext,
  cleanupIncognitoContext,
} from "@/src/utils/helpers/linkTest";
import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import { getPortalUrl } from "@/config";

test.describe("Security tests", () => {
  let paymentApi: PaymentApi;

  let security: Security;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();

    security = new Security(page);

    await login.loginToPortal();
    await security.open();
  });

  test("Password strength", async () => {
    await test.step("Update password strength to 17", async () => {
      await security.updatePasswordStrength(17);
      await expect(security.passwordStrengthInput).toHaveValue("17");
    });

    await test.step("Update password strength to 8", async () => {
      await security.updatePasswordStrength(8);
      await expect(security.passwordStrengthInput).toHaveValue("8");
    });
  });

  test("Trusted mail domain", async () => {
    await test.step("Any domains activation", async () => {
      await security.anyDomainsActivation();
      await expect(security.anyDomains.locator("input")).toBeChecked();
    });

    await test.step("Custom domains activation", async () => {
      await security.customDomainsActivation();
      await expect(security.customDomains.locator("input")).toBeChecked();
    });

    await test.step("Disable domains", async () => {
      await security.disableDomains();
      await expect(security.disabledDomains.locator("input")).toBeChecked();
    });
  });

  test("Trusted mail domain: self-registration blocked for disallowed domain", async ({
    api,
    browser,
  }) => {
    const disallowedEmail = `user_${Date.now()}@notallowed.test`;

    await test.step("Enable Custom domains with gmail.com", async () => {
      await security.customDomainsActivation();
      await expect(security.customDomains.locator("input")).toBeChecked();
    });

    const { context: incognitoContext, page: incognitoPage } =
      await setupIncognitoContext(browser);

    try {
      const guestLogin = new Login(incognitoPage, api.portalDomain);
      await guestLogin.openLoginPage();
      await guestLogin.requestSelfRegistration(disallowedEmail);
      await guestLogin.expectSelfRegistrationBlocked();
    } finally {
      await cleanupIncognitoContext(incognitoContext, incognitoPage);
    }
  });

  test("Trusted mail domain: self-registration allowed for allowed domain", async ({
    api,
    browser,
  }) => {
    const allowedEmail = `user_${Date.now()}@gmail.com`;

    await test.step("Enable Custom domains with gmail.com", async () => {
      await security.customDomainsActivation();
      await expect(security.customDomains.locator("input")).toBeChecked();
    });

    const { context: incognitoContext, page: incognitoPage } =
      await setupIncognitoContext(browser);

    try {
      const guestLogin = new Login(incognitoPage, api.portalDomain);
      await guestLogin.openLoginPage();
      await guestLogin.requestSelfRegistration(allowedEmail);
      await guestLogin.expectSelfRegistrationSent();
    } finally {
      await cleanupIncognitoContext(incognitoContext, incognitoPage);
    }
  });

  test("Ip security", async () => {
    await test.step("Ip activation", async () => {
      await security.ipActivation();
      await expect(security.ipSecurityEnabled.locator("input")).toBeChecked();
    });
    await test.step("Ip deactivation", async () => {
      await security.ipDeactivation();
      await expect(security.ipSecurityDisabled.locator("input")).toBeChecked();
    });
  });

  test("Brute force", async () => {
    await test.step("Brute force activation", async () => {
      await security.bruteForceActivation();
      await expect(security.numberOfAttempts).toHaveValue("2");
      await expect(security.blickingTime).toHaveValue("30");
      await expect(security.checkPeriod).toHaveValue("30");
    });

    await test.step("Restore to default", async () => {
      await security.restoreToDefaultButton.click();
      await expect(security.numberOfAttempts).toHaveValue("5");
    });
  });

  test("Administrator message", async () => {
    await test.step("Admin message activation", async () => {
      await security.adminMessageActivation();
      await expect(security.adminMessageEnable.locator("input")).toBeChecked();
    });

    await test.step("Admin message deactivation", async () => {
      await security.adminMessageDeactivation();
      await expect(
        security.adminMessageDisabled.locator("input"),
      ).toBeChecked();
    });
  });

  test("Session lifetime", async () => {
    await test.step("Session lifetime activation", async () => {
      await security.sessionLifetimeActivation();
      await expect(security.lifetimeEnable.locator("input")).toBeChecked();
      await expect(security.lifetimeInput).toHaveValue("60");
    });

    await test.step("Session lifetime deactivation", async () => {
      await security.sessionLifetimeDeactivation();
      await expect(security.lifetimeDisabled.locator("input")).toBeChecked();
    });
  });

  test("Developer Tools section", async ({ page, api, apiSdk, login }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "User");

    await test.step("Owner disables Developer Tools section", async () => {
      await security.disableDeveloperTools();
      await expect(
        security.developerToolsDisabled.locator("input"),
      ).toBeChecked();
    });

    await test.step("Owner logs out", async () => {
      await login.logout();
    });

    await test.step("Login as User", async () => {
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("User opens Developer Tools URL and gets 403", async () => {
      await page.goto(
        `${getPortalUrl(api.portalDomain)}/developer-tools/javascript-sdk`,
      );
      await page.waitForURL(/\/error\/403/);
    });
  });

  test("Security guide links", async ({ page }) => {
    await test.step("Password strength guide link", async () => {
      const page1Promise = page.waitForEvent("popup", { timeout: 30000 });
      await security.passwordStrengthGuideLink.click();
      const page1 = await page1Promise;
      await page1.waitForURL(
        "https://helpcenter.onlyoffice.com/docspace/configuration/docspace-security-settings.aspx#passwordstrengthsettings_block",
      );
      await page1.close();
    });

    await test.step("Two factor authentication guide link", async () => {
      const page2Promise = page.waitForEvent("popup", { timeout: 30000 });
      await security.twoFactorAuthenticationGuideLink.click();
      const page2 = await page2Promise;
      await page2.waitForURL(
        "https://helpcenter.onlyoffice.com/docspace/configuration/docspace-two-factor-authentication.aspx",
      );
      await page2.close();
    });

    await test.step("Trusted domain guide link", async () => {
      const page3Promise = page.waitForEvent("popup", { timeout: 30000 });
      await security.trustedDomainGuideLink.click();
      const page3 = await page3Promise;
      await page3.waitForURL(
        "https://helpcenter.onlyoffice.com/docspace/configuration/docspace-security-settings.aspx#trustedmaildomainsettings_block",
      );
      await page3.close();
    });

    await test.step("IP security guide link", async () => {
      const page4Promise = page.waitForEvent("popup", { timeout: 30000 });
      await security.ipSecurityGuideLink.click();
      const page4 = await page4Promise;
      await page4.waitForURL(
        "https://helpcenter.onlyoffice.com/docspace/configuration/docspace-security-settings.aspx#ipsecuritysettings_block",
      );
      await page4.close();
    });

    await test.step("Brute force guide link", async () => {
      const page5Promise = page.waitForEvent("popup", { timeout: 30000 });
      await security.bruteForceGuideLink.click();
      const page5 = await page5Promise;
      await page5.waitForURL(
        "https://helpcenter.onlyoffice.com/docspace/configuration/docspace-security-settings.aspx#bruteforceprotectionsettings_block",
      );
      await page5.close();
    });

    await test.step("Admin message guide link", async () => {
      const page6Promise = page.waitForEvent("popup", { timeout: 30000 });
      await security.adminMessageGuideLink.click();
      const page6 = await page6Promise;
      await page6.waitForURL(
        "https://helpcenter.onlyoffice.com/docspace/configuration/docspace-security-settings.aspx#administratormessagesettings_block",
      );
      await page6.close();
    });

    await test.step("Session lifetime guide link", async () => {
      const page7Promise = page.waitForEvent("popup", { timeout: 30000 });
      await security.sessionLifetimeGuideLink.click();
      const page7 = await page7Promise;
      await page7.waitForURL(
        "https://helpcenter.onlyoffice.com/docspace/configuration/docspace-security-settings.aspx#sessionlifetime_block",
      );
      await page7.close();
    });
  });

  test("Login history", async ({ page }) => {
    await test.step("Open Login History tab", async () => {
      await security.openTab("Login History");
      await expect(
        page.locator("text=Successful Login via API").first(),
      ).toHaveText("Successful Login via API", { timeout: 10000 });
    });
  });

  test("Audit trail", async ({ page }) => {
    await test.step("Open Audit Trail tab", async () => {
      await security.openTab("Audit Trail");
      await expect(page.locator("text=Language Updated").first()).toHaveText(
        "Language Updated",
        { timeout: 10000 },
      );
    });
  });

  test("Invite DocSpace members via Contacts disabled", async ({
    page,
    api,
  }) => {
    const contacts = new Contacts(page, api.portalDomain);

    await test.step("Disable invitation via Contacts and save", async () => {
      await security.setInviteViaContacts(false);
      await security.saveInvitationSettings();
    });

    await test.step("Open Contacts and check + button is hidden", async () => {
      await contacts.open();
      await expect(page.locator("#header_add-button")).toBeHidden();
    });
  });

  test("Allow inviting guests to rooms disabled", async ({
    page,
    api,
    apiSdk,
  }) => {
    const roomName = "Custom Room for invitation test";
    const externalEmail = "outsider@guest.test";

    await test.step("Disable allow inviting guests and save", async () => {
      await security.setAllowInvitingGuests(false);
      await security.saveInvitationSettings();
    });

    await test.step("Precondition: create a Custom room via API", async () => {
      await apiSdk.rooms.createRoom("owner", {
        title: roomName,
        roomType: "CustomRoom",
      });
    });

    const myRooms = new MyRooms(page, api.portalDomain);
    const roomInfoPanel = new RoomInfoPanel(page);
    const roomsInviteDialog = new RoomsInviteDialog(page);

    await test.step("Open invite dialog inside the room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
    });

    await test.step("Type external email and verify 'No users found'", async () => {
      await roomsInviteDialog.fillSearchInviteInput(externalEmail);
      await roomsInviteDialog.expectNoUsersFound();
    });
  });

  test("Allow inviting guests to rooms enabled", async ({
    page,
    api,
    apiSdk,
  }) => {
    const roomName = "Custom Room for invitation test";
    const externalEmail = "outsider@guest.test";

    await test.step("Enable allow inviting guests and save", async () => {
      await security.setAllowInvitingGuests(true);
      await security.saveInvitationSettings();
    });

    await test.step("Precondition: create a Custom room via API", async () => {
      await apiSdk.rooms.createRoom("owner", {
        title: roomName,
        roomType: "CustomRoom",
      });
    });

    const myRooms = new MyRooms(page, api.portalDomain);
    const roomInfoPanel = new RoomInfoPanel(page);
    const roomsInviteDialog = new RoomsInviteDialog(page);

    await test.step("Open invite dialog inside the room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
    });

    await test.step("Type external email and verify 'Invite as guest' option appears", async () => {
      await roomsInviteDialog.fillSearchInviteInput(externalEmail);
      await roomsInviteDialog.expectInviteAsGuestVisible();
    });
  });
});

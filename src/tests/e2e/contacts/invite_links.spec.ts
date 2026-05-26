import { test } from "@/src/fixtures";
import Contacts from "@/src/objects/contacts/Contacts";
import RoomInviteLogin from "@/src/objects/rooms/RoomInviteLogin";
import RoomGuestRegistration from "@/src/objects/rooms/RoomGuestRegistration";
import { contactsActionsMenu } from "@/src/utils/constants/contacts";
import { expect, BrowserContext, Page } from "@playwright/test";
import {
  setupIncognitoContext,
  cleanupIncognitoContext,
  ensureIncognitoPage,
} from "@/src/utils/helpers/linkTest";

const ALREADY_INVITED_ERROR =
  "You have already been invited. Please complete the registration using the link from the email.";

test.describe("Contacts - Invite links", () => {
  let contacts: Contacts;
  let incognitoContext: BrowserContext | null = null;
  let incognitoPage: Page | null = null;

  const invite = contactsActionsMenu.invite;

  test.beforeEach(async ({ page, api, login }) => {
    contacts = new Contacts(page, api.portalDomain);
    await login.loginToPortal();
    await contacts.open();
  });

  test.afterEach(async () => {
    await cleanupIncognitoContext(incognitoContext, incognitoPage);
    incognitoContext = null;
    incognitoPage = null;
  });

  test("Generate invite link for DocSpace admin", async () => {
    await test.step("Open invite dialog as DocSpace admin", async () => {
      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.docspaceAdmin,
      );
    });

    await test.step("Enable invite via link", async () => {
      await contacts.inviteDialog.enableInviteViaLink();
    });

    await test.step("Verify 'Link copied to clipboard' toast appears", async () => {
      await contacts.inviteDialog.checkLinkCopiedToast();
      await contacts.inviteDialog.dismissLinkCopiedToast();
    });

    await test.step("Verify invite link is displayed", async () => {
      await contacts.inviteDialog.checkInviteLinkVisible();
      const link = await contacts.inviteDialog.getInviteLinkValue();
      expect(link).toContain("/s/");
    });
  });

  test("Generate invite link for Room admin", async () => {
    await test.step("Open invite dialog as Room admin", async () => {
      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.roomAdmin,
      );
    });

    await test.step("Enable invite via link", async () => {
      await contacts.inviteDialog.enableInviteViaLink();
    });

    await test.step("Verify 'Link copied to clipboard' toast appears", async () => {
      await contacts.inviteDialog.checkLinkCopiedToast();
      await contacts.inviteDialog.dismissLinkCopiedToast();
    });

    await test.step("Verify invite link is displayed", async () => {
      await contacts.inviteDialog.checkInviteLinkVisible();
      const link = await contacts.inviteDialog.getInviteLinkValue();
      expect(link).toContain("/s/");
    });
  });

  test("Generate invite link for User", async () => {
    await test.step("Open invite dialog as User", async () => {
      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.user,
      );
    });

    await test.step("Enable invite via link", async () => {
      await contacts.inviteDialog.enableInviteViaLink();
    });

    await test.step("Verify 'Link copied to clipboard' toast appears", async () => {
      await contacts.inviteDialog.checkLinkCopiedToast();
      await contacts.inviteDialog.dismissLinkCopiedToast();
    });

    await test.step("Verify invite link is displayed", async () => {
      await contacts.inviteDialog.checkInviteLinkVisible();
      const link = await contacts.inviteDialog.getInviteLinkValue();
      expect(link).toContain("/s/");
    });
  });

  test("Set user limit in invite link settings", async () => {
    await test.step("Open invite dialog and enable invite via link", async () => {
      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.docspaceAdmin,
      );
      await contacts.inviteDialog.enableInviteViaLink();
      await contacts.inviteDialog.checkLinkCopiedToast();
      await contacts.inviteDialog.dismissLinkCopiedToast();
    });

    await test.step("Open invite link settings panel", async () => {
      await contacts.inviteDialog.openInviteLinkSettings();
    });

    await test.step("Enable and set user limit", async () => {
      await contacts.inviteDialog.inviteLinkSettings.clickUserLimitToggle();
      await contacts.inviteDialog.inviteLinkSettings.fillUserLimit("10");
    });

    await test.step("Save and copy link settings", async () => {
      await contacts.inviteDialog.saveAndCopyInviteLinkSettings();
    });
  });

  test("Change invite link expiration date", async () => {
    await test.step("Open invite dialog and enable invite via link", async () => {
      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.docspaceAdmin,
      );
      await contacts.inviteDialog.enableInviteViaLink();
      await contacts.inviteDialog.checkLinkCopiedToast();
      await contacts.inviteDialog.dismissLinkCopiedToast();
    });

    await test.step("Open invite link settings panel", async () => {
      await contacts.inviteDialog.openInviteLinkSettings();
    });

    await test.step("Change expiration date to tomorrow", async () => {
      await expect(
        contacts.inviteDialog.inviteLinkSettings.datePicker,
      ).toBeVisible();
      await contacts.inviteDialog.inviteLinkSettings.removeDatePicker();
      await contacts.inviteDialog.inviteLinkSettings.selectTomorrow();
    });

    await test.step("Save and copy link settings", async () => {
      await contacts.inviteDialog.saveAndCopyInviteLinkSettings();
    });
  });

  test("DocSpace admin joins portal via invite link", async ({
    page,
    browser,
  }) => {
    const guestData = {
      firstName: "DocSpaceAdmin",
      lastName: "InviteTest",
      password: "TestPassword123!",
      email: `ds_admin_invite_${Date.now()}@test.com`,
    };

    await test.step("Open invite dialog and enable invite via link", async () => {
      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.docspaceAdmin,
      );
      await contacts.inviteDialog.enableInviteViaLink();
    });

    await test.step("Verify 'Link copied to clipboard' toast appears", async () => {
      await contacts.inviteDialog.checkLinkCopiedToast();
      await contacts.inviteDialog.dismissLinkCopiedToast();
    });

    let inviteLink: string;

    await test.step("Get invite link from input", async () => {
      inviteLink = await contacts.inviteDialog.getInviteLinkValue();
    });

    await test.step("Open invite link in incognito and register", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;

      await incognitoPage.goto(inviteLink, { waitUntil: "load" });

      const inviteLogin = new RoomInviteLogin(incognitoPage);
      await inviteLogin.fillEmail(guestData.email);
      await inviteLogin.clickContinue();

      ensureIncognitoPage(incognitoPage);
      const registration = new RoomGuestRegistration(incognitoPage);
      await registration.register(
        guestData.firstName,
        guestData.lastName,
        guestData.password,
      );

      await incognitoPage.waitForURL(/.*rooms.*/, { waitUntil: "load" });
    });

    await test.step("Verify user appears in contacts", async () => {
      await page.reload({ waitUntil: "load" });
      await contacts.table.checkRowExistByNameText(
        `${guestData.firstName} ${guestData.lastName}`,
      );
    });
  });

  test("Room admin joins portal via invite link", async ({ page, browser }) => {
    const guestData = {
      firstName: "RoomAdmin",
      lastName: "InviteTest",
      password: "TestPassword123!",
      email: `room_admin_invite_${Date.now()}@test.com`,
    };

    await test.step("Open invite dialog as Room admin", async () => {
      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.roomAdmin,
      );
    });

    await test.step("Enable invite via link", async () => {
      await contacts.inviteDialog.enableInviteViaLink();
    });

    await test.step("Verify 'Link copied to clipboard' toast appears", async () => {
      await contacts.inviteDialog.checkLinkCopiedToast();
      await contacts.inviteDialog.dismissLinkCopiedToast();
    });

    let inviteLink: string;

    await test.step("Get invite link from input", async () => {
      inviteLink = await contacts.inviteDialog.getInviteLinkValue();
    });

    await test.step("Open invite link in incognito and register", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;

      await incognitoPage.goto(inviteLink, { waitUntil: "load" });

      const inviteLogin = new RoomInviteLogin(incognitoPage);
      await inviteLogin.fillEmail(guestData.email);
      await inviteLogin.clickContinue();

      ensureIncognitoPage(incognitoPage);
      const registration = new RoomGuestRegistration(incognitoPage);
      await registration.register(
        guestData.firstName,
        guestData.lastName,
        guestData.password,
      );

      await incognitoPage.waitForURL(/.*rooms.*/, { waitUntil: "load" });
    });

    await test.step("Verify user appears in contacts", async () => {
      await page.reload({ waitUntil: "load" });
      await contacts.table.checkRowExistByNameText(
        `${guestData.firstName} ${guestData.lastName}`,
      );
    });
  });

  test("User joins portal via invite link", async ({ page, browser }) => {
    const guestData = {
      firstName: "UserRole",
      lastName: "InviteTest",
      password: "TestPassword123!",
      email: `user_invite_${Date.now()}@test.com`,
    };

    await test.step("Open invite dialog for User role", async () => {
      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.user,
      );
    });

    await test.step("Enable invite via link", async () => {
      await contacts.inviteDialog.enableInviteViaLink();
    });

    await test.step("Verify 'Link copied to clipboard' toast appears", async () => {
      await contacts.inviteDialog.checkLinkCopiedToast();
      await contacts.inviteDialog.dismissLinkCopiedToast();
    });

    let inviteLink: string;

    await test.step("Get invite link from input", async () => {
      inviteLink = await contacts.inviteDialog.getInviteLinkValue();
    });

    await test.step("Open invite link in incognito and register", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;

      await incognitoPage.goto(inviteLink, { waitUntil: "load" });

      const inviteLogin = new RoomInviteLogin(incognitoPage);
      await inviteLogin.fillEmail(guestData.email);
      await inviteLogin.clickContinue();

      ensureIncognitoPage(incognitoPage);
      const registration = new RoomGuestRegistration(incognitoPage);
      await registration.register(
        guestData.firstName,
        guestData.lastName,
        guestData.password,
      );

      await incognitoPage.waitForURL(/.*rooms.*/, { waitUntil: "load" });
    });

    await test.step("Verify user appears in contacts", async () => {
      await page.reload({ waitUntil: "load" });
      await contacts.table.checkRowExistByNameText(
        `${guestData.firstName} ${guestData.lastName}`,
      );
    });
  });

  test("Invite link is unavailable after user limit is exceeded", async ({
    browser,
  }) => {
    const guestData = {
      firstName: "InviteLimitGuest",
      lastName: "TestUser",
      password: "TestPassword123!",
      email: `invite_limit_guest_${Date.now()}@test.com`,
    };

    await test.step("Open invite dialog and enable invite via link with user limit 1", async () => {
      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.user,
      );
      await contacts.inviteDialog.enableInviteViaLink();
      await contacts.inviteDialog.checkLinkCopiedToast();
      await contacts.inviteDialog.dismissLinkCopiedToast();
      await contacts.inviteDialog.openInviteLinkSettings();
      await contacts.inviteDialog.inviteLinkSettings.clickUserLimitToggle();
      await contacts.inviteDialog.inviteLinkSettings.fillUserLimit("1");
      await contacts.inviteDialog.saveAndCopyInviteLinkSettings();
    });

    let inviteLink: string;

    await test.step("Get invite link from input", async () => {
      inviteLink = await contacts.inviteDialog.getInviteLinkValue();
    });

    await test.step("First user registers via invite link", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;

      await incognitoPage.goto(inviteLink, { waitUntil: "load" });

      const inviteLogin = new RoomInviteLogin(incognitoPage);
      await inviteLogin.fillEmail(guestData.email);
      await inviteLogin.clickContinue();

      ensureIncognitoPage(incognitoPage);
      const registration = new RoomGuestRegistration(incognitoPage);
      await registration.register(
        guestData.firstName,
        guestData.lastName,
        guestData.password,
      );

      await incognitoPage.waitForURL(/.*rooms.*/, { waitUntil: "load" });
    });

    await test.step("Close first incognito session", async () => {
      await cleanupIncognitoContext(incognitoContext, incognitoPage);
      incognitoContext = null;
      incognitoPage = null;
    });

    await test.step("Second user sees 'Link no longer available'", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;

      await incognitoPage.goto(inviteLink, { waitUntil: "load" });

      await expect(
        incognitoPage.getByText("Link no longer available"),
      ).toBeVisible();
    });
  });

  test("Disable invite link", async ({ browser }) => {
    let inviteLink: string;

    await test.step("Open invite dialog and enable invite via link", async () => {
      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.user,
      );
      await contacts.inviteDialog.enableInviteViaLink();
      await contacts.inviteDialog.checkLinkCopiedToast();
      await contacts.inviteDialog.dismissLinkCopiedToast();
    });

    await test.step("Save link and verify it is visible", async () => {
      inviteLink = await contacts.inviteDialog.getInviteLinkValue();
      await contacts.inviteDialog.checkInviteLinkVisible();
    });

    await test.step("Disable invite via link", async () => {
      await contacts.inviteDialog.disableInviteViaLink();
      await contacts.inviteDialog.checkInviteLinkNotVisible();
    });

    await test.step("Verify disabled link is no longer available", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;

      await incognitoPage.goto(inviteLink, { waitUntil: "load" });

      await expect(incognitoPage.getByText("Invalid link")).toBeVisible();
    });
  });

  test("[Bug 81017] Pending user sees error when joining portal via general invite link", async ({
    apiSdk,
    browser,
  }) => {
    const pendingEmail = `pending_invite_${Date.now()}@test.com`;

    await test.step("Invite user by email to create a pending entry", async () => {
      await apiSdk.profiles.inviteUser("owner", {
        type: "4",
        email: pendingEmail,
      });
    });

    await test.step("Open invite dialog for User role and enable invite via link", async () => {
      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.user,
      );
      await contacts.inviteDialog.enableInviteViaLink();
      await contacts.inviteDialog.checkLinkCopiedToast();
      await contacts.inviteDialog.dismissLinkCopiedToast();
    });

    let inviteLink: string;

    await test.step("Get general invite link", async () => {
      inviteLink = await contacts.inviteDialog.getInviteLinkValue();
    });

    await test.step("Open general invite link in incognito and enter pending user email", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;

      await incognitoPage.goto(inviteLink, { waitUntil: "load" });

      const inviteLogin = new RoomInviteLogin(incognitoPage);
      await inviteLogin.fillEmail(pendingEmail);
      await inviteLogin.clickContinue();
    });

    await test.step("Verify error message is shown and Continue button is disabled", async () => {
      await expect(incognitoPage!.getByText(ALREADY_INVITED_ERROR)).toBeVisible(
        { timeout: 10000 },
      );
      const inviteLogin = new RoomInviteLogin(incognitoPage!);
      await expect(inviteLogin.continueButton).toBeDisabled();
    });
  });

  test("[Bug 80334] Existing user can log in via invite link by pressing Enter on password field", async ({
    apiSdk,
    browser,
  }) => {
    const { userData } = await apiSdk.profiles.addMember("owner", "User");

    await test.step("Open invite dialog for User role and enable invite via link", async () => {
      await contacts.navigation.clickHeaderSubmenuOption(
        invite.label,
        invite.submenu.user,
      );
      await contacts.inviteDialog.enableInviteViaLink();
      await contacts.inviteDialog.checkLinkCopiedToast();
      await contacts.inviteDialog.dismissLinkCopiedToast();
    });

    let inviteLink: string;

    await test.step("Get general invite link", async () => {
      inviteLink = await contacts.inviteDialog.getInviteLinkValue();
    });

    await test.step("Open invite link in incognito, enter credentials and submit with Enter", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;

      await incognitoPage.goto(inviteLink, { waitUntil: "load" });

      const inviteLogin = new RoomInviteLogin(incognitoPage);
      await inviteLogin.fillEmail(userData.email);
      await inviteLogin.clickContinue();
      await inviteLogin.fillPassword(userData.password);
      await inviteLogin.submitPasswordWithEnter();
    });

    await test.step("Verify user is authorized on the portal", async () => {
      await expect(async () => {
        await expect(incognitoPage!).toHaveURL(/.*rooms\/shared\/filter.*/);
      }).toPass({ timeout: 30000 });
    });
  });
});

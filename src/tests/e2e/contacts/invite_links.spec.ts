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
});

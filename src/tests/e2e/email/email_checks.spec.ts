import config, { getPortalUrl } from "@/config";
import { expect, BrowserContext, Page } from "@playwright/test";
import { PaymentApi } from "@/src/api/payment";
import { test } from "@/src/fixtures";
import Contacts from "@/src/objects/contacts/Contacts";
import { Profile } from "@/src/objects/profile/Profile";
import Customization from "@/src/objects/settings/customization/Customization";
import Deletion from "@/src/objects/settings/deletion/Deletion";
import RoomGuestRegistration from "@/src/objects/rooms/RoomGuestRegistration";
import RoomInviteLogin from "@/src/objects/rooms/RoomInviteLogin";
import {
  contactsActionsMenu,
  TUserEmail,
} from "@/src/utils/constants/contacts";
import { toastMessages } from "@/src/utils/constants/settings";
import { createMailChecker } from "@/src/utils/helpers/email/createMailChecker";
import { getOwnerConfirmLink } from "@/src/utils/helpers/email/getOwnerConfirmLink";
import {
  setupIncognitoContext,
  cleanupIncognitoContext,
} from "@/src/utils/helpers/linkTest";

test.describe("Email Checks", () => {
  const defaultOwnerEmail = config.DOCSPACE_OWNER_EMAIL;

  test.beforeAll(() => {
    config.DOCSPACE_OWNER_EMAIL = defaultOwnerEmail.replace("@", "+alias1@");
  });

  test.afterAll(() => {
    config.DOCSPACE_OWNER_EMAIL = defaultOwnerEmail;
  });

  test.describe("Customization", () => {
    let paymentApi: PaymentApi;
    let customization: Customization;

    test.beforeEach(async ({ page, api }) => {
      paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);

      await paymentApi.setupPayment();
      customization = new Customization(page);
    });

    test("Rename portal email notification", async ({ api, page, login }) => {
      const confirmLink = await getOwnerConfirmLink(api.portalDomain);
      const domainSuffix = api.portalDomain.replace(/^[^.]+/, "");
      await page.goto(confirmLink, { waitUntil: "load" });
      await login.loginToPortal();
      await customization.open();

      const { originalName, newName } = await customization.renamePortal();

      const newDomain = `${newName}${domainSuffix}`;
      // Update teardown target so fixture cleanup can delete the renamed portal if the test fails.
      api.apisystem.setPortalDomain(newDomain);
      api.apisystem.setPortalName(newName);
      await page.waitForURL(`${getPortalUrl(newDomain)}/rooms/shared/**`, {
        timeout: 30000,
      });
      await page.waitForLoadState("domcontentloaded");

      const mailChecker = createMailChecker();
      const email = await mailChecker.checkEmailBySubject({
        subject: "Change of portal address",
        timeoutSeconds: 60,
      });

      expect(email).toBeTruthy();

      await customization.renamePortalBack(originalName);
      const originalDomain = `${originalName}${domainSuffix}`;
      api.apisystem.setPortalDomain(originalDomain);
      api.apisystem.setPortalName(originalName);
      await page.waitForURL(`${getPortalUrl(originalDomain)}/**`, {
        timeout: 30000,
        waitUntil: "load",
      });
    });

    test.skip("Brand name email notification", async ({ api, page, login }) => {
      const confirmLink = await getOwnerConfirmLink(api.portalDomain);
      const profile = new Profile(page);

      await page.goto(confirmLink, { waitUntil: "load" });
      await login.loginToPortal();
      await customization.open();

      await customization.openTab("Branding");
      await customization.textInputBrandName.first().fill("autoTest");
      await customization.brandNameSaveButton.click();
      await customization.removeToast(toastMessages.settingsUpdated);

      await profile.open();
      await profile.changePassword();

      const mailChecker = createMailChecker();
      const email = await mailChecker.checkEmailBySenderAndSubject({
        subject: "Confirm changing your password",
        sender: "autoTest",
      });

      expect(email).toBeTruthy();
    });
  });

  test.describe("Profile", () => {
    let profile: Profile;

    test.beforeEach(async ({ page, api, login }) => {
      const confirmLink = await getOwnerConfirmLink(api.portalDomain);
      await createMailChecker().deleteAllMatchingEmails();
      profile = new Profile(page);

      await page.goto(confirmLink, { waitUntil: "load" });
      await login.loginToPortal();
      await profile.open();
    });

    test("Owner email is confirmed after portal registration", async () => {
      await profile.expectEmailConfirmed();
    });

    test("Change password email notification", async () => {
      await test.step("Request password change from profile", async () => {
        await profile.changePassword();
      });

      await test.step("Verify password change email is received", async () => {
        const mailChecker = createMailChecker();
        const email = await mailChecker.checkEmailBySubject({
          subject: "Confirm changing your password",
          timeoutSeconds: 60,
        });

        expect(email).toBeTruthy();
      });
    });
  });

  test.describe("Portal lifecycle", () => {
    let deletion: Deletion;

    test.beforeEach(async ({ page, api, login }) => {
      const confirmLink = await getOwnerConfirmLink(api.portalDomain);
      await createMailChecker().deleteAllMatchingEmails();
      deletion = new Deletion(page);

      await page.goto(confirmLink, { waitUntil: "load" });
      await login.loginToPortal();
      await deletion.open();
    });

    test("Deactivate portal email notification", async () => {
      await test.step("Request portal deactivation", async () => {
        await deletion.requestDeactivation();
      });

      await test.step("Verify deactivation email is received", async () => {
        const mailChecker = createMailChecker();
        const email = await mailChecker.checkEmailBySubject({
          subject: "Deactivation of the",
          timeoutSeconds: 60,
        });

        expect(email).toBeTruthy();
      });
    });

    test("Delete portal email notification", async () => {
      await test.step("Request portal deletion", async () => {
        await deletion.requestDeletion();
      });

      await test.step("Verify deletion email is received", async () => {
        const mailChecker = createMailChecker();
        const email = await mailChecker.checkEmailBySubject({
          subject: "Deletion of the",
          timeoutSeconds: 60,
        });

        expect(email).toBeTruthy();
      });
    });
  });

  test.describe("Contacts", () => {
    let contacts: Contacts;

    test.beforeEach(async ({ page, api, login }) => {
      const confirmLink = await getOwnerConfirmLink(api.portalDomain);
      await createMailChecker().deleteAllMatchingEmails();
      contacts = new Contacts(page, api.portalDomain);

      await page.goto(confirmLink, { waitUntil: "load" });
      await login.loginToPortal();
      await contacts.open();
    });

    test("Invite user email notification", async () => {
      const invitedEmail = config.DOCSPACE_OWNER_EMAIL.replace(
        "+alias1@",
        "+invited@",
      );

      await test.step("Invite user from contacts", async () => {
        await contacts.inviteUser(
          invitedEmail as TUserEmail,
          contactsActionsMenu.invite.submenu.user,
        );
      });

      await test.step("Verify invitation email is received", async () => {
        const mailChecker = createMailChecker(invitedEmail);
        const email = await mailChecker.checkEmailBySubject({
          subject: "Join ONLYOFFICE DocSpace",
          timeoutSeconds: 60,
        });

        expect(email).toBeTruthy();
      });
    });

    test("Invite user via email and complete registration from invitation email", async ({
      api,
      browser,
    }) => {
      const invitedEmail = config.DOCSPACE_OWNER_EMAIL.replace(
        "+alias1@",
        "+emailconfirm@",
      );
      let incognitoContext: BrowserContext | null = null;
      let incognitoPage: Page | null = null;

      try {
        await test.step("Invite user from contacts", async () => {
          await contacts.inviteUser(
            invitedEmail as TUserEmail,
            contactsActionsMenu.invite.submenu.user,
          );
        });

        let confirmLink: string;

        await test.step("Extract confirmation link from invitation email", async () => {
          const mailChecker = createMailChecker(invitedEmail);
          const link = await mailChecker.extractPortalLink({
            subject: "Join ONLYOFFICE DocSpace",
            portalName: api.portalDomain,
            timeoutSeconds: 120,
          });

          expect(link).toBeTruthy();
          confirmLink = link!;
        });

        await test.step("Open confirmation link and complete registration", async () => {
          const result = await setupIncognitoContext(browser);
          incognitoContext = result.context;
          incognitoPage = result.page;

          await incognitoPage.goto(confirmLink, { waitUntil: "load" });

          const registration = new RoomGuestRegistration(incognitoPage);
          await registration.register(
            "EmailConfirm",
            "TestUser",
            "TestPassword123!",
          );

          await incognitoPage.waitForURL(/.*rooms.*/, {
            waitUntil: "load",
            timeout: 30000,
          });
        });

        await test.step("Verify user appears in contacts", async () => {
          await contacts.open();
          await contacts.table.checkRowExistByNameText("EmailConfirm TestUser");
        });
      } finally {
        await cleanupIncognitoContext(incognitoContext, incognitoPage);
      }
    });

    test("Invite user via link and complete registration", async ({
      browser,
    }) => {
      let incognitoContext: BrowserContext | null = null;
      let incognitoPage: Page | null = null;

      try {
        await test.step("Open invite dialog and enable invite via link", async () => {
          await contacts.navigation.clickHeaderSubmenuOption(
            contactsActionsMenu.invite.label,
            contactsActionsMenu.invite.submenu.user,
          );
          await contacts.inviteDialog.enableInviteViaLink();
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
          await inviteLogin.fillEmail(`link_invite_${Date.now()}@test.com`);
          await inviteLogin.clickContinue();

          const registration = new RoomGuestRegistration(incognitoPage);
          await registration.register(
            "LinkInvite",
            "TestUser",
            "TestPassword123!",
          );

          await incognitoPage.waitForURL(/.*rooms.*/, {
            waitUntil: "load",
            timeout: 30000,
          });
        });

        await test.step("Verify user appears in contacts", async () => {
          await contacts.open();
          await contacts.table.checkRowExistByNameText("LinkInvite TestUser");
        });
      } finally {
        await cleanupIncognitoContext(incognitoContext, incognitoPage);
      }
    });
  });

  test.describe("Change email", () => {
    test("Change email notification", async ({ page, api, login }) => {
      const confirmLink = await getOwnerConfirmLink(api.portalDomain);
      const profile = new Profile(page);
      const originalEmail = config.DOCSPACE_OWNER_EMAIL;
      const newEmail = originalEmail.replace("+alias1@", "+alias2@");

      await page.goto(confirmLink, { waitUntil: "load" });
      await login.loginToPortal();
      await profile.open();

      await test.step("Clean new email inbox and request email change", async () => {
        await createMailChecker(newEmail).deleteAllMatchingEmails();
        await profile.changeEmail(newEmail);
      });

      await test.step("Verify email activation is received on new address", async () => {
        const mailChecker = createMailChecker(newEmail);
        const email = await mailChecker.checkEmailBySubject({
          subject: "Please activate your email address",
          timeoutSeconds: 60,
        });

        expect(email).toBeTruthy();
      });

      await test.step("Restore original email", async () => {
        await profile.changeEmail(originalEmail);
      });
    });
  });
});

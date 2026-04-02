import config, { getPortalUrl } from "@/config";
import { expect } from "@playwright/test";
import { PaymentApi } from "@/src/api/payment";
import { test } from "@/src/fixtures";
import Contacts from "@/src/objects/contacts/Contacts";
import { Profile } from "@/src/objects/profile/Profile";
import Customization from "@/src/objects/settings/customization/Customization";
import Deletion from "@/src/objects/settings/deletion/Deletion";
import {
  contactsActionsMenu,
  TUserEmail,
} from "@/src/utils/constants/contacts";
import { toastMessages } from "@/src/utils/constants/settings";
import { createMailChecker } from "@/src/utils/helpers/email/createMailChecker";
import { getOwnerConfirmLink } from "@/src/utils/helpers/email/getOwnerConfirmLink";

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

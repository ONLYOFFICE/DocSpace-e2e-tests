import config from "@/config";
import { test } from "@/src/fixtures";
import { Profile } from "@/src/objects/profile/Profile";
import { PasswordChangeConfirm } from "@/src/objects/profile/PasswordChangeConfirm";
import { toastMessages } from "@/src/utils/constants/profile";
import { createMailChecker } from "@/src/utils/helpers/email/createMailChecker";
import { getOwnerConfirmLink } from "@/src/utils/helpers/email/getOwnerConfirmLink";

const NEW_PASSWORD = "NewTestPassword123!";
const PASSWORD_CHANGE_EMAIL_SUBJECT = "Confirm changing your password";

test.describe("Profile: Change password", () => {
  let profile: Profile;
  let portalDomain: string;

  test.beforeEach(async ({ page, api, login }) => {
    const confirmLink = await getOwnerConfirmLink(api.portalDomain);
    profile = new Profile(page);
    portalDomain = api.portalDomain;

    await page.goto(confirmLink, { waitUntil: "load" });
    await login.loginToPortal();
    await profile.open();
  });

  // Polls for the confirmation email rather than the exact latest match, since
  // this test requests it twice (change, then restore) and a stale already-read
  // link for the same subject could otherwise be picked up before the new one arrives.
  async function waitForFreshPasswordConfirmLink(exclude?: string) {
    const deadline = Date.now() + 60000;

    while (Date.now() < deadline) {
      const link = await createMailChecker().extractPortalLink({
        subject: PASSWORD_CHANGE_EMAIL_SUBJECT,
        portalName: portalDomain,
        timeoutSeconds: 5,
      });

      if (link && link !== exclude) {
        return link;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 3000);
      });
    }

    throw new Error("Password change confirmation email was not received");
  }

  test("User changes password from profile and logs in with the new password", async ({
    page,
    login,
  }) => {
    const passwordChangeConfirm = new PasswordChangeConfirm(page);
    let confirmLink: string;

    await test.step("Request password change and set a new password", async () => {
      await profile.changePassword();
      confirmLink = await waitForFreshPasswordConfirmLink();

      await page.goto(confirmLink, { waitUntil: "load" });
      await passwordChangeConfirm.setNewPassword(NEW_PASSWORD);
    });

    await test.step("Verify redirect to login with success toast", async () => {
      await page.waitForURL(/\/login\?passwordChanged=true/, {
        waitUntil: "load",
      });
      await login.checkToastMessage(toastMessages.passwordChanged);
    });

    await test.step("Log in with the new password", async () => {
      await login.loginWithCredentials(
        config.DOCSPACE_OWNER_EMAIL,
        NEW_PASSWORD,
      );
      await page.waitForURL(/.*(dashboard|rooms\/shared\/filter).*/, {
        waitUntil: "load",
      });
    });

    await test.step("Restore original password", async () => {
      await profile.open();
      await profile.changePassword();
      const restoreLink = await waitForFreshPasswordConfirmLink(confirmLink);

      await page.goto(restoreLink, { waitUntil: "load" });
      await passwordChangeConfirm.setNewPassword(
        config.DOCSPACE_OWNER_PASSWORD,
      );
      await page.waitForURL(/\/login\?passwordChanged=true/, {
        waitUntil: "load",
      });
    });
  });
});

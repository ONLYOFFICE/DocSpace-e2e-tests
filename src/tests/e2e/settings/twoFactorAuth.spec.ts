import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Security from "@/src/objects/settings/security/Security";
import TwoFactorAuthPage from "@/src/objects/common/TwoFactorAuthPage";

test.describe("Two-Factor Authentication tests", () => {
  let security: Security;

  test.beforeEach(async ({ page, login }) => {
    security = new Security(page);
    await login.loginToPortal();
    await security.open();
  });

  test("Enable Two-Factor Authentication via authenticator app", async ({
    page,
  }) => {
    const twoFactorAuthPage = new TwoFactorAuthPage(page);

    await test.step("Enable Two-Factor Authentication in security settings", async () => {
      await security.enableTfa();
    });

    await test.step("Activate Two-Factor Authentication with TOTP code", async () => {
      await twoFactorAuthPage.activateWithTotpCode();
    });

    await test.step("Verify backup codes dialog is shown", async () => {
      await expect(twoFactorAuthPage.backupCodesContainer).toBeVisible({
        timeout: 15000,
      });
      await twoFactorAuthPage.backupCodesCancelButton.click();
      await expect(twoFactorAuthPage.backupCodesContainer).not.toBeVisible();
    });

    await test.step("Disable Two-Factor Authentication", async () => {
      await security.open();
      await security.disableTfa();
    });
  });

  test("Login with Two-Factor Authentication enabled", async ({
    page,
    api,
  }) => {
    const twoFactorAuthPage = new TwoFactorAuthPage(page);
    let secretKey: string;

    await test.step("Enable and activate Two-Factor Authentication", async () => {
      await security.enableTfa();
      secretKey = await twoFactorAuthPage.activateWithTotpCode();

      await expect(twoFactorAuthPage.backupCodesContainer).toBeVisible({
        timeout: 15000,
      });
      await twoFactorAuthPage.backupCodesCancelButton.click();
    });

    await test.step("Logout", async () => {
      await twoFactorAuthPage.logout();
      await expect(page).toHaveURL(/.*login.*/);
    });

    await test.step("Login and verify Two-Factor Authentication code is required", async () => {
      await twoFactorAuthPage.loginWithTwoFactorAuth(
        api.portalDomain,
        secretKey,
      );
      await expect(page).toHaveURL(/.*profile.*/);
    });

    await test.step("Disable Two-Factor Authentication for cleanup", async () => {
      await security.open();
      await security.disableTfa();
    });
  });
});

import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Security from "@/src/objects/settings/security/Security";
import TwoFactorAuthPage from "@/src/objects/common/TwoFactorAuthPage";
import { Profile } from "@/src/objects/profile/Profile";

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
        timeout: 30000,
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
      await expect(page).toHaveURL(/login|TfaAuth/);
    });

    await test.step("Login and verify Two-Factor Authentication code is required", async () => {
      await twoFactorAuthPage.loginWithTwoFactorAuth(
        api.portalDomain,
        secretKey,
      );
    });

    await test.step("Disable Two-Factor Authentication for cleanup", async () => {
      await security.open();
      await security.disableTfa();
    });
  });

  test("Re-enabling TFA skips app connection on next login", async ({
    page,
    api,
  }) => {
    const twoFactorAuthPage = new TwoFactorAuthPage(page);
    let secretKey: string;

    await test.step("Enable and activate Two-Factor Authentication", async () => {
      await security.enableTfa();
      secretKey = await twoFactorAuthPage.activateWithTotpCode();
      await expect(twoFactorAuthPage.backupCodesContainer).toBeVisible({
        timeout: 30000,
      });
      await twoFactorAuthPage.backupCodesCancelButton.click();
    });

    await test.step("Disable and re-enable Two-Factor Authentication", async () => {
      await security.open();
      await security.disableTfa();
      await security.open();
      await security.enableTfa();
      await twoFactorAuthPage.waitForAuthPage();
    });

    await test.step("Login and verify TFA auth page is shown (not activation)", async () => {
      await twoFactorAuthPage.loginWithTwoFactorAuth(
        api.portalDomain,
        secretKey,
      );
    });

    await test.step("Disable Two-Factor Authentication for cleanup", async () => {
      await security.open();
      await security.disableTfa();
    });
  });

  test("Reset authenticator app - old TOTP code rejected, new code accepted", async ({
    page,
  }) => {
    const twoFactorAuthPage = new TwoFactorAuthPage(page);
    const profile = new Profile(page);
    let oldSecretKey: string;

    await test.step("Enable and activate Two-Factor Authentication", async () => {
      await security.enableTfa();
      oldSecretKey = await twoFactorAuthPage.activateWithTotpCode();
      await expect(twoFactorAuthPage.backupCodesContainer).toBeVisible({
        timeout: 30000,
      });
      await twoFactorAuthPage.backupCodesCancelButton.click();
    });

    await test.step("Open profile and reset authenticator app", async () => {
      await profile.open();
      await profile.checkTfaSettingsBlockVisible();
      await profile.clickResetApp();
      await profile.checkResetAppDialogVisible();
      await profile.confirmResetApp();
      await twoFactorAuthPage.waitForActivationPage();
    });

    await test.step("Verify old TOTP code is rejected with 401 error", async () => {
      await twoFactorAuthPage.enterCodeFromSecretAndActivate(oldSecretKey);
      await twoFactorAuthPage.checkInvalidCodeErrorOnActivation();
    });

    await test.step("Activate with new TOTP code", async () => {
      await twoFactorAuthPage.activateWithTotpCode();
      await expect(twoFactorAuthPage.backupCodesContainer).toBeVisible({
        timeout: 30000,
      });
      await twoFactorAuthPage.backupCodesCancelButton.click();
    });

    await test.step("Disable Two-Factor Authentication for cleanup", async () => {
      await security.open();
      await security.disableTfa();
    });
  });

  test("Request new backup codes replaces existing codes", async ({ page }) => {
    const twoFactorAuthPage = new TwoFactorAuthPage(page);
    let initialCodes: string[];

    await test.step("Enable and activate Two-Factor Authentication", async () => {
      await security.enableTfa();
      await twoFactorAuthPage.activateWithTotpCode();
      await expect(twoFactorAuthPage.backupCodesContainer).toBeVisible({
        timeout: 30000,
      });
    });

    await test.step("Note initial backup codes", async () => {
      initialCodes = await twoFactorAuthPage.getBackupCodeTexts();
      expect(initialCodes.length).toBeGreaterThan(0);
    });

    await test.step("Request new backup codes and verify they changed", async () => {
      await twoFactorAuthPage.requestNewBackupCodesButton.click();
      await expect(async () => {
        const newCodes = await twoFactorAuthPage.getBackupCodeTexts();
        expect(newCodes).not.toEqual(initialCodes);
      }).toPass({ timeout: 15000 });
      await twoFactorAuthPage.backupCodesCancelButton.click();
    });

    await test.step("Disable Two-Factor Authentication for cleanup", async () => {
      await security.open();
      await security.disableTfa();
    });
  });

  test.skip("[Bug 82185] Print backup codes opens printable page", async ({
    page,
  }) => {
    const twoFactorAuthPage = new TwoFactorAuthPage(page);
    const profile = new Profile(page);

    await test.step("Enable and activate Two-Factor Authentication", async () => {
      await security.enableTfa();
      await twoFactorAuthPage.activateWithTotpCode();
      await expect(twoFactorAuthPage.backupCodesContainer).toBeVisible({
        timeout: 30000,
      });
      await twoFactorAuthPage.backupCodesCancelButton.click();
    });

    await test.step("Open profile and show backup codes dialog", async () => {
      await profile.open();
      await profile.clickShowBackupCodes();
      await profile.checkBackupCodesDialogVisible();
    });

    await test.step("Click print and verify printable page opens", async () => {
      const [printPage] = await Promise.all([
        page.context().waitForEvent("page"),
        profile.clickPrintBackupCodes(),
      ]);
      expect(printPage).not.toBeNull();
      await printPage.close();
    });

    await test.step("Disable Two-Factor Authentication for cleanup", async () => {
      await security.open();
      await security.disableTfa();
    });
  });

  test("Reset authenticator app - cancel dialog keeps TFA active", async ({
    page,
  }) => {
    const twoFactorAuthPage = new TwoFactorAuthPage(page);
    const profile = new Profile(page);

    await test.step("Enable and activate Two-Factor Authentication", async () => {
      await security.enableTfa();
      await twoFactorAuthPage.activateWithTotpCode();
      await expect(twoFactorAuthPage.backupCodesContainer).toBeVisible({
        timeout: 30000,
      });
      await twoFactorAuthPage.backupCodesCancelButton.click();
    });

    await test.step("Open profile and verify TFA section is visible", async () => {
      await profile.open();
      await profile.checkTfaSettingsBlockVisible();
    });

    await test.step("Open reset app dialog and cancel", async () => {
      await profile.clickResetApp();
      await profile.checkResetAppDialogVisible();
      await profile.closeResetAppDialog();
      await profile.checkTfaSettingsBlockVisible();
    });

    await test.step("Disable Two-Factor Authentication for cleanup", async () => {
      await security.open();
      await security.disableTfa();
    });
  });

  test("Show backup codes dialog from Profile", async ({ page }) => {
    const twoFactorAuthPage = new TwoFactorAuthPage(page);
    const profile = new Profile(page);

    await test.step("Enable and activate Two-Factor Authentication", async () => {
      await security.enableTfa();
      await twoFactorAuthPage.activateWithTotpCode();
      await expect(twoFactorAuthPage.backupCodesContainer).toBeVisible({
        timeout: 30000,
      });
      await twoFactorAuthPage.backupCodesCancelButton.click();
    });

    await test.step("Open profile and click Show backup codes", async () => {
      await profile.open();
      await profile.clickShowBackupCodes();
    });

    await test.step("Verify backup codes dialog shows all controls and 5 codes", async () => {
      await profile.checkBackupCodesDialogVisible();
      await profile.checkBackupCodesCount(5);
    });

    await test.step("Close backup codes dialog", async () => {
      await profile.closeBackupCodesDialog();
      await profile.checkBackupCodesDialogNotVisible();
    });

    await test.step("Disable Two-Factor Authentication for cleanup", async () => {
      await security.open();
      await security.disableTfa();
    });
  });

  test("Login with backup code instead of TOTP", async ({ page, api }) => {
    const twoFactorAuthPage = new TwoFactorAuthPage(page);
    let backupCode: string;

    await test.step("Enable and activate TFA, save a backup code", async () => {
      await security.enableTfa();
      await twoFactorAuthPage.activateWithTotpCode();
      await expect(twoFactorAuthPage.backupCodesContainer).toBeVisible({
        timeout: 30000,
      });
      const codes = await twoFactorAuthPage.getBackupCodeTexts();
      backupCode = codes[0];
      await twoFactorAuthPage.backupCodesCancelButton.click();
    });

    await test.step("Logout", async () => {
      await twoFactorAuthPage.logout();
      await expect(page).toHaveURL(/login|TfaAuth/);
    });

    await test.step("Login with backup code and verify successful login", async () => {
      await twoFactorAuthPage.loginWithBackupCode(api.portalDomain, backupCode);
      await twoFactorAuthPage.waitForSuccessfulLogin();
    });
  });

  test("Used backup code is rejected on reuse", async ({ page, api }) => {
    const twoFactorAuthPage = new TwoFactorAuthPage(page);
    let backupCode: string;
    let secretKey: string;

    await test.step("Enable and activate TFA, save a backup code", async () => {
      await security.enableTfa();
      secretKey = await twoFactorAuthPage.activateWithTotpCode();
      await expect(twoFactorAuthPage.backupCodesContainer).toBeVisible({
        timeout: 30000,
      });
      const codes = await twoFactorAuthPage.getBackupCodeTexts();
      backupCode = codes[0];
      await twoFactorAuthPage.backupCodesCancelButton.click();
    });

    await test.step("Logout", async () => {
      await twoFactorAuthPage.logout();
      await expect(page).toHaveURL(/login|TfaAuth/);
    });

    await test.step("Use backup code for the first time", async () => {
      await twoFactorAuthPage.loginWithBackupCode(api.portalDomain, backupCode);
      await twoFactorAuthPage.waitForSuccessfulLogin();
    });

    await test.step("Logout after first backup code use", async () => {
      await twoFactorAuthPage.logout();
      await expect(page).toHaveURL(/login|TfaAuth/);
    });

    await test.step("Try to reuse the same backup code and verify it is rejected", async () => {
      await twoFactorAuthPage.loginWithBackupCode(api.portalDomain, backupCode);
      await twoFactorAuthPage.checkInvalidCodeError();
    });

    await test.step("Disable Two-Factor Authentication for cleanup", async () => {
      await twoFactorAuthPage.completeTfaLoginWithSecret(secretKey);
      await security.open();
      await security.disableTfa();
    });
  });

  test("Existing user without TFA is redirected to activation on login", async ({
    page,
    api,
    apiSdk,
  }) => {
    const twoFactorAuthPage = new TwoFactorAuthPage(page);
    let userData: { email: string; password: string };

    await test.step("Create a new regular user via API", async () => {
      const result = await apiSdk.profiles.addMember("owner", "User");
      userData = result.userData;
    });

    await test.step("Enable Two-Factor Authentication", async () => {
      await security.enableTfa();
      await twoFactorAuthPage.activateWithTotpCode();
      await expect(twoFactorAuthPage.backupCodesContainer).toBeVisible({
        timeout: 30000,
      });
      await twoFactorAuthPage.backupCodesCancelButton.click();
    });

    await test.step("Logout as owner", async () => {
      await twoFactorAuthPage.logout();
      await expect(page).toHaveURL(/login|TfaAuth/);
    });

    await test.step("Login as new user and verify redirect to TFA activation", async () => {
      await twoFactorAuthPage.loginAsUserAndWaitForActivation(
        api.portalDomain,
        userData.email,
        userData.password,
      );
    });
  });

  test("Reset authenticator app - confirm redirects to activation page", async ({
    page,
  }) => {
    const twoFactorAuthPage = new TwoFactorAuthPage(page);
    const profile = new Profile(page);

    await test.step("Enable and activate Two-Factor Authentication", async () => {
      await security.enableTfa();
      await twoFactorAuthPage.activateWithTotpCode();
      await expect(twoFactorAuthPage.backupCodesContainer).toBeVisible({
        timeout: 30000,
      });
      await twoFactorAuthPage.backupCodesCancelButton.click();
    });

    await test.step("Open profile and confirm reset app", async () => {
      await profile.open();
      await profile.checkTfaSettingsBlockVisible();
      await profile.clickResetApp();
      await profile.checkResetAppDialogVisible();
      await profile.confirmResetApp();
    });

    await test.step("Verify redirect to TFA activation page", async () => {
      await twoFactorAuthPage.waitForActivationPage();
    });

    await test.step("Re-activate TFA for cleanup", async () => {
      await twoFactorAuthPage.activateWithTotpCode();
      await expect(twoFactorAuthPage.backupCodesContainer).toBeVisible({
        timeout: 30000,
      });
      await twoFactorAuthPage.backupCodesCancelButton.click();
    });

    await test.step("Disable Two-Factor Authentication for cleanup", async () => {
      await security.open();
      await security.disableTfa();
    });
  });
});

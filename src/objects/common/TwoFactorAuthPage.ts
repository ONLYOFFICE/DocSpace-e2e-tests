import { Page, Locator, expect } from "@playwright/test";
import { generateTotpCode } from "@/src/utils/helpers/totp";
import { Login } from "./Login";
import config from "@/config";

export class TwoFactorAuthPage {
  page: Page;
  codeInput: Locator;
  connectButton: Locator;
  continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.codeInput = page.getByTestId("app_code_input");
    this.connectButton = page.getByTestId("app_connect_button");
    this.continueButton = page.getByTestId("app_code_continue_button");
  }

  get backupCodesContainer() {
    return this.page.getByTestId("backup_codes_container");
  }

  get backupCodes() {
    return this.page.locator('[data-testid^="backup_code_"]');
  }

  get backupCodesCancelButton() {
    return this.page.getByTestId("backup_codes_cancel_button");
  }

  get requestNewBackupCodesButton() {
    return this.page.getByTestId("request_new_backup_codes_button");
  }

  async waitForActivationPage() {
    await this.page.waitForURL(/.*TfaActivation.*/, {
      waitUntil: "load",
      timeout: 30000,
    });
    await expect(this.codeInput).toBeVisible({ timeout: 10000 });
  }

  async waitForAuthPage() {
    await this.page.waitForURL(/.*TfaAuth.*/, {
      waitUntil: "load",
      timeout: 30000,
    });
    await expect(this.codeInput).toBeVisible({ timeout: 10000 });
  }

  async getSecretKeyFromPage(): Promise<string> {
    const descriptionText = this.page.locator(".description-text");
    await expect(descriptionText.first()).toBeVisible({ timeout: 10000 });

    const strongElement = descriptionText.locator("strong");
    const secretKey = await strongElement.textContent();

    if (!secretKey) {
      throw new Error("Could not find TOTP secret key on page");
    }

    return secretKey.trim();
  }

  async enterCodeAndActivate(code: string) {
    await this.codeInput.fill(code);
    await this.connectButton.click();
  }

  async enterCodeAndLogin(code: string) {
    await this.codeInput.fill(code);
    await this.continueButton.click();
  }

  async activateWithTotpCode(): Promise<string> {
    await this.waitForActivationPage();
    const secretKey = await this.getSecretKeyFromPage();
    const code = generateTotpCode(secretKey);
    await this.enterCodeAndActivate(code);
    return secretKey;
  }

  async loginWithTwoFactorAuth(portalDomain: string, secretKey: string) {
    const login = new Login(this.page, portalDomain);

    await expect(async () => {
      await login.emailInput.fill(config.DOCSPACE_OWNER_EMAIL);
      await login.passwordInput.fill(config.DOCSPACE_OWNER_PASSWORD);
      await Promise.all([
        this.page.waitForRequest(
          (request) =>
            request.url().includes("api/2.0/authentication") &&
            request.method() === "POST",
          { timeout: 4000 },
        ),
        login.loginButton.click(),
      ]);
    }).toPass();

    await this.waitForAuthPage();
    const code = generateTotpCode(secretKey);
    await this.enterCodeAndLogin(code);

    await this.page.waitForURL(/.*profile.*/, {
      waitUntil: "load",
      timeout: 30000,
    });
  }

  async logout() {
    const optionsButton = this.page.getByTestId("profile_user_icon_button");
    await optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await optionsButton.click();
    await this.page.getByTestId("user-menu-logout").click();
    await this.page.waitForURL(/.*login.*/, {
      waitUntil: "load",
      timeout: 30000,
    });
  }
}

export default TwoFactorAuthPage;

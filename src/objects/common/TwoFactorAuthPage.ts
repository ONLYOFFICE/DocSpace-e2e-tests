import { Page, Locator, expect } from "@playwright/test";
import { generateTotpCode } from "@/src/utils/helpers/totp";
import { Login } from "./Login";
import config from "@/config";

const APP_CODE_FIELD = "app_code_field";
const INVALID_CODE_ERROR = "Incorrect code";
const FIELD_CONTAINER = "field-container";
const TOAST_CONTENT = "toast-content";
const PROFILE_ICON_BUTTON = "profile_user_icon_button";
const USER_MENU_LOGOUT = "user-menu-logout";
const DESCRIPTION_TEXT = ".description-text";

export class TwoFactorAuthPage {
  page: Page;
  codeInput: Locator;
  connectButton: Locator;
  continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.codeInput = page.getByTestId("app_code_input").first();
    this.connectButton = page.getByTestId("app_connect_button");
    this.continueButton = page.getByTestId("app_code_continue_button");
  }

  get codeField(): Locator {
    return this.page.getByTestId(APP_CODE_FIELD);
  }

  async checkInvalidCodeError() {
    await expect(
      this.page.getByTestId(FIELD_CONTAINER).getByText(INVALID_CODE_ERROR),
    ).toBeVisible({
      timeout: 10000,
    });
    await expect(
      this.page.getByTestId(TOAST_CONTENT).getByText(INVALID_CODE_ERROR),
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async checkInvalidCodeErrorOnActivation() {
    await expect(this.codeField.getByText(INVALID_CODE_ERROR)).toBeVisible({
      timeout: 10000,
    });
    await expect(
      this.page.getByTestId(TOAST_CONTENT).getByText(INVALID_CODE_ERROR),
    ).toBeVisible({
      timeout: 10000,
    });
  }

  async enterCodeFromSecretAndActivate(secretKey: string) {
    const code = generateTotpCode(secretKey);
    await this.enterCodeAndActivate(code);
  }

  async getBackupCodeTexts(): Promise<string[]> {
    return this.backupCodes.allTextContents();
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
    const descriptionText = this.page.locator(DESCRIPTION_TEXT);
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
    if (!this.page.url().includes("TfaAuth")) {
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
    }

    await this.waitForAuthPage();
    const code = generateTotpCode(secretKey);
    await this.enterCodeAndLogin(code);
    await this.waitForSuccessfulLogin();
  }

  async loginWithBackupCode(portalDomain: string, backupCode: string) {
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
    await this.codeInput.fill(backupCode);
    await this.continueButton.click();
  }

  async waitForSuccessfulLogin() {
    await this.page
      .getByTestId(PROFILE_ICON_BUTTON)
      .waitFor({ state: "visible", timeout: 30000 });
  }

  async completeTfaLoginWithSecret(secretKey: string) {
    const code = generateTotpCode(secretKey);
    await this.enterCodeAndLogin(code);
    await this.waitForSuccessfulLogin();
  }

  async loginAsUserAndWaitForActivation(
    portalDomain: string,
    email: string,
    password: string,
  ) {
    const login = new Login(this.page, portalDomain);

    await expect(async () => {
      await login.emailInput.fill(email);
      await login.passwordInput.fill(password);
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

    await this.waitForActivationPage();
  }

  async logout() {
    const origin = new URL(this.page.url()).origin;

    // ERR_ABORTED can occur when TFA invalidates the session mid-navigation
    // (e.g. after re-enabling TFA while on TfaActivation page).
    try {
      await this.page.goto(`${origin}/rooms`, { waitUntil: "load" });
    } catch {
      // Navigation aborted - check where the page ended up below
    }

    // Client-side auth check may redirect to login/TfaAuth after the initial
    // page load (e.g. when the session requires TFA after re-enabling it).
    try {
      await this.page.waitForURL(/login|TfaAuth/, { timeout: 5000 });
    } catch {
      // No redirect - user is authenticated on the rooms page
    }

    if (/login|TfaAuth/.test(this.page.url())) {
      return;
    }

    const optionsButton = this.page.getByTestId(PROFILE_ICON_BUTTON);
    await optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await optionsButton.click();
    await this.page.getByTestId(USER_MENU_LOGOUT).click();
    await expect(this.page).toHaveURL(/login|TfaAuth/, { timeout: 30000 });
  }
}

export default TwoFactorAuthPage;

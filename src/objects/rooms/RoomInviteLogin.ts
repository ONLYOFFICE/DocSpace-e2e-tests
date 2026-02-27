import { Page, expect } from "@playwright/test";

const EMAIL_INPUT = "email-input-invite";
const CONTINUE_BUTTON = "email_continue_button";
const PASSWORD_INPUT = "text-input";
const SIGN_IN_BUTTON = "login_button";

// Page Object for the invite link login page
export class RoomInviteLogin {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get emailInput() {
    return this.page.getByTestId(EMAIL_INPUT);
  }

  get continueButton() {
    return this.page.getByTestId(CONTINUE_BUTTON);
  }

  get passwordInput() {
    return this.page.getByTestId(PASSWORD_INPUT);
  }

  get signInButton() {
    return this.page.getByTestId(SIGN_IN_BUTTON);
  }

  async fillEmail(email: string) {
    await expect(this.emailInput).toBeVisible();
    await this.emailInput.fill(email);
  }

  async clickContinue() {
    await expect(this.continueButton).toBeVisible();
    await this.continueButton.click();
  }

  async fillPassword(password: string) {
    await expect(this.passwordInput).toBeVisible();
    await this.passwordInput.fill(password);
  }

  async clickSignIn() {
    await expect(this.signInButton).toBeVisible();
    await this.signInButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.clickContinue();
    await this.fillPassword(password);
    await this.clickSignIn();
  }
}

export default RoomInviteLogin;

import { Page, expect } from "@playwright/test";

const EMAIL_INPUT = "email-input-invite";
const CONTINUE_BUTTON = "email_continue_button";
const PASSWORD_INPUT = "login_password";
const SUBMIT_BUTTON = "login_submit";

/**
 * Page Object for the invite link login page.
 * Handles the flow when a user opens a room invite link:
 * 1. Enter email on the invite email page
 * 2. Click Continue to proceed
 * 3. Enter password on the login page (for existing users)
 * 4. Submit to log in and join the room
 */
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

  get submitButton() {
    return this.page.getByTestId(SUBMIT_BUTTON);
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

  async clickSubmit() {
    await expect(this.submitButton).toBeVisible();
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.clickContinue();
    await this.fillPassword(password);
    await this.clickSubmit();
  }
}

export default RoomInviteLogin;

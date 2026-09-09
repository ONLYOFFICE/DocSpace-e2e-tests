import { Page, expect } from "@playwright/test";

const PASSWORD_INPUT_PLACEHOLDER = "Password";
const CREATE_PASSWORD_BUTTON = "create_password_button";

// Page Object for the /confirm/PasswordChange page reached via the
// "Confirm changing your password" email link
export class PasswordChangeConfirm {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get passwordInput() {
    return this.page.getByPlaceholder(PASSWORD_INPUT_PLACEHOLDER);
  }

  get createButton() {
    return this.page.getByTestId(CREATE_PASSWORD_BUTTON);
  }

  async setNewPassword(password: string) {
    await expect(this.passwordInput).toBeVisible();
    await this.passwordInput.fill(password);
    await this.createButton.click();
  }
}

export default PasswordChangeConfirm;

import { Page, expect } from "@playwright/test";

const SIGN_IN_BUTTON_NAME = "Sign in";
const SIGN_IN_NOTIFICATION =
  "This room is opened in the for filling only mode";

class RoomAnonymousView {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async checkSignInNotificationVisible() {
    await expect(
      this.page.getByText(SIGN_IN_NOTIFICATION, { exact: false }),
    ).toBeVisible();
  }

  async signInButtonVisible() {
    await expect(
      this.page.getByRole("button", { name: SIGN_IN_BUTTON_NAME }),
    ).toBeVisible();
  }

  async clickSignInButton() {
    await this.signInButtonVisible();
    await this.page
      .getByRole("button", { name: SIGN_IN_BUTTON_NAME })
      .click();
  }
}
export default RoomAnonymousView;

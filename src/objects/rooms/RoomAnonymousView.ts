import { Page, expect } from "@playwright/test";

const SING_IN_BUTTON = "button";

class RoomAnonymousView {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async singInButtonVisible() {
    await expect(this.page.getByTestId(SING_IN_BUTTON)).toBeVisible();
  }

  async clickSingInButton() {
    await this.singInButtonVisible();
    await this.page.getByTestId(SING_IN_BUTTON).click();
  }
}
export default RoomAnonymousView;

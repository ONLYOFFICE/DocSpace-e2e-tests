import { expect, Page } from "@playwright/test";

class BaseToast {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get toast() {
    return this.page.locator("#toast-container").getByRole("alert");
  }

  async removeToast() {
    await expect(this.toast).toBeVisible();
    await this.toast.click();
    await expect(this.toast).not.toBeVisible();
  }
}

export default BaseToast;

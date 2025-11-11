import { expect, Page } from "@playwright/test";

class BaseToast {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get toast() {
    return this.page.locator("#toast-container").getByRole("alert");
  }

  async removeAllToast() {
    const toasts = await this.toast.all();

    for (const toast of toasts) {
      await toast.click();
      await expect(toast).not.toBeVisible();
    }
  }

  async removeToast(text?: string, timeout?: number) {
    const toast = this.toast.first();

    await expect(toast).toBeVisible({ timeout });
    if (text) {
      await expect(toast).toContainText(text);
    }
    await toast.click();
    await expect(toast).not.toBeVisible();
  }
}

export default BaseToast;

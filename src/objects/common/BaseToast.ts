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

  async dismissToastSafely(text: string, timeout = 30000) {
    const toast = this.toast.filter({ hasText: text }).first();
    await toast.waitFor({ state: "visible", timeout });
    await toast.click();
    await toast.waitFor({ state: "hidden", timeout });
  }
}

export default BaseToast;

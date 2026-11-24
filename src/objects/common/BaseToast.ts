import { expect, Page } from "@playwright/test";

class BaseToast {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get toast() {
    return this.page.locator("#toast-container").getByRole("alert");
  }

  // Closes the toasts one by one from the top. `all()` would give positional
  // locators: after the first toast closes, the next one slides under the
  // cursor (hover pauses its auto-close) and `nth(0)` still resolves to it.
  async removeAllToast() {
    let count = await this.toast.count();

    while (count > 0) {
      await this.toast.first().click();
      await expect.poll(() => this.toast.count()).toBeLessThan(count);
      count = await this.toast.count();
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
  async clickLinkInToast(linkText?: string, timeout: number = 5000) {
    try {
      // Wait for toast to be visible with a reasonable timeout
      const toastElement = this.toast.first();
      await toastElement.waitFor({ state: "visible", timeout });

      // Find the link within the toast
      const linkLocator = linkText
        ? toastElement.locator(`a:has-text("${linkText}")`).first()
        : toastElement.locator("a").first();

      // Wait for the link to be visible and click it
      await linkLocator.waitFor({ state: "visible", timeout: 5000 });
      await linkLocator.click({ timeout: 5000 });

      // Don't wait for toast to disappear as it might happen too quickly
      return true;
    } catch (error) {
      console.error("Error clicking link in toast:", error);
      throw error;
    }
  }
  // A series of failed requests must collapse into one toast.
  async checkSingleToastMessage(text: string, timeout?: number) {
    const toasts = this.toast.filter({ hasText: text });
    await toasts.first().waitFor({ state: "visible", timeout });
    await expect(toasts).toHaveCount(1);
  }

  async checkToastMessage(text: string, timeout?: number) {
    const toast = this.toast.filter({ hasText: text }).first();
    await toast.waitFor({ state: "visible", timeout });
  }
}

export default BaseToast;

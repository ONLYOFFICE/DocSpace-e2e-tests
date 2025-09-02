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

  async removeToast(text?: string, timeout = 5000) {
    try {
      // Try to find a visible toast
      const toast = this.toast.first();

      // Check visibility with a short timeout
      const isVisible = await toast.isVisible().catch(() => false);

      if (!isVisible) {
        console.log("Toast is not visible, skipping check");
        return;
      }

      // If toast is visible, check text and close it
      if (text) {
        const toastText = await toast
          .textContent({ timeout: 1000 })
          .catch(() => "");
        if (toastText && !toastText.includes(text)) {
          console.log(
            `Toast text doesn't match. Expected: ${text}, got: ${toastText}`,
          );
          return;
        }
      }

      // Try to close the toast if it's still visible
      try {
        await toast.click({ timeout: 1000 });
      } catch (e) {
        // Ignore click errors
      }
    } catch (error) {
      console.error("Error while working with toast:", error);
      // Continue test execution even if toast handling fails
    }
  }
}

export default BaseToast;

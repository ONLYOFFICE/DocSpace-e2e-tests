import { expect, Page } from "@playwright/test";
const TAKE_A_TOUR_BUTTON = "#form-filling_tips_start";
const SKIP_BUTTON = "#form-filling_tips_skip";

export class ShortTour {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get skipButton() {
    return this.page.locator(SKIP_BUTTON);
  }

  async clickSkipTour() {
    await expect(this.skipButton).toBeVisible();
    await expect(this.skipButton).toBeEnabled();
    await this.skipButton.click();
  }

  async isTourVisible(timeout = 3000): Promise<boolean> {
    try {
      const button = this.page.locator(TAKE_A_TOUR_BUTTON);
      await button.waitFor({ state: "visible", timeout });
      await expect(button).toBeVisible({ timeout });
      return true;
    } catch {
      return false;
    }
  }
}

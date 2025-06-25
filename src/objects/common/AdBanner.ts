import { Page, expect } from "@playwright/test";

const AD_BANNER = "[data-testid='campaigns-banner']";
const CLOSE_BUTTON = `${AD_BANNER} [data-testid='icon-button-svg']`;

class AdBanner {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get closeButton() {
    return this.page.locator(CLOSE_BUTTON);
  }

  private get adBanner() {
    return this.page.locator(AD_BANNER);
  }

  async closeBanner() {
    try {
      await this.closeButton.click();
      await expect(this.adBanner).not.toBeVisible({ timeout: 1000 });
    } catch {
      await this.closeBanner();
    }
  }
}

export default AdBanner;

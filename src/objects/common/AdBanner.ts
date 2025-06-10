import { Page } from "@playwright/test";

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
    while (await this.adBanner.isVisible()) {
      await this.closeButton.click();

      // Small waitForTimeout for DOM to be updated
      await this.page.waitForTimeout(200);
    }
  }
}

export default AdBanner;

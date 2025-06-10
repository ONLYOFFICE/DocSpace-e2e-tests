import { Page } from "@playwright/test";

class AdFrame {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async closeIframe() {
    // Look for the close button by finding the div that contains the SVG with the cross icon
    // This approach is more robust against class name changes
    const closeButton = this.page.locator(
      "div.snacknar-module__actionWrapper--gAEqF.snacknar-module__action--lH4TL:has(svg.snacknar-module__crossIcon--HpUGa)",
    );

    await closeButton.click();
  }
}

export default AdFrame;

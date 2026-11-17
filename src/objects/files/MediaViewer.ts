import { expect, Page } from "@playwright/test";

const VIEWER_URL = /\/media\/view\/\d+$/;

class MediaViewer {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // The "media-viewer" wrapper has no size of its own, so the viewer is
  // checked by its URL and the picture element
  private get image() {
    return this.page.getByTestId("image-content");
  }

  async expectOpened() {
    await expect(this.page).toHaveURL(VIEWER_URL);
    await expect(this.image).toBeVisible();
  }

  // naturalWidth stays 0 when the browser could not decode the picture
  async expectImageShown() {
    await expect(this.image).toBeVisible();
    await expect
      .poll(() =>
        this.image.evaluate((img: HTMLImageElement) => img.naturalWidth),
      )
      .toBeGreaterThan(0);
  }

  async close() {
    await this.page.keyboard.press("Escape");
    await expect(this.image).toBeHidden();
    await expect(this.page).not.toHaveURL(VIEWER_URL);
  }
}

export default MediaViewer;

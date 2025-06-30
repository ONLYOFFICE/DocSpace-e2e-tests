import { expect, Page } from "@playwright/test";

type ScreenshotOptions = {
  screenshotDir: string;
  maxAttempts?: number;
  fullPage?: boolean;
};

class Screenshot {
  page: Page;
  options: ScreenshotOptions = {
    screenshotDir: "",
  };
  private counter: number = 0;

  constructor(page: Page, options: ScreenshotOptions) {
    this.page = page;

    this.options = {
      ...options,
      maxAttempts: options.maxAttempts ?? 3,
      fullPage: options.fullPage ?? false,
    };
  }

  private async getPageSize() {
    const initialViewport = this.page.viewportSize()!;

    const pageBody = await this.page
      .locator("[data-testid='scroll-body']")
      .nth(2)
      .boundingBox();

    const height = Math.ceil(pageBody?.height ?? initialViewport.height);
    const width = initialViewport.width;

    return {
      height,
      width,
    };
  }

  private async setViewportSize() {
    const { height, width } = await this.getPageSize();
    await this.page.setViewportSize({ height, width });
  }

  private getScreenshotName(comment: string) {
    this.counter += 1;
    return `${this.counter}_${comment}`;
  }

  async expectHaveScreenshot(comment: string, safe: boolean = true) {
    if (safe) {
      await this.page.mouse.move(0, 0);
      await this.page.waitForTimeout(100);
    }

    if (this.options.fullPage) {
      await this.setViewportSize();
    }

    const screenshotName = this.getScreenshotName(comment);

    await this.tryScreenshot(this.options.maxAttempts!, screenshotName);
  }

  private async tryScreenshot(maxAttempts: number, screenshotName: string) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await expect(this.page).toHaveScreenshot([
          "client",
          this.options.screenshotDir,
          `${screenshotName}.png`,
        ]);
        return;
      } catch (err) {
        console.log(
          `${this.options.screenshotDir} - ${screenshotName} - ${err} - Attempt ${attempt} of ${maxAttempts - 1}`,
        );
        lastError = err;
        if (attempt < maxAttempts) {
          await new Promise((res) => setTimeout(res, 1000));
        }
      }
    }
    throw new Error(
      `Failed to take a screenshot ${this.options.screenshotDir} - ${screenshotName} after ${maxAttempts} attempts: ${lastError}`,
    );
  }
}

export default Screenshot;

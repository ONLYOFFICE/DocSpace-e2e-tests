import { expect, Page, TestInfo } from "@playwright/test";

class Screenshot {
  page: Page;
  screenshotDir: string;
  maxAttempts: number;
  private tests = new Map<string, { index: number; counter: number }>();
  private currentTestInfo: TestInfo | null = null;

  constructor(page: Page, screenshotDir: string, maxAttempts: number = 3) {
    this.page = page;
    this.screenshotDir = screenshotDir;
    this.maxAttempts = maxAttempts;
  }

  async setCurrentTestInfo(testInfo: TestInfo) {
    this.currentTestInfo = testInfo;
  }

  private getScreenshotName(comment: string) {
    if (!this.currentTestInfo) {
      throw new Error("Current test info is not set");
    }

    const rawTitle = this.currentTestInfo.title.trim();

    // 1. Replace spaces and hyphens with underscores for safety
    let snake = rawTitle.replace(/[\s-]+/g, "_");

    // 2. Insert underscore before every capital letter that is preceded by another capital followed by a lowercase letter
    //    or by a lowercase/digit — this covers PascalCase and camelCase words.
    snake = snake
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2");

    const testName = snake.toLowerCase();

    let test = this.tests.get(testName);

    if (!test) {
      test = { index: this.tests.size + 1, counter: 0 };
      this.tests.set(testName, test);
    }

    test.counter += 1;

    return `${test.counter}_${comment}`;
  }

  async expectHaveScreenshot(comment: string, safe: boolean = true) {
    if (safe) {
      await this.page.mouse.move(0, 0);
      await this.page.waitForTimeout(100);
    }

    const screenshotName = this.getScreenshotName(comment);

    await this.tryScreenshot(this.maxAttempts, screenshotName);
  }

  private async tryScreenshot(maxAttempts: number, screenshotName: string) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await expect(this.page).toHaveScreenshot([
          "client",
          this.screenshotDir,
          `${screenshotName}.png`,
        ]);
        return;
      } catch (err) {
        console.log(
          `${this.screenshotDir} - ${screenshotName} - ${err} - Attempt ${attempt} of ${maxAttempts - 1}`,
        );
        lastError = err;
        if (attempt < maxAttempts) {
          await new Promise((res) => setTimeout(res, 1000));
        }
      }
    }
    throw new Error(
      `Failed to take a screenshot ${this.screenshotDir} - ${screenshotName} after ${maxAttempts} attempts: ${lastError}`,
    );
  }
}

export default Screenshot;

import { expect, Page, TestInfo } from "@playwright/test";

class Screenshot {
  page: Page;
  typePage: string;
  private tests = new Map<string, { index: number; counter: number }>();
  private currentTestInfo: TestInfo | null = null;

  constructor(page: Page, typePage: string) {
    this.page = page;
    this.typePage = typePage;
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

    let screenshotName = `${test.index}_${test.counter}_${testName}`;

    if (comment) {
      screenshotName += `_${comment}`;
    }

    return screenshotName;
  }

  async expectHaveScreenshot(comment: string = "", safe: boolean = true) {
    if (safe) {
      await this.page.mouse.move(0, 0);
      await this.page.waitForTimeout(100);
    }

    const screenshotName = this.getScreenshotName(comment);

    await expect(this.page).toHaveScreenshot([
      "client",
      this.typePage,
      `${screenshotName}.png`,
    ]);
  }
}

export default Screenshot;

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

    // Clean up comment to avoid duplicating parts of the title and remove generic words like "view"
    if (comment) {
      // 1. Split the comment into tokens by underscore and lowercase them for comparison.
      const commentTokens = comment.split(/_+/).map((t) => t.toLowerCase());

      // 2. Tokenise the test name so we can remove duplicates.
      const testTokens = new Set(testName.split(/_+/));

      // 3. Remove generic "view" token and any tokens already present in the test name.
      const filteredTokens = commentTokens.filter((token) => {
        if (!token) return false;
        if (token === "view") return false;
        return !testTokens.has(token);
      });

      const cleanedComment = filteredTokens.join("_");

      if (cleanedComment) {
        screenshotName += `_${cleanedComment}`;
      }
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

import { expect, Locator, Page, test } from "@playwright/test";

const ACTIONS_BUTTON = "main-button";
const ARTICLE_CONTAINER = "#article-container";

class BaseArticle {
  page: Page;
  mainButton: Locator;

  constructor(page: Page, mainButton?: Locator) {
    this.page = page;
    this.mainButton = mainButton || this.page.getByTestId(ACTIONS_BUTTON);
  }

  get articleContainer() {
    return this.page.locator(ARTICLE_CONTAINER);
  }

  get articleNavItems() {
    return this.articleContainer.getByTestId("article-item");
  }

  async navigate(title: string) {
    await this.articleNavItems.filter({ hasText: title }).click();
    await this.page.waitForLoadState("load");
  }

  async checkArticleActionsButtonExist() {
    return test.step("Check article actions button exist", async () => {
      await expect(this.mainButton).toBeVisible();
    });
  }

  async clickArticleMainButton() {
    return test.step("Click article main button", async () => {
      await this.checkArticleActionsButtonExist();
      await this.mainButton.click();
    });
  }
}

export default BaseArticle;

import { expect, Page } from "@playwright/test";

const ACTIONS_BUTTON = "#actions-main-button";
const ARTICLE_CONTAINER = "#article-container";

class BaseArticle {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get articleContainer() {
    return this.page.locator(ARTICLE_CONTAINER);
  }

  private get articleActionsButton() {
    return this.page.locator(ACTIONS_BUTTON);
  }

  async checkArticleActionsButtonExist() {
    await expect(this.articleActionsButton).toBeVisible();
  }

  async clickArticleMainButton() {
    await this.checkArticleActionsButtonExist();
    await this.articleActionsButton.click();
  }
}

export default BaseArticle;

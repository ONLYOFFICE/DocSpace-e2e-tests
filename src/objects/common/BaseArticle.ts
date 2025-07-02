import { expect, Locator, Page } from "@playwright/test";

const ACTIONS_BUTTON = "#actions-main-button";
const ARTICLE_CONTAINER = "#article-container";

class BaseArticle {
  page: Page;
  mainButton: Locator;

  constructor(page: Page, mainButton?: Locator) {
    this.page = page;
    this.mainButton = mainButton || this.page.locator(ACTIONS_BUTTON);
  }

  get articleContainer() {
    return this.page.locator(ARTICLE_CONTAINER);
  }

  get articleNavItems() {
    return this.articleContainer.getByTestId("article-item");
  }

  async navigate(title: string) {
    await this.articleNavItems.filter({ hasText: title }).click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async checkArticleActionsButtonExist() {
    await expect(this.mainButton).toBeVisible();
  }

  async clickArticleMainButton() {
    await this.checkArticleActionsButtonExist();
    await this.mainButton.click();
  }
}

export default BaseArticle;

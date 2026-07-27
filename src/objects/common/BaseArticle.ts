import { expect, Locator, Page } from "@playwright/test";
import AppsSidebar from "./AppsSidebar";

// The "New" button used to live in the left rail; after the redesign it sits in
// the filter toolbar. The testid survived, so the locator stays the same.
const ACTIONS_BUTTON = "[data-testid='main-button']";

class BaseArticle {
  page: Page;
  mainButton: Locator;
  sidebar: AppsSidebar;

  constructor(page: Page, mainButton?: Locator) {
    this.page = page;
    this.mainButton = mainButton || this.page.locator(ACTIONS_BUTTON);
    this.sidebar = new AppsSidebar(page);
  }

  get articleContainer() {
    return this.sidebar.container;
  }

  get articleNavItems() {
    return this.sidebar.items;
  }

  async navigate(title: string) {
    await this.sidebar.navigate(title);
  }

  async navigateToSubItem(app: string, item: string) {
    await this.sidebar.openSubItem(app, item);
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

import { Locator, Page } from "@playwright/test";
import BaseArticle from "./BaseArticle";

export default class BasePage {
  protected page: Page;
  protected article: BaseArticle;
  protected optionsButton: Locator;
  protected settingsMenuItem: Locator;
  protected paymentsMenuItem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.article = new BaseArticle(page);

    this.optionsButton = page.locator(
      '[data-testid="icon-button"].option-button-icon',
    );
    this.settingsMenuItem = page
      .locator("li.p-menuitem a.p-menuitem-link")
      .filter({ hasText: "Settings" });
    this.paymentsMenuItem = page
      .locator("li.p-menuitem a.p-menuitem-link")
      .filter({ hasText: "Payments" });
  }

  async navigateToSettings() {
    await this.optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await this.optionsButton.click();
    await this.page.waitForLoadState("domcontentloaded");
    await this.settingsMenuItem.click();
  }

  async navigateToArticle(title: string) {
    await this.article.navigate(title);
  }

  async navigateToPayments() {
    await this.optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await this.optionsButton.click();
    await this.page.waitForLoadState("domcontentloaded");
    await this.paymentsMenuItem.click();
  }
}

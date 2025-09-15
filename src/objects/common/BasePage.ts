import { Locator, Page } from "@playwright/test";
import BaseArticle from "./BaseArticle";
import BaseToast from "./BaseToast";

export default class BasePage {
  protected page: Page;
  protected article: BaseArticle;
  protected toast: BaseToast;

  constructor(page: Page) {
    this.page = page;
    this.article = new BaseArticle(page);
    this.toast = new BaseToast(page);
  }

  protected get optionsButton(): Locator {
    return this.page.getByTestId("profile_user_icon_button");
    return this.page.getByTestId("profile_user_icon_button");
  }

  protected get settingsMenuItem(): Locator {
    return this.page.getByTestId("user-menu-settings");
  }

  protected get paymentsMenuItem(): Locator {
    return this.page.getByTestId("user-menu-payments");
  }

  async removeToast(message?: string, timeout?: number) {
    await this.toast.removeToast(message, timeout);
  }

  async removeAllToast() {
    await this.toast.removeAllToast();
  }

  async navigateToSettings() {
    await this.optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await this.optionsButton.click();
    await this.page.waitForLoadState("load");
    await this.settingsMenuItem.click();
  }

  async navigateToArticle(title: string) {
    await this.article.navigate(title);
  }
}

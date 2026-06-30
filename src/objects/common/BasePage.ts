import { expect, Locator, Page } from "@playwright/test";
import BaseArticle from "./BaseArticle";
import BaseToast from "./BaseToast";

const TARIFF_BAR_TEXT = "tariff_bar_text";
const USER_MENU_ACCOUNTS = "user-menu-accounts";
const USER_MENU_PROFILE = "user-menu-profile";

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
  }

  protected get settingsMenuItem(): Locator {
    return this.page.getByTestId("user-menu-settings");
  }

  protected get paymentsMenuItem(): Locator {
    return this.page.getByTestId("user-menu-payments");
  }

  protected get profileMenuItem(): Locator {
    return this.page.getByTestId(USER_MENU_PROFILE);
  }

  protected get accountsMenuItem(): Locator {
    return this.page.getByTestId(USER_MENU_ACCOUNTS);
  }

  async checkAccountsMenuItemVisible() {
    await this.optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await this.optionsButton.click();
    await expect(this.accountsMenuItem).toBeVisible();
    await this.page.keyboard.press("Escape");
  }

  async checkAccountsMenuItemNotVisible() {
    await this.optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await this.optionsButton.click();
    await expect(this.profileMenuItem).toBeVisible();
    await expect(this.accountsMenuItem).not.toBeVisible();
    await this.page.keyboard.press("Escape");
  }

  async removeToast(message?: string, timeout?: number) {
    await this.toast.removeToast(message, timeout);
  }

  async dismissToastSafely(message: string, timeout?: number) {
    await this.toast.dismissToastSafely(message, timeout);
  }

  async checkToastMessage(message: string, timeout?: number) {
    await this.toast.checkToastMessage(message, timeout);
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

  async checkTryBusinessBarVisible() {
    await expect(this.page.getByTestId(TARIFF_BAR_TEXT)).toBeVisible();
  }

  async waitForDownload(action: () => Promise<void>) {
    const [download] = await Promise.all([
      this.page.waitForEvent("download", { timeout: 30000 }),
      action(),
    ]);

    return download;
  }
}

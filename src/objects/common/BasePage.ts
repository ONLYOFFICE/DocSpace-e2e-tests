import { Locator, Page, test } from "@playwright/test";
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
    return this.page.getByTestId('profile_user_icon_button');
  }

  protected get settingsMenuItem(): Locator {
    return this.page.getByTestId('user-menu-settings');
  }

  protected get paymentsMenuItem(): Locator {
    return this.page.getByTestId('user-menu-payments');
  }

  get myDocuments() {
    return this.page.getByRole('link', { name: 'My documents' });
  }

  get rooms() {
    return this.page.getByRole('link', { name: 'Rooms' });
  }

  async removeToast(message?: string, timeout?: number) {
    return test.step('Remove toast', async () => {
    await this.toast.removeToast(message, timeout);
  });
}

  async removeAllToast() {
    return test.step('Remove all toast', async () => {
    await this.toast.removeAllToast();
  });
  }

  async navigateToSettings() {
    return test.step('Navigate to settings', async () => {
    await this.optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await this.optionsButton.click();
    await this.page.waitForLoadState("load");
    await this.settingsMenuItem.click();
  });
}

  async navigateToArticle(title: string) {
    return test.step('Navigate to article', async () => {
    await this.article.navigate(title);
  });
}

  async navigateToMyDocuments() {
    return test.step('Navigate to my documents', async () => {
    await this.myDocuments.click();
  });
}

  async navigateToRooms() {
    return test.step('Navigate to rooms', async () => {
    await this.rooms.click();
  });
}
}


import config from "@/config";
import { Page } from "@playwright/test";

export class Profile {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigation
  get profileLink() {
    return this.page
      .locator("[data-testid='text']")
      .filter({ hasText: "admin-zero" });
  }
  get mobileAvatarIcon() {
    return this.page.locator("[data-testid='avatar']");
  }
  get mobileProfileLink() {
    return this.page.locator("(//*[@data-testid='link'])[1]");
  }

  // Profile Edit
  get nameEditButton() {
    return config.IS_MOBILE
      ? this.page.locator(
          "//div[@class='mobile-profile-row'][1]//*[name()='svg'][@class='injected-svg']",
        )
      : this.page.locator(
          "div.profile-block-field [data-testid='icon-button']",
        );
  }
  get firstNameInput() {
    return this.page.locator(
      "[data-testid='text-input'][placeholder='First name']",
    );
  }
  get lastNameInput() {
    return this.page.locator(
      "[data-testid='text-input'][placeholder='Last name']",
    );
  }
  get saveButton() {
    return this.page.locator("[data-testid='button'][tabindex='3']");
  }
  get changePasswordButton() {
    return config.IS_MOBILE
      ? this.page.locator(
          "div[class='mobile-profile-row']:nth-of-type(3) svg[role='img']",
        )
      : this.page.locator(
          "div.profile-block-field.profile-block-password [data-testid='icon-button']",
        );
  }
  get sendPasswordChangeButton() {
    return this.page.locator("[data-testid='button']");
  }

  // Language Selector
  get languageSelector() {
    return config.IS_MOBILE
      ? this.page.locator(
          "div.mobile-language__wrapper-combo-box [data-testid='combobox']",
        )
      : this.page.locator(
          "div.language-combo-box-wrapper [data-testid='combobox']",
        );
  }
  get germanLanguageOption() {
    return config.IS_MOBILE
      ? this.page.locator(
          "(//div//span[@dir='auto'][normalize-space()='Deutsch (Deutschland)'])[2]",
        )
      : this.page.locator("[data-testid='drop-down-item']", {
          hasText: "Deutsch",
        });
  }
  get englishLanguageOption() {
    return config.IS_MOBILE
      ? this.page.locator(
          "(//div//span[@dir='auto'][normalize-space()='English (United Kingdom)'])[2]",
        )
      : this.page.locator("[data-testid='drop-down-item']", {
          hasText: "English",
        });
  }

  // Tabs
  get loginTab() {
    return this.page.locator("div.sticky", { hasText: "Login" });
  }
  get notificationsTab() {
    return this.page.locator("div.sticky", { hasText: "Notifications" });
  }
  get fileManagementTab() {
    return this.page.locator("div.sticky", { hasText: "File Management" });
  }
  get interfaceThemeTab() {
    return this.page.locator("div.sticky", { hasText: "Interface Theme" });
  }
  get authorizedAppsTab() {
    return this.page.locator("div.sticky", { hasText: "Authorized Apps" });
  }

  async navigateToProfile() {
    if (config.IS_MOBILE) {
      await this.mobileAvatarIcon.click();
      await this.mobileProfileLink.click();
      return;
    }
    await this.profileLink.click();
  }

  async editName(firstName: string, lastName: string) {
    await this.nameEditButton.click();
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.saveButton.click();
  }

  async changePassword() {
    await this.changePasswordButton.click();
    await this.sendPasswordChangeButton.nth(-2).click();
  }

  async changeLanguage() {
    await this.languageSelector.click();
    await this.germanLanguageOption.click();
  }

  async selectNotificationsTabs() {
    await this.notificationsTab.click();
  }

  async selectFileManagementTabs() {
    await this.fileManagementTab.click();
  }

  async selectInterfaceThemeTabs() {
    await this.interfaceThemeTab.click();
  }

  async selectAuthorizedAppsTabs() {
    await this.authorizedAppsTab.click();
  }

  async selectLoginTabs() {
    await this.loginTab.click();
  }
}

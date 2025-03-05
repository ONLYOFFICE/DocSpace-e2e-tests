import config from "../../config/config.js";

export class ProfilePage {
  constructor(page) {
    this.page = page;

    // Navigation
    this.profileLink = "[data-testid='text']:has-text('admin-zero')";
    this.mobileAvatarIcon = "[data-testid='avatar']"; //icon of current user in mobile view
    this.mobileProfileLink = "(//*[@data-testid='link'])[1]";
    // Profile Edit
    this.nameEditButton = config.IS_MOBILE
      ? "//div[@class='mobile-profile-row'][1]//*[name()='svg'][@class='injected-svg']" //if IS_MOBILE=true
      : "div.profile-block-field [data-testid='icon-button']"; //if IS_MOBILE=false
    this.firstNameInput =
      "[data-testid='text-input'][placeholder='First name']";
    this.lastNameInput = "[data-testid='text-input'][placeholder='Last name']";
    this.saveButton = "[data-testid='button'][tabindex='3']";
    this.changePasswordButton = config.IS_MOBILE
      ? "div[class='mobile-profile-row']:nth-of-type(3) svg[role='img']" //if IS_MOBILE=true
      : "div.profile-block-field.profile-block-password [data-testid='icon-button']"; //if IS_MOBILE=false
    this.sendPasswordChangeButton = "[data-testid='button']";

    // Language Selector
    this.languageSelector = config.IS_MOBILE
      ? "div.mobile-language__wrapper-combo-box [data-testid='combobox']" //if IS_MOBILE=true
      : "div.language-combo-box-wrapper [data-testid='combobox']"; //if IS_MOBILE=false
    this.germanLanguageOption = config.IS_MOBILE
      ? "(//div//span[@dir='auto'][normalize-space()='Deutsch (Deutschland)'])[2]" //if IS_MOBILE=true
      : "[data-testid='drop-down-item'] >> text=Deutsch"; //if IS_MOBILE=false
    this.englishLanguageOption = config.IS_MOBILE
      ? "(//div//span[@dir='auto'][normalize-space()='English (United Kingdom)'])[2]" //if IS_MOBILE=true
      : "[data-testid='drop-down-item'] >> text=English"; //if IS_MOBILE=false

    // Tabs
    this.loginTab = "div.sticky >> text=Login";
    this.notificationsTab = "div.sticky >> text=Notifications";
    this.fileManagementTab = "div.sticky >> text=File Management";
    this.interfaceThemeTab = "div.sticky >> text=Interface Theme";
    this.authorizedAppsTab = "div.sticky >> text=Authorized Apps";
  }

  async navigateToProfile() {
    if (config.IS_MOBILE) {
      await this.page.click(this.mobileAvatarIcon);
      await this.page.click(this.mobileProfileLink);
      return;
    }
    await this.page.click(this.profileLink);
  }

  async editName(firstName, lastName) {
    await this.page.click(this.nameEditButton);
    await this.page.fill(this.firstNameInput, firstName);
    await this.page.fill(this.lastNameInput, lastName);
    await this.page.click(this.saveButton);
  }

  async changePassword() {
    await this.page.click(this.changePasswordButton);
    await this.page.locator(this.sendPasswordChangeButton).nth(-2).click();
  }

  async changeLanguage() {
    await this.page.click(this.languageSelector);
    await this.page.click(this.germanLanguageOption);
  }

  async selectNotificationsTabs() {
    await this.page.click(this.notificationsTab);
  }

  async selectFileManagementTabs() {
    await this.page.click(this.fileManagementTab);
  }

  async selectInterfaceThemeTabs() {
    await this.page.click(this.interfaceThemeTab);
  }

  async selectAuthorizedAppsTabs() {
    await this.page.click(this.authorizedAppsTab);
  }

  async selectLoginTabs() {
    await this.page.click(this.loginTab);
  }
}

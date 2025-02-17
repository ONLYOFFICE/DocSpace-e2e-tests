export class ProfilePage {
  constructor(page) {
    this.page = page;

    // Navigation
    this.profileLink = "[data-testid='text']:has-text('admin-zero')";

    // Profile Edit
    this.nameEditButton = "div.profile-block-field [data-testid='icon-button']";
    this.firstNameInput =
      "[data-testid='text-input'][placeholder='First name']";
    this.lastNameInput = "[data-testid='text-input'][placeholder='Last name']";
    this.saveButton = "[data-testid='button'][tabindex='3']";
    this.changePasswordButton =
      "div.profile-block-field.profile-block-password [data-testid='icon-button']";
    this.sendPasswordChangeButton = "[data-testid='button']";

    // Language Selector
    this.languageSelector =
      "div.language-combo-box-wrapper [data-testid='combobox']";
    this.germanLanguageOption =
      "[data-testid='drop-down-item'] >> text=Deutsch";
    this.englishLanguageOption =
      "[data-testid='drop-down-item'] >> text=English";

    // Tabs
    this.loginTab = "div.sticky >> text=Login";
    this.notificationsTab = "div.sticky >> text=Notifications";
    this.fileManagementTab = "div.sticky >> text=File Management";
    this.interfaceThemeTab = "div.sticky >> text=Interface Theme";
    this.authorizedAppsTab = "div.sticky >> text=Authorized Apps";
  }

  async navigateToProfile() {
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
    await this.page.locator(this.sendPasswordChangeButton).first().click();
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

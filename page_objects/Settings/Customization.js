import MainPage from "../mainPage";

export class Customization extends MainPage {
  constructor(page) {
    super(page);
    this.page = page;
    this.languageSelector = page
      .locator('[data-test-id="combo-button"]')
      .first();
    this.timezoneSelector = page
      .locator('[data-test-id="combo-button"]')
      .nth(1);
    this.settingsTitle = page.getByText(
      "Language and Time Zone SettingsChange Language and Time Zone Settings to adjust",
    );
    this.saveButton = page.locator('[data-testid="save-button"]');
    this.titleInput = page.getByPlaceholder("Enter title");
    this.textInput = page.locator('[data-testid="logo-text-input"]');
    this.generateLogoButton = page.locator(
      '[data-testid="generate-logo-button"]',
    );
    this.restoreButton = page.locator('[data-testid="cancel-button"]');
    this.themeContainer = page.locator(".theme-container").first();
    this.darkThemeOption = page
      .locator("div")
      .filter({ hasText: /^Dark theme$/ })
      .first();
    this.saveButtonAppearance = page.locator(
      '[data-testid="button"]:has-text("Save")',
    );
    this.themeAdd = page.locator(".theme-add");
    this.accentColorInput = page.locator("#accent");
    this.buttonsColorInput = page.locator("#buttons");
    this.deleteThemeButton = page.getByRole("button", { name: "Delete theme" });
    this.confirmDeleteButton = page.getByRole("button", {
      name: "Delete",
      exact: true,
    });
    this.docspaceLanguageGuideLink = page.getByTestId("link").first();
    this.docspaceTitleGuideLink = page.getByTestId("link").nth(1);
    this.docspaceAlternativeUrlGuideLink = page.getByTestId("link").nth(2);
    this.docspaceRenamingGuideLink = page.getByTestId("link").nth(3);
    this.removeToast = page.getByText(
      "Settings have been successfully updated",
    );
    this.removeToast2 = page.getByText(
      "Welcome Page settings have been successfully saved",
    );
    this.navigateToAppearance = page.getByText("Appearance");
    this.approveNewColorSheme = page
      .getByRole("button", { name: "Save" })
      .nth(1);
    this.renamingString = page.getByPlaceholder("Enter name");
    this.cancelRenaming = page
      .locator("#buttonsPortalRenaming")
      .getByTestId("cancel-button");
    this.saveRenaming = page
      .locator("#buttonsPortalRenaming")
      .getByTestId("save-button");
    this.continue = page.getByLabel("Continue");
    this.webOnly = page.locator('#by-web input[type="radio"]');
    this.appOnly = page.locator('#by-app input[type="radio"]');
    this.webOrApp = page.locator('#provide-a-choice input[type="radio"]');
  }

  async changeLanguage(language) {
    await this.languageSelector.click();
    await this.page.waitForSelector(`text=${language}`);
    await this.page.locator(`text=${language}`).first().click();
  }

  async changeTimezone(timezone) {
    await this.timezoneSelector.click();
    await this.page.waitForSelector(`text=${timezone}`);
    await this.page.locator(`text=${timezone}`).first().click();
  }

  async setTitle() {
    await this.titleInput.fill("DocSpace Autotest Portal");
    await this.saveButton.nth(1).click();
  }

  async generateLogo() {
    await this.textInput.nth(1).fill("AutoTesting");
    await this.generateLogoButton.click();
    await this.saveButton.nth(1).click();
  }

  async brandName() {
    await this.textInput.first().fill("AutoTesting");
    await this.saveButton.first().click();
  }

  async selectTheme() {
    await this.page.locator('div[id="5"]').click();
  }

  async selectTheme2() {
    await this.page.locator('div[id="2"]').click();
  }

  async createCustomTheme(accentColor, buttonsColor) {
    await this.themeAdd.click();
    await this.accentColorInput.click();
    await this.page.getByRole("textbox").fill(accentColor);
    await this.page.getByRole("button", { name: "Apply" }).click();
    await this.buttonsColorInput.click();
    await this.page.getByRole("textbox").fill(buttonsColor);
    await this.page.getByRole("button", { name: "Apply" }).click();
    await this.approveNewColorSheme.click();
  }

  async deleteCustomTheme() {
    await this.deleteThemeButton.click();
    await this.confirmDeleteButton.click();
  }

  async uploadPictures() {
    await this.page
      .locator("#logoUploader_1_light")
      .setInputFiles("data/Space header/PNG.png");
    await this.page
      .locator("#logoUploader_1_dark")
      .setInputFiles("data/Space header/JPG.jpg");
    await this.page
      .locator("#logoUploader_6_light")
      .setInputFiles("data/Logo compack left menu/PNG.png");
    await this.page
      .locator("#logoUploader_6_dark")
      .setInputFiles("data/Logo compack left menu/JPG.jpg");
    await this.page
      .locator("#logoUploader_2_light")
      .setInputFiles("data/Login page and emails/PNG.png");
    await this.page
      .locator("#logoUploader_2_dark")
      .setInputFiles("data/Login page and emails/JPG.jpg");
    await this.page
      .locator("#logoUploader_3_light")
      .setInputFiles("data/Favicon/png.png");
    await this.page
      .locator("#logoUploader_4_light")
      .setInputFiles("data/Editors header/png.png");
    await this.page
      .locator("#logoUploader_5_light")
      .setInputFiles("data/Editors header/png.png");
    await this.saveButton.nth(1).click();
  }

  async renamePortal() {
    const url = new URL(this.page.url());
    const originalName = url.hostname.split(".")[0];
    const newName = originalName + "1";
    await this.renamingString.fill(newName);
    await this.cancelRenaming.click();
    await this.renamingString.fill(newName);
    await this.saveRenaming.click();
    await this.continue.click();
    return { originalName, newName };
  }

  async renamePortalBack(originalName) {
    await this.page.waitForURL(`https://${originalName}1.onlyoffice.io/**`);
    await this.navigateToSettings();
    await this.renamingString.fill(originalName);
    await this.saveRenaming.click();
    await this.continue.click();
    await this.page.waitForURL(`https://${originalName}.onlyoffice.io/**`);
    return originalName;
  }

  async choseDeepLink() {
    await this.appOnly.click({ force: true });
    await this.restoreButton.nth(3).click();
    await this.webOnly.click({ force: true });
    await this.restoreButton.nth(3).click();
    await this.appOnly.click({ force: true });
    await this.saveButton.nth(3).click();
  }
}
export default Customization;

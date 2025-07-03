import BasePage from "@/src/objects/common/BasePage";
import navItems from "@/src/utils/constants/settings";
import BaseToast from "../../common/BaseToast";
import { Page } from "@playwright/test";

class Customization extends BasePage {
  protected toast: BaseToast;

  constructor(page: Page) {
    super(page);
    this.toast = new BaseToast(page);
  }

  get languageSelector() {
    return this.page.locator('[data-test-id="combo-button"]').first();
  }
  get timezoneSelector() {
    return this.page.locator('[data-test-id="combo-button"]').nth(1);
  }
  get settingsTitle() {
    return this.page.getByText(
      "Language and Time Zone SettingsChange Language and Time Zone Settings to adjust",
    );
  }
  get saveButton() {
    return this.page.locator('[data-testid="save-button"]');
  }
  get titleInput() {
    return this.page.getByPlaceholder("Enter title");
  }
  get textInput() {
    return this.page.locator('[data-testid="logo-text-input"]');
  }
  get generateLogoButton() {
    return this.page.locator('[data-testid="generate-logo-button"]');
  }
  get restoreButton() {
    return this.page.locator('[data-testid="cancel-button"]');
  }
  get themeContainer() {
    return this.page.locator(".theme-container").first();
  }
  get darkThemeOption() {
    return this.page
      .locator("div")
      .filter({ hasText: /^Dark theme$/ })
      .first();
  }
  get saveButtonAppearance() {
    return this.page.locator('[data-testid="button"]:has-text("Save")');
  }
  get themeAdd() {
    return this.page.locator(".theme-add");
  }
  get accentColorInput() {
    return this.page.locator("#accent");
  }
  get buttonsColorInput() {
    return this.page.locator("#buttons");
  }
  get deleteThemeButton() {
    return this.page.getByRole("button", { name: "Delete theme" });
  }
  get confirmDeleteButton() {
    return this.page.getByRole("button", {
      name: "Delete",
      exact: true,
    });
  }
  get docspaceLanguageGuideLink() {
    return this.page.getByTestId("link").first();
  }
  get docspaceTitleGuideLink() {
    return this.page.getByTestId("link").nth(1);
  }
  get docspaceAlternativeUrlGuideLink() {
    return this.page.getByTestId("link").nth(2);
  }
  get docspaceRenamingGuideLink() {
    return this.page.getByTestId("link").nth(3);
  }

  get removeToast2() {
    return this.page.getByText(
      "Welcome Page settings have been successfully saved",
    );
  }

  get approveNewColorSheme() {
    return this.page.getByRole("button", { name: "Save" }).nth(1);
  }
  get renamingString() {
    return this.page.getByPlaceholder("Enter name");
  }
  get cancelRenaming() {
    return this.page
      .locator("#buttonsPortalRenaming")
      .getByTestId("cancel-button");
  }
  get saveRenaming() {
    return this.page
      .locator("#buttonsPortalRenaming")
      .getByTestId("save-button");
  }
  get continue() {
    return this.page.getByLabel("Continue");
  }
  get webOnly() {
    return this.page.locator('#by-web input[type="radio"]');
  }
  get appOnly() {
    return this.page.locator('#by-app input[type="radio"]');
  }
  get webOrApp() {
    return this.page.locator('#provide-a-choice input[type="radio"]');
  }

  async hideDnsSettingsInput() {
    await this.page.locator("#textInputContainerDNSSettings").evaluate((el) => {
      (el as HTMLElement).style.display = "none";
    });
  }

  async open() {
    await this.navigateToSettings();
    await this.navigateToArticle(navItems.customization);
  }

  async openTab(tab: "General" | "Branding" | "Appearance") {
    await this.page.getByText(tab, { exact: true }).click();
  }

  async changeLanguage(language: string) {
    await this.languageSelector.click();
    await this.page.waitForSelector(`text=${language}`);
    await this.page.locator(`text=${language}`).first().click();
  }

  async changeTimezone(timezone: string) {
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

  async createCustomTheme(accentColor: string, buttonsColor: string) {
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
    const upload = async (selector: string, filePath: string) => {
      await Promise.all([
        this.page.waitForResponse(
          (res) =>
            res.url().includes("logoUploader.ashx") && res.status() === 200,
        ),
        this.page.locator(selector).setInputFiles(filePath),
      ]);
    };

    await upload("#logoUploader_1_light", "data/space_header/PNG.png");
    await upload("#logoUploader_1_dark", "data/space_header/JPG.jpg");
    await upload("#logoUploader_6_light", "data/left_menu/PNG.png");
    await upload("#logoUploader_6_dark", "data/left_menu/JPG.jpg");
    await upload("#logoUploader_2_light", "data/login_page/PNG.png");
    await upload("#logoUploader_2_dark", "data/login_page/JPG.jpg");
    await upload("#logoUploader_3_light", "data/favicon/png.png");
    await upload("#logoUploader_4_light", "data/editor_header/png.png");
    await upload("#logoUploader_5_light", "data/editor_header/png.png");

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

  async renamePortalBack(originalName: string) {
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

import BasePage from "@/src/objects/common/BasePage";
import { navItems } from "@/src/utils/constants/settings";
import { expect, Page, Locator } from "@playwright/test";
import { BaseDropdown } from "@/src/objects/common/BaseDropdown";
import path from "path";
import fs from "fs";

class Customization extends BasePage {
  protected dropdown: BaseDropdown;

  constructor(page: Page) {
    super(page);
    this.dropdown = new BaseDropdown(page, {
      menu: this.page.getByRole("listbox"),
    });
  }

  get languageSelector() {
    return this.page.getByTestId("language_and_time_zone_combo_box_language");
  }
  get timezoneSelector() {
    return this.page.getByTestId("language_and_time_zone_combo_box_timezone");
  }
  get settingsTitle() {
    return this.page.getByText(
      "Language and Time Zone SettingsChange Language and Time Zone Settings to adjust",
    );
  }
  get saveButton() {
    return this.page.locator('[data-testid="save-button"]');
  }
  get languageTimeZoneSaveButton() {
    return this.page.getByTestId("language_and_time_zone_save_buttons");
  }
  get customizationWelcomeSaveButton() {
    return this.page.getByTestId("customization_welcome_page_save_buttons");
  }
  get customizationWelcomeCancelButton() {
    return this.page.getByTestId("customization_welcome_page_cancel_buttons");
  }
  get brandNameSaveButton() {
    return this.page.getByTestId("brand_name_save_button");
  }
  get brandNameCancelButton() {
    return this.page.getByTestId("brand_name_cancel_button");
  }
  get logoSaveButton() {
    return this.page.getByTestId("white-label-save");
  }
  get logoRestoreButton() {
    return this.page.getByTestId("white-label-cancel");
  }
  get titleInput() {
    return this.page.getByPlaceholder("Enter title");
  }
  get textInputLogo() {
    return this.page.locator('[data-testid="logo-text-input"]');
  }
  get textInputBrandName() {
    return this.page.locator('[data-testid="brand_name_input"]');
  }
  get generateLogoButton() {
    return this.page.locator('[data-testid="generate-logo-button"]');
  }
  get restoreButton() {
    return this.page.locator('[data-testid="cancel-button"]');
  }
  get configureDeepLinkCancelButton() {
    return this.page.locator(
      '[data-testid="configure_deep_link_cancel_button"]',
    );
  }
  get configureDeepLinkSaveButton() {
    return this.page.locator('[data-testid="configure_deep_link_save_button"]');
  }
  get themeContainer() {
    return this.page.locator(".theme-container").first();
  }
  get darkThemeOption() {
    return this.page.locator('[data-testid="dark-theme_subtab"]');
  }
  get saveButtonAppearance() {
    return this.page.locator('[data-testid="appearance_save_button"]');
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
    return this.page.locator('[data-testid="appearance_delete_button"]');
  }
  get confirmDeleteButton() {
    return this.page.getByRole("button", {
      name: "Delete",
      exact: true,
    });
  }
  get docspaceLanguageGuideLink() {
    return this.page.getByTestId("language_and_time_zone_link");
  }
  get docspaceTitleGuideLink() {
    return this.page.getByTestId("customization_welcome_page_learn_more");
  }
  get docspaceAlternativeUrlGuideLink() {
    return this.page.getByTestId("customization_dns_settings_learn_more");
  }
  get docspaceRenamingGuideLink() {
    return this.page.getByTestId("portal_renaming_learn_more");
  }

  get approveNewColorSheme() {
    return this.page.locator('[data-testid="color_scheme_dialog_save"]');
  }
  get renamingString() {
    return this.page.getByPlaceholder("Enter name");
  }
  get cancelRenaming() {
    return this.page.locator(
      '[data-testid="customization_portal_renaming_cancel_button"]',
    );
  }
  get saveRenaming() {
    return this.page.locator(
      '[data-testid="customization_portal_renaming_save_button"]',
    );
  }
  get continue() {
    return this.page.getByLabel("Continue");
  }
  get webOnly() {
    return this.page.locator("#by-web");
  }
  get appOnly() {
    return this.page.locator("#by-app");
  }
  get webOrApp() {
    return this.page.locator("#provide-a-choice");
  }

  get customThemes() {
    return this.page.locator(".custom-themes");
  }

  get customTheme() {
    return this.customThemes.locator(".check-img");
  }

  get categoryDescription() {
    return this.page.locator(".category-description");
  }

  get settingsBlock() {
    return this.page.locator(".settings-block");
  }

  get saveCancelReminder() {
    return this.page.getByTestId("save-cancel-reminder");
  }

  async hideDnsSettingsInput() {
    await this.page.locator("#textInputContainerDNSSettings").evaluate((el) => {
      (el as HTMLElement).style.display = "none";
    });
  }

  private async checkGeneralExist() {
    await expect(this.categoryDescription).toHaveText(
      /This subsection allows .*/,
    );
  }

  private async checkBrandingExist() {
    await expect(
      this.page.locator('.header-container:has-text("Logo settings")'),
    ).toBeVisible();
  }

  private async checkAppearanceExist() {
    await expect(this.themeContainer).toBeVisible();
  }

  async open() {
    await this.navigateToSettings();
    await this.navigateToArticle(navItems.customization);
    await this.checkGeneralExist();
  }

  async openTab(tab: "General" | "Branding" | "Appearance") {
    await this.page.getByText(tab, { exact: true }).click();

    switch (tab) {
      case "General":
        await this.checkGeneralExist();
        break;
      case "Branding":
        await this.checkBrandingExist();
        break;
      case "Appearance":
        await this.checkAppearanceExist();
        break;
      default:
        throw new Error("Invalid tab");
    }
  }

  async changeLanguage(language: string) {
    await this.waitForComboButtonEnabled(this.languageSelector);
    await this.languageSelector.click();
    await this.dropdown.clickOption(language);
  }

  async changeTimezone(timezone: string) {
    await this.waitForComboButtonEnabled(this.timezoneSelector);
    await this.timezoneSelector.click();
    await this.dropdown.clickOption(timezone);
  }

  async setTitle() {
    await this.titleInput.fill("DocSpace Autotest Portal");
  }

  async generateLogo() {
    await this.textInputLogo.fill("AutoTesting");
    await this.generateLogoButton.click();
    await this.logoSaveButton.click();
  }

  async brandName() {
    await this.textInputBrandName.first().fill("AutoTesting");
    await expect(this.brandNameSaveButton).toBeVisible();
    await this.brandNameSaveButton.click();
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

  async checkCustomThemeNotExist() {
    await expect(this.customTheme).toHaveCount(0);
  }

  async uploadPictures() {
    const upload = async (selector: string, filePath: string) => {
      const resolvedPath = path.resolve(process.cwd(), filePath);

      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`File not found: ${resolvedPath}`);
      }
      await Promise.all([
        this.page.waitForResponse(
          (res) => res.url().includes("/upload") && res.status() === 200,
        ),
        this.page.locator(selector).setInputFiles(resolvedPath),
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
    await upload("#logoUploader_5_light", "data/editor_header/jpg.jpg");

    await this.logoSaveButton.click();
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
    await this.appOnly.click();
    await this.configureDeepLinkCancelButton.click();
    await this.webOnly.click();
    await this.configureDeepLinkCancelButton.click();
    await this.appOnly.click();
    await this.configureDeepLinkSaveButton.click();
  }

  private async waitForComboButtonEnabled(comboButton: Locator) {
    await expect(comboButton).toBeVisible();
  }
}

export default Customization;

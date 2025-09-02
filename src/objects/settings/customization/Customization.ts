import BasePage from "@/src/objects/common/BasePage";
import { navItems, toastMessages } from "@/src/utils/constants/settings";
import { expect, Page } from "@playwright/test";
import { BaseDropdown } from "@/src/objects/common/BaseDropdown";

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
    return this.page.locator(
      '[data-testid="settings-title"]:has-text("Language and Time Zone SettingsChange Language and Time Zone Settings to adjust")',
    );
  }
  get saveButtonLanguage() {
    return this.page.getByTestId("language_and_time_zone_save_buttons");
  }
  get cancelButtonLanguage() {
    return this.page.getByTestId("language_and_time_zone_cancel_buttons");
  }
  get titleInput() {
    return this.page.getByTestId("customization_welcome_page_text_input");
  }
  get brandNameInput() {
    return this.page.getByTestId("brand_name_input");
  }
  get textInput() {
    return this.page.getByTestId("logo-text-input");
  }
  get generateLogoButton() {
    return this.page.getByTestId("generate-logo-button");
  }
  get restoreButton() {
    return this.page.getByTestId("customization_welcome_page_cancel_buttons");
  }
  get saveWelcomePageButton() {
    return this.page.getByTestId("customization_welcome_page_save_buttons");
  }
  get saveButtonBrandname() {
    return this.page.getByTestId("brand_name_save_button");
  }
  get cancelButtonBrandname() {
    return this.page.getByTestId("brand_name_cancel_button");
  }
  get saveLabelButtonBrandname() {
    return this.page.getByTestId("white-label-save");
  }
  get restoreButtonBrandname() {
    return this.page.getByTestId("white-label-cancel");
  }
  get themeContainer() {
    return this.page.locator(".theme-container").first();
  }
  get darkThemeOption() {
    return this.page.getByTestId("dark-theme_subtab");
  }
  get saveButtonAppearance() {
    return this.page.getByTestId("appearance_save_button");
  }
  get themeAdd() {
    return this.page.getByTestId("appearance_add_theme");
  }
  get accentColorInput() {
    return this.page.getByTestId("color_scheme_dialog_accent");
  }
  get buttonsColorInput() {
    return this.page.getByTestId("color_scheme_dialog_buttons");
  }
  get deleteThemeButton() {
    return this.page.getByTestId("appearance_delete_button");
  }
  get confirmDeleteThemeButton() {
    return this.page.getByTestId("portal_settings_modal_dialog_delete_button");
  }
  get cancelDeleteThemeButton() {
    return this.page.getByTestId("portal_settings_modal_dialog_cancel_button");
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
    return this.page.getByTestId("color_scheme_dialog_save");
  }
  get cancelNewColorSheme() {
    return this.page.getByTestId("color_scheme_dialog_cancel");
  }
  get renamingString() {
    return this.page.getByTestId("customization_portal_renaming_text_input");
  }
  get cancelRenaming() {
    return this.page.getByTestId("customization_portal_renaming_cancel_button");
  }
  get saveRenaming() {
    return this.page.getByTestId("customization_portal_renaming_save_button");
  }
  get continue() {
    return this.page.getByTestId("portal_renaming_continue_button");
  }
  get webOnly() {
    return this.page.getByTestId("deep_link_by-web");
  }
  get appOnly() {
    return this.page.getByTestId("deep_link_by-app");
  }
  get webOrApp() {
    return this.page.getByTestId("deep_link_provide-a-choice");
  }
  get saveButtonDeepLink() {
    return this.page.getByTestId("configure_deep_link_save_button");
  }
  get cancelButtonDeepLink() {
    return this.page.getByTestId("configure_deep_link_cancel_button");
  }
  get customThemes() {
    return this.page.locator(".custom-themes");
  }

  get customTheme() {
    return this.customThemes.getByTestId("appearance_standard_theme_6");
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
    await this.languageSelector.click();
    await this.dropdown.clickOption(language);
  }

  async changeTimezone(timezone: string) {
    await this.timezoneSelector.click();
    await this.dropdown.clickOption(timezone);
  }

  async setTitle() {
    await this.titleInput.fill("DocSpace Autotest Portal");
    await this.saveWelcomePageButton.click();
  }

  async generateLogo() {
    await this.page.getByTestId("logo-text-input").fill("AutoTesting");
    await this.generateLogoButton.click();
    //await this.saveWelcomePageButton.click();
  }

  async brandName() {
    await this.page.getByTestId("brand_name_input").fill("AutoTesting");
    await this.saveButtonBrandname.click();
  }

  async selectTheme() {
    await this.page.getByTestId("appearance_standard_theme_5").click();
  }

  async selectTheme2() {
    await this.page.getByTestId("appearance_standard_theme_2").click();
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
    await this.confirmDeleteThemeButton.click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async checkCustomThemeNotExist() {
    await expect(this.customTheme).toHaveCount(0);
  }

  async uploadPictures() {
    await this.page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="file"]');
      inputs.forEach((input) => {
        input.style.visibility = "visible";
        input.style.opacity = "1";
        input.style.position = "static";
        input.style.width = "100%";
        input.style.height = "100%";
        input.style.display = "block";
      });
    });

    const uploads = [
      [
        "logo_uploader_light_small_light",
        "logoUploader_1_light",
        "data/space_header/PNG.png",
      ],
      [
        "logo_uploader_light_small_dark",
        "logoUploader_1_dark",
        "data/space_header/JPG.jpg",
      ],
      [
        "logo_uploader_left_menu_light",
        "logoUploader_6_light",
        "data/left_menu/PNG.png",
      ],
      [
        "logo_uploader_left_menu_dark",
        "logoUploader_6_dark",
        "data/left_menu/JPG.jpg",
      ],
      [
        "logo_uploader_login_page_light",
        "logoUploader_2_light",
        "data/login_page/PNG.png",
      ],
      [
        "logo_uploader_login_page_dark",
        "logoUploader_2_dark",
        "data/login_page/JPG.jpg",
      ],
      [
        "logo_uploader_favicon_light",
        "logoUploader_3_light",
        "data/favicon/png.png",
      ],
      [
        "logo_uploader_docs_editor_light",
        "logoUploader_4_light",
        "data/editor_header/png.png",
      ],
      [
        "logo_uploader_docs_editor_dark",
        "logoUploader_5_light",
        "data/editor_header/jpg.jpg",
      ],
    ];

    for (const [_, inputId, path] of uploads) {
      try {
        const input = this.page.getByTestId(inputId);
        await input.waitFor({ state: "visible", timeout: 5000 });
        await input.setInputFiles(path);
        await this.page.waitForTimeout(500);
      } catch (e) {
        console.error(`Ошибка при загрузке файла в ${inputId}:`, e);
      }
    }
    await this.saveLabelButtonBrandname.click();
    await this.removeToast(toastMessages.settingsUpdated);
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
    await this.cancelButtonDeepLink.click();
    await this.webOnly.click();
    await this.cancelButtonDeepLink.click();
    await this.appOnly.click();
    await this.saveButtonDeepLink.click();
  }

  async cancelChanges() {
    await this.cancelButton.click();
  }
}

export default Customization;

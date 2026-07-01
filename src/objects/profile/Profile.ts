import { expect, Locator, Page } from "@playwright/test";
import { avatarConstants } from "@/src/utils/constants/profile";
import BasePage from "../common/BasePage";

const TWO_FACTOR_BANNER = "campaigns-banner";
const TWO_FACTOR_BANNER_TEXT = "Enable two-factor authentication";
const TFA_SHOW_BACKUP_CODES = "show_backup_codes_button";
const TFA_RESET_APP = "reset_app_link";
const TFA_BACKUP_CODES_CONTAINER = "backup_codes_container";
const TFA_BACKUP_CODE_ITEMS = '[data-testid^="backup_code_"]';
const TFA_BACKUP_CODES_CANCEL = "backup_codes_cancel_button";
const TFA_PRINT_BACKUP_CODES = "print_backup_codes_link";
const TFA_REQUEST_NEW_CODES = "request_new_backup_codes_button";
const TFA_RESET_APP_CONFIRM = "dialog_reset_app_button";
const TFA_RESET_APP_CANCEL = "dialog_reset_app_cancel_button";

export class Profile extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Navigation
  private get sidebarAvatarButton(): Locator {
    return this.page.getByTestId("profile_user_avatar");
  }

  private get campaignsBanner(): Locator {
    return this.page.getByTestId(TWO_FACTOR_BANNER);
  }

  async checkCampaignsBannerVisible() {
    await expect(this.campaignsBanner).toBeVisible();
    await expect(this.campaignsBanner).toContainText(TWO_FACTOR_BANNER_TEXT);
  }

  async checkCampaignsBannerNotVisible() {
    await expect(this.campaignsBanner).not.toBeVisible();
  }

  async clickCampaignsBanner() {
    await this.campaignsBanner.click();
  }

  private get showBackupCodesButton(): Locator {
    return this.page.getByTestId(TFA_SHOW_BACKUP_CODES);
  }

  private get resetAppLink(): Locator {
    return this.page.getByTestId(TFA_RESET_APP);
  }

  private get backupCodesContainer(): Locator {
    return this.page.getByTestId(TFA_BACKUP_CODES_CONTAINER);
  }

  private get backupCodes(): Locator {
    return this.page.locator(TFA_BACKUP_CODE_ITEMS);
  }

  private get backupCodesCancelButton(): Locator {
    return this.page.getByTestId(TFA_BACKUP_CODES_CANCEL);
  }

  private get printBackupCodesLink(): Locator {
    return this.page.getByTestId(TFA_PRINT_BACKUP_CODES);
  }

  private get requestNewBackupCodesButton(): Locator {
    return this.page.getByTestId(TFA_REQUEST_NEW_CODES);
  }

  private get resetAppConfirmButton(): Locator {
    return this.page.getByTestId(TFA_RESET_APP_CONFIRM);
  }

  private get resetAppCancelButton(): Locator {
    return this.page.getByTestId(TFA_RESET_APP_CANCEL);
  }

  async checkTfaSettingsBlockVisible() {
    await expect(this.showBackupCodesButton).toBeVisible();
    await expect(this.resetAppLink).toBeVisible();
  }

  async clickShowBackupCodes() {
    await this.showBackupCodesButton.click();
  }

  async checkBackupCodesDialogVisible() {
    await expect(this.backupCodesContainer).toBeVisible();
    await expect(this.backupCodesCancelButton).toBeVisible();
    await expect(this.printBackupCodesLink).toBeVisible();
    await expect(this.requestNewBackupCodesButton).toBeVisible();
  }

  async checkBackupCodesCount(expected: number) {
    await expect(this.backupCodes).toHaveCount(expected);
  }

  async clickPrintBackupCodes() {
    await this.printBackupCodesLink.click();
  }

  async closeBackupCodesDialog() {
    await this.backupCodesCancelButton.click();
  }

  async checkBackupCodesDialogNotVisible() {
    await expect(this.backupCodesContainer).not.toBeVisible();
  }

  async clickResetApp() {
    await this.resetAppLink.click();
  }

  async checkResetAppDialogVisible() {
    await expect(this.resetAppConfirmButton).toBeVisible();
    await expect(this.resetAppCancelButton).toBeVisible();
  }

  async confirmResetApp() {
    await this.resetAppConfirmButton.click();
  }

  async closeResetAppDialog() {
    await this.resetAppCancelButton.click();
  }

  private get profileContextMenuButton(): Locator {
    return this.page.locator(
      "#header_optional-button[data-testid='icon-button']",
    );
  }

  private get changeNameMenuItem(): Locator {
    return this.page.getByTestId("change-name");
  }

  get profileAvatar(): Locator {
    return this.page
      .locator("[data-testid='avatar']")
      .filter({ has: this.page.getByTestId("edit_avatar_icon_button") });
  }

  private get avatarImage(): Locator {
    return this.profileAvatar.locator("img");
  }

  get editAvatarButton(): Locator {
    return this.page.getByTestId("edit_avatar_icon_button");
  }

  get avatarSaveButton(): Locator {
    return this.page.getByTestId("avatar_editor_save_button");
  }

  get avatarDeleteButton(): Locator {
    return this.page.getByTestId("profile_avatar_delete");
  }

  get displayedName(): Locator {
    return this.page.locator("p[data-testid='text'][title]").first();
  }

  get mainProfile(): Locator {
    return this.page.getByTestId("main-profile");
  }

  get languageLabel(): Locator {
    return this.page.locator("[data-testid='text'][class*='profileLanguage']");
  }

  get languageComboBox(): Locator {
    return this.page.getByTestId("language_combo_box").getByRole("button");
  }

  get languageOptions(): Locator {
    return this.page.getByRole("option");
  }

  get systemThemeCheckbox(): Locator {
    return this.page.getByTestId("system_theme_checkbox");
  }

  get lightThemeRadio(): Locator {
    return this.page.getByTestId("theme_Light_radio_button");
  }

  get darkThemeRadio(): Locator {
    return this.page.getByTestId("theme_Dark_radio_button");
  }

  // Profile Edit
  get firstNameInput(): Locator {
    return this.page.getByTestId("change_name_first_name_field_input");
  }
  get lastNameInput(): Locator {
    return this.page.getByTestId("change_name_last_name_field_input");
  }
  get changeNameSaveButton(): Locator {
    return this.page.getByTestId("dialog_change_name_save_button");
  }

  get changeNameCancelButton(): Locator {
    return this.page.getByTestId("dialog_change_name_cancel_button");
  }
  get changePasswordButton(): Locator {
    return this.page.getByTestId("password_edit_icon_button");
  }
  get emailEditButton(): Locator {
    return this.page.getByTestId("email_edit_icon_button");
  }
  get sendAgainContainer(): Locator {
    return this.page.getByTestId("send_again_container");
  }
  get sendPasswordChangeButton(): Locator {
    return this.page.getByTestId("change_password_send_button");
  }

  get changeEmailInput(): Locator {
    return this.page.getByPlaceholder("Enter email");
  }

  get changeEmailSendButton(): Locator {
    return this.page.getByTestId("change_email_send_button");
  }

  // Tabs
  get interfaceThemeTab(): Locator {
    return this.page.getByTestId("interface-theme_tab");
  }

  async changeLanguageTo(text: string) {
    await this.languageComboBox.click();
    await this.languageOptions.filter({ hasText: text }).first().click();
    await this.languageComboBox.waitFor({ state: "visible" });
  }

  async expectSelectedLanguage(text: string) {
    await expect(this.languageComboBox).toHaveText(new RegExp(text));
  }

  async expectLanguageLabel(label: string) {
    await expect(this.languageLabel).toHaveText(new RegExp(label));
  }

  async toggleSystemThemeCheckbox(state: boolean) {
    const checkbox = this.systemThemeCheckbox.locator("input");
    if ((await checkbox.isChecked()) === state) {
      return;
    }
    await this.systemThemeCheckbox.click();
    await expect(checkbox).toBeChecked({ checked: state });
  }

  async selectTheme(theme: "Light" | "Dark") {
    const radio =
      theme === "Light" ? this.lightThemeRadio : this.darkThemeRadio;
    await radio.click();
    const input = radio.locator("input");
    await expect(input).toBeChecked();
  }

  async expectThemeApplied(theme: "Light" | "Dark") {
    await expect(this.page.locator("html")).toHaveAttribute(
      "data-theme",
      theme.toLowerCase(),
    );
  }

  async expectThemeSelected(theme: "Light" | "Dark") {
    const radio =
      theme === "Light" ? this.lightThemeRadio : this.darkThemeRadio;
    await expect(radio.locator("input")).toBeChecked();
  }

  async expectSystemThemeEnabled(enabled: boolean) {
    await expect(this.systemThemeCheckbox.locator("input")).toBeChecked({
      checked: enabled,
    });
  }

  async expectNameVisible(fullName: string) {
    await expect(this.mainProfile).toContainText(fullName);
  }

  private async navigateToProfile() {
    await this.optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await this.optionsButton.click();
    await this.profileMenuItem.click();
  }

  async open() {
    await this.navigateToProfile();
    await this.page.waitForURL(/\/profile/, { waitUntil: "load" });
  }

  async openViaAvatar() {
    await this.sidebarAvatarButton.click();
    await this.page.waitForURL(/\/profile/, { waitUntil: "load" });
  }

  async uploadAvatar(filePath = "data/avatars/AvatarPNG.png") {
    const fileChooserPromise = this.page.waitForEvent("filechooser", {
      timeout: 30000,
    });
    await this.editAvatarButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
    await this.avatarSaveButton.click();
  }

  async expectAvatarUploaded() {
    await expect(this.avatarImage).toHaveAttribute(
      "src",
      avatarConstants.storagePathPattern,
    );
  }

  async deleteAvatar() {
    await this.editAvatarButton.click();
    const deleteResponse = this.page.waitForResponse(
      (resp) => resp.url().includes("photo") && resp.status() === 200,
    );
    await this.avatarDeleteButton.click();
    await deleteResponse;
  }

  async expectAvatarDeleted() {
    await expect(this.avatarImage).toHaveCount(0);
  }

  async openChangeNameDialog() {
    await this.profileContextMenuButton.waitFor({ state: "visible" });
    await this.profileContextMenuButton.click();
    await this.changeNameMenuItem.click();
    await this.firstNameInput.waitFor({ state: "visible" });
  }

  async editName(firstName: string, lastName: string) {
    await this.openChangeNameDialog();
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.changeNameSaveButton.click();
  }

  async changePassword() {
    await this.changePasswordButton.click();
    await this.sendPasswordChangeButton.click();
  }

  async changeEmail(newEmail: string) {
    await this.emailEditButton.click();
    await this.changeEmailInput.fill(newEmail);
    await this.changeEmailSendButton.click();
  }

  async expectEmailConfirmed() {
    await expect(this.emailEditButton).toBeVisible();
    await expect(this.sendAgainContainer).toHaveCount(0);
  }

  async selectInterfaceThemeTabs() {
    await this.interfaceThemeTab.click();
  }
}

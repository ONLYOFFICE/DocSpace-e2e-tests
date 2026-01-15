import { expect, Locator, Page } from "@playwright/test";
import { avatarConstants } from "@/src/utils/constants/profile";
import BasePage from "../common/BasePage";

export class Profile extends BasePage {
  private initialAvatarSrc: string | null = null;
  private currentAvatarSrc: string | null = null;
  constructor(page: Page) {
    super(page);
  }

  // Navigation
  private get userMenuButton(): Locator {
    return this.page.getByTestId("profile_user_icon_button");
  }

  private get profileMenuItem(): Locator {
    return this.page.getByTestId("user-menu-profile");
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

  get languageLabel(): Locator {
    return this.page.locator(
      "[data-testid='text'].Profile-module__profileLanguage--hL2Lt",
    );
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
    return this.page.locator(
      "div.profile-block-field.profile-block-password [data-testid='icon-button']",
    );
  }
  get sendPasswordChangeButton(): Locator {
    return this.page.locator("[data-testid='button']");
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

  async navigateToProfile() {
    await this.userMenuButton.click();
    await this.profileMenuItem.click();
  }

  async open() {
    await this.navigateToProfile();
    await this.displayedName.waitFor({ state: "visible" });
    const avatarSrc = await this.avatarImage.getAttribute("src");
    this.initialAvatarSrc = avatarSrc;
    this.currentAvatarSrc = avatarSrc;
  }

  async uploadAvatar(filePath = "data/avatars/AvatarPNG.png") {
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.editAvatarButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
    await this.avatarSaveButton.click();
  }

  async expectAvatarUploaded(previousSrc?: string | null) {
    await expect(this.avatarImage).toHaveAttribute(
      avatarConstants.dataAttribute,
      avatarConstants.uploadedValue,
    );
    const srcToCompare = previousSrc ?? this.currentAvatarSrc;
    if (srcToCompare) {
      await expect(this.avatarImage).not.toHaveAttribute("src", srcToCompare);
    }
    await expect(this.avatarImage).toHaveAttribute(
      "src",
      avatarConstants.storagePathPattern,
    );
    this.currentAvatarSrc = await this.avatarImage.getAttribute("src");
  }

  async deleteAvatar() {
    await this.editAvatarButton.click();
    await this.avatarDeleteButton.click();
  }

  async expectAvatarDeleted(uploadedSrc?: string | null) {
    await expect(this.avatarImage).toHaveAttribute(
      avatarConstants.dataAttribute,
      avatarConstants.deletedValue,
    );
    const srcToCompare = uploadedSrc ?? this.currentAvatarSrc;
    if (srcToCompare) {
      await expect(this.avatarImage).not.toHaveAttribute("src", srcToCompare);
    }
    if (this.initialAvatarSrc) {
      await expect(this.avatarImage).toHaveAttribute(
        "src",
        this.initialAvatarSrc,
      );
    } else {
      await expect(this.avatarImage).not.toHaveAttribute(
        "src",
        avatarConstants.storagePathPattern,
      );
    }
    this.currentAvatarSrc = this.initialAvatarSrc;
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
    await this.sendPasswordChangeButton.nth(-2).click();
  }

  async selectInterfaceThemeTabs() {
    await this.interfaceThemeTab.click();
  }
}

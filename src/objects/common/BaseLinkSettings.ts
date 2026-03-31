import { expect, Locator, Page } from "@playwright/test";

export interface LinkSettingsConfig {
  name?: string;
  access?: "docspace" | "anyone";
  password?: string;
  save?: boolean;
}

export default class BaseEditLink {
  protected page: Page;

  private static readonly SELECTORS = {
    linkNameInput: "edit_link_panel_name_input",
    linkAccessModal: "edit_link_panel_modal",
    togglePassword: "edit_link_panel_password_toggle",
    passwordInput: "tooltipContent-conversion-password",
    cleanPasswordButton: "edit_link_panel_clean_password_link",
    copyPasswordButton: "edit_link_panel_copy_password_link",
    showPasswordButton: "password_input_eye_off_icon",
    generatePasswordButton: "edit_link_panel_generate_password_button",
    denyDownloadToggle: "edit_link_panel_deny_download_toggle",
    dateLinkPeriod: "date-selector",
    saveButton: "edit_link_panel_save_button",
    cancelButton: "edit_link_panel_cancel_button",
  } as const;

  private static readonly ACCESS_OPTIONS = {
    docspace: "drop_down_item_users",
    anyone: "drop_down_item_anyone",
  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  get linkNameInput() {
    return this.page.getByTestId(BaseEditLink.SELECTORS.linkNameInput);
  }

  async newLinkName(newName: string) {
    const input = this.linkNameInput;
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    await input.clear();
    await input.fill(newName);
    await expect(input).toHaveValue(newName);
  }

  get comboLinkAccess() {
    return this.page
      .getByTestId(BaseEditLink.SELECTORS.linkAccessModal)
      .locator('[data-test-id="combo-button"]');
  }

  async selectLinkAccess(access: keyof typeof BaseEditLink.ACCESS_OPTIONS) {
    const combo = this.comboLinkAccess;
    await expect(combo).toBeVisible();
    await combo.click();

    const option = this.page
      .getByTestId(BaseEditLink.SELECTORS.linkAccessModal)
      .getByTestId(BaseEditLink.ACCESS_OPTIONS[access]);
    await expect(option).toBeVisible();
    await option.click();
  }

  get togglePassword() {
    return this.page.getByTestId(BaseEditLink.SELECTORS.togglePassword);
  }

  async clickTogglePassword() {
    await this.clickElement(this.togglePassword);
  }

  get passwordInput() {
    return this.page.locator(`#${BaseEditLink.SELECTORS.passwordInput} input`);
  }

  async fillPassword(password: string) {
    const input = this.passwordInput;
    await expect(input).toBeVisible();
    await input.fill(password);
  }

  get cleanPasswordButton() {
    return this.page.getByTestId(BaseEditLink.SELECTORS.cleanPasswordButton);
  }

  async clickCleanPassword() {
    await this.clickElement(this.cleanPasswordButton);
  }

  get copyPasswordButton() {
    return this.page.getByTestId(BaseEditLink.SELECTORS.copyPasswordButton);
  }

  async clickCopyPassword() {
    await this.clickElement(this.copyPasswordButton);
  }

  get showPasswordButton() {
    return this.page.getByTestId(BaseEditLink.SELECTORS.showPasswordButton);
  }

  async clickShowPassword() {
    await this.clickElement(this.showPasswordButton);
  }

  async generatePassword() {
    const button = this.page.getByTestId(
      BaseEditLink.SELECTORS.generatePasswordButton,
    );
    await this.clickElement(button);
  }

  get denyDownloadToggle() {
    return this.page.getByTestId(BaseEditLink.SELECTORS.denyDownloadToggle);
  }

  async clickDenyDownloadToggle() {
    await this.clickElement(this.denyDownloadToggle);
  }

  get dateLinkPeriod() {
    return this.page.getByTestId(BaseEditLink.SELECTORS.dateLinkPeriod);
  }

  get saveButton() {
    return this.page.getByTestId(BaseEditLink.SELECTORS.saveButton);
  }

  async clickSaveButton() {
    await this.clickElement(this.saveButton);
  }

  get cancelButton() {
    return this.page.getByTestId(BaseEditLink.SELECTORS.cancelButton);
  }

  async clickCancelButton() {
    await this.clickElement(this.cancelButton);
  }

  async configureLinkSettings(config: LinkSettingsConfig) {
    if (config.name !== undefined) {
      await this.newLinkName(config.name);
    }

    if (config.access !== undefined) {
      await this.selectLinkAccess(config.access);
    }

    if (config.password !== undefined) {
      await this.clickTogglePassword();
      await this.fillPassword(config.password);
    }

    if (config.save === true) {
      await this.clickSaveButton();
    }
  }

  private async clickElement(element: Locator) {
    await expect(element).toBeVisible();
    await element.click();
  }
}

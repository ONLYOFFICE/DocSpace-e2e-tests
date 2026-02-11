import { expect, Locator, Page } from "@playwright/test";

/**
 * Configuration options for link settings
 */
export interface LinkSettingsConfig {
  /** Link name */
  name?: string;
  /** Access level: "docspace" or "anyone" */
  access?: "docspace" | "anyone";
  /** Password to protect the link */
  password?: string;
  /** Link expiration date (if supported) */
  expirationDate?: string;
  /** Whether to save settings after configuration */
  save?: boolean;
}

/**
 * Page Object for working with the link settings edit panel
 * Used to manage shared links for files and rooms
 */
export default class BaseEditLink {
  protected page: Page;

  // ==================== Selector Constants ====================
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

  // ==================== Link Name ====================

  get linkNameInput() {
    return this.page.getByTestId(BaseEditLink.SELECTORS.linkNameInput);
  }

  /**
   * Change link name
   * @param newName - new link name
   */
  async newLinkName(newName: string) {
    const input = this.linkNameInput;
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    await input.clear();
    await input.fill(newName);
    await expect(input).toHaveValue(newName);
  }

  // ==================== Access Level ====================

  get comboLinkAccess() {
    return this.page
      .getByTestId(BaseEditLink.SELECTORS.linkAccessModal)
      .locator('[data-test-id="combo-button"]');
  }

  /**
   * Select access level for the link
   * @param access - access type: "docspace" (DocSpace users only) or "anyone" (anyone with the link)
   */
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

  // ==================== Password Protection ====================

  get togglePassword() {
    return this.page.getByTestId(BaseEditLink.SELECTORS.togglePassword);
  }

  async clickTogglePassword() {
    await this.clickElement(this.togglePassword);
  }

  get passwordInput() {
    return this.page.locator(`#${BaseEditLink.SELECTORS.passwordInput} input`);
  }

  /**
   * Fill password field
   * @param password - password to protect the link
   */
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

  // ==================== Deny Download Toggle ====================

  get denyDownloadToggle() {
    return this.page.getByTestId(BaseEditLink.SELECTORS.denyDownloadToggle);
  }

  async clickDenyDownloadToggle() {
    await this.clickElement(this.denyDownloadToggle);
  }

  // ==================== Link Expiration ====================

  get dataLinkPeriod() {
    return this.page.getByTestId(BaseEditLink.SELECTORS.dateLinkPeriod);
  }

  // ==================== Action Buttons ====================

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

  // ==================== High-Level Configuration ====================

  /**
   * Configure link settings with multiple parameters at once
   * @param config - configuration object with link settings
   * @example
   * await baseEditLink.configureLinkSettings({
   *   name: "My Link",
   *   access: "docspace",
   *   password: "SecurePass123",
   *   save: true
   * });
   */
  async configureLinkSettings(config: LinkSettingsConfig) {
    // Set link name if provided
    if (config.name !== undefined) {
      await this.newLinkName(config.name);
    }

    // Set access level if provided
    if (config.access !== undefined) {
      await this.selectLinkAccess(config.access);
    }

    // Set password if provided
    if (config.password !== undefined) {
      await this.clickTogglePassword();
      await this.fillPassword(config.password);
    }

    // Set expiration date if provided and element is visible
    if (config.expirationDate !== undefined) {
      const datePicker = this.dataLinkPeriod;
      const isVisible = await datePicker.isVisible().catch(() => false);
      if (isVisible) {
        // TODO: Implement date selection logic when date picker is available
        // await this.selectExpirationDate(config.expirationDate);
        console.warn("Date expiration setting is not yet implemented");
      }
    }

    // Save settings if requested
    if (config.save === true) {
      await this.clickSaveButton();
    }
  }

  // ==================== Private Helper Methods ====================

  /**
   * Universal method to click an element with visibility check
   * @param element - element locator
   */
  private async clickElement(element: Locator) {
    await expect(element).toBeVisible();
    await element.click();
  }
}

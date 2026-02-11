import { expect, Locator, Page } from "@playwright/test";

/**
 * Page Object for the password required modal/page
 * Used when accessing password-protected links (rooms, files, etc.)
 */
export default class BasePasswordRequire {
  protected page: Page;

  // ==================== Selector Constants ====================
  private static readonly SELECTORS = {
    passwordRequiredTitle: "Password required",
    linkNameClass: "public-room-name",
    descriptionTextClass: "public-room-text",
    showPasswordButton: "password_input_eye_off_icon",
    continueButtonLabel: "Continue",
    passwordInputPlaceholder: "Password",
  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  // ==================== Page Title ====================

  get passwordRequiredTitle() {
    return this.page.getByText(
      BasePasswordRequire.SELECTORS.passwordRequiredTitle,
    );
  }

  /**
   * Verify that password required page is displayed
   */
  async verifyPasswordRequiredPageVisible() {
    await expect(this.passwordRequiredTitle).toBeVisible();
  }

  // ==================== Link Name ====================

  get linkName() {
    return this.page.locator(`.${BasePasswordRequire.SELECTORS.linkNameClass}`);
  }

  /**
   * Get the name of the shared link/room
   * @returns The link name text
   */
  async getLinkName(): Promise<string> {
    await expect(this.linkName).toBeVisible();
    return (await this.linkName.textContent()) || "";
  }

  // ==================== Description Text ====================

  get descriptionText() {
    return this.page
      .locator(`.${BasePasswordRequire.SELECTORS.descriptionTextClass}`)
      .first();
  }

  /**
   * Get the description text
   * Text varies depending on context:
   * - For file: "File {filename} is located in the password-protected room. Please enter a password for the room:"
   * - For room: "You need a password to access the room:"
   * @returns The description text
   */
  async getDescriptionText(): Promise<string> {
    await expect(this.descriptionText).toBeVisible();
    return (await this.descriptionText.textContent()) || "";
  }

  /**
   * Verify that the description text contains the expected file name
   * @param fileName - expected file name in the description
   */
  async verifyDescriptionContainsFileName(fileName: string) {
    const description = await this.getDescriptionText();
    expect(description).toContain(fileName);
  }

  /**
   * Verify that the description text matches room password prompt
   * Expected: "You need a password to access the room"
   */
  async verifyRoomDescription() {
    const description = await this.getDescriptionText();
    expect(description).toContain("You need a password to access the room");
  }

  // ==================== Password Input ====================

  get passwordInput() {
    return this.page.getByPlaceholder(
      BasePasswordRequire.SELECTORS.passwordInputPlaceholder,
    );
  }

  /**
   * Fill password field
   * @param password - password to enter
   */
  async fillPassword(password: string) {
    const input = this.passwordInput;
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    await input.fill(password);
  }

  // ==================== Show Password Button ====================

  get showPasswordButton() {
    return this.page.getByTestId(
      BasePasswordRequire.SELECTORS.showPasswordButton,
    );
  }

  /**
   * Click show/hide password button
   */
  async clickShowPassword() {
    await this.clickElement(this.showPasswordButton);
  }

  // ==================== Continue Button ====================

  get continueButton() {
    return this.page.getByLabel(
      BasePasswordRequire.SELECTORS.continueButtonLabel,
    );
  }

  /**
   * Click continue button to submit password
   */
  async clickContinue() {
    await this.clickElement(this.continueButton);
  }

  // ==================== High-Level Actions ====================

  /**
   * Enter password and submit
   * @param password - password to enter
   */
  async enterPasswordAndContinue(password: string) {
    await this.fillPassword(password);
    await this.clickContinue();
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

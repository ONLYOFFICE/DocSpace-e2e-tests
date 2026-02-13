import { expect, Page } from "@playwright/test";

const FLOATING_BUTTON = "floating-button-progress";
const ERROR_PANEL_HEADER = "modal-header-swipe";
const FILE_NAME = ".upload-panel_file-name";
const ERROR_UPLOAD_TO_ROOM =
  "The file cannot be uploaded to this room. Please try to upload the ONLYOFFICE PDF form.";

class BaseFloatingProgress {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Floating button
  get button() {
    return this.page.getByTestId(FLOATING_BUTTON);
  }

  // Error panel
  get errorPanel() {
    return this.page.locator(`#${ERROR_PANEL_HEADER}`);
  }

  get fileName() {
    return this.page.locator(FILE_NAME);
  }

  get errorTooltip() {
    return this.page.locator(
      `[data-tooltip-content="${ERROR_UPLOAD_TO_ROOM}"]`,
    );
  }

  async waitForButton(timeout = 30000) {
    await expect(this.button).toBeVisible({ timeout });
  }

  async click() {
    await this.button.click();
  }

  async openErrorPanel() {
    await this.click();
    await expect(this.errorPanel).toBeVisible();
  }

  async verifyFileNameVisible(name: string) {
    await expect(this.fileName.filter({ hasText: name })).toBeVisible();
  }

  async verifyErrorTooltipVisible() {
    await expect(this.errorTooltip).toBeVisible();
  }
}

export default BaseFloatingProgress;

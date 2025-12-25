import { expect, Locator, Page } from "@playwright/test";

const DOWNLOAD_DIALOG_TOGGLE =
  "[data-test-id='link-dropdown'], [data-testid='link-dropdown']";
const DOWNLOAD_DIALOG_DROPDOWN = ".download-dialog-dropDown";
const DOWNLOAD_DIALOG_SUBMIT = "download_dialog_submit_button";

class DownloadDialog {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get submitButton() {
    return this.page.getByTestId(DOWNLOAD_DIALOG_SUBMIT);
  }

  private get dropdownToggle() {
    return this.page.locator(DOWNLOAD_DIALOG_TOGGLE).first();
  }

  private get dropdownContainer(): Locator {
    return this.page.locator(DOWNLOAD_DIALOG_DROPDOWN).first();
  }

  async isOpen() {
    return this.submitButton.isVisible();
  }

  async expectOpen() {
    await expect(this.submitButton).toBeVisible();
  }

  private async openFormatDropdown() {
    await expect(this.dropdownToggle).toBeVisible();

    if (await this.dropdownContainer.isVisible()) {
      return;
    }

    await this.dropdownToggle.click();
    await expect(this.dropdownContainer).toBeVisible();
  }

  async selectFormat(formatLabel: string) {
    await this.openFormatDropdown();
    const option = this.dropdownContainer.getByRole("option", {
      name: formatLabel,
      exact: true,
    });
    await option.click();
    await expect(this.dropdownContainer).not.toBeVisible();
  }

  async submitDownload() {
    await this.submitButton.click();
  }

  async close() {
    if (!(await this.isOpen())) {
      return;
    }

    await this.page.keyboard.press("Escape");
    await expect(this.submitButton).not.toBeVisible();
  }
}

export default DownloadDialog;

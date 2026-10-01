import { expect, Page } from "@playwright/test";

const LIFETIME_DIALOG_HEADER =
  "Older files with exceeded lifetime will be deleted";
const OK_BUTTON = "lifetime_dialog_ok_button";
const CANCEL_BUTTON = "lifetime_dialog_cancel_button";

// Shown when File lifetime is enabled for a VDR room that already has files
class LifetimeDialog {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get okButton() {
    return this.page.getByTestId(OK_BUTTON);
  }

  private get cancelButton() {
    return this.page.getByTestId(CANCEL_BUTTON);
  }

  async expectVisible() {
    await expect(this.page.getByText(LIFETIME_DIALOG_HEADER)).toBeVisible();
    await expect(this.okButton).toBeVisible();
  }

  async expectNotVisible() {
    await expect(this.okButton).not.toBeVisible();
  }

  async clickOk() {
    await this.okButton.click();
    await this.expectNotVisible();
  }

  async clickCancel() {
    await this.cancelButton.click();
    await this.expectNotVisible();
  }
}

export default LifetimeDialog;

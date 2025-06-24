import { expect, Locator, Page } from "@playwright/test";

const MODAL_DIALOG = "#modal-dialog";

class BaseDialog {
  protected page: Page;
  protected dialog: Locator;
  protected dialogHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = this.page.locator(MODAL_DIALOG);
    this.dialogHeader = this.dialog.getByTestId("aside-header");
  }

  async checkDialogExist() {
    await expect(this.dialog).toBeVisible();
  }

  async checkDialogTitleExist(title: string, timeout = 5000) {
    await expect(this.dialogHeader.getByText(title)).toBeVisible({
      timeout,
    });
  }

  async clickBackArrow() {
    await this.dialogHeader.getByTestId("icon-button-svg").first().click();
  }

  async close() {
    await this.page.mouse.click(1, 1);
    await expect(this.dialog).not.toBeVisible();
  }

  protected async clickSubmitButton(buttonLocator: Locator) {
    await expect(buttonLocator).toBeVisible();
    await buttonLocator.click();
  }

  protected async fillInput(inputLocator: Locator, text: string) {
    await expect(inputLocator).toBeVisible();
    await inputLocator.fill(text);
  }
}

export default BaseDialog;

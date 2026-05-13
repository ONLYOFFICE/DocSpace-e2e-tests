import { expect, Locator, Page } from "@playwright/test";

class BaseDialog {
  protected page: Page;
  protected dialog: Locator;
  protected dialogHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    // Workaround: two modals share data-testid="modal-dialog" in DOM
    this.dialog = this.page.getByTestId("modal-dialog").last();
    this.dialogHeader = this.dialog.getByTestId("aside-header");
  }

  async checkDialogExist() {
    await expect(this.dialog).toBeVisible();
  }

  async checkDialogTitleExist(title: string) {
    await expect(this.dialogHeader.getByText(title)).toBeVisible();
  }

  async clickBackArrow() {
    await this.dialogHeader
      .getByTestId("aside_header_back_icon_button")
      .click();
  }

  async close() {
    await this.page.mouse.click(1, 1);
    await this.dialog.waitFor({ state: "detached" });
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

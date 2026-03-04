import { expect, Page } from "@playwright/test";

const CONFIRM_BUTTON = "#stop-filling-dialog_submit";
const CANCEL_BUTTON = "#stop-filling-dialog_cancel";

class StopFillingModal {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickConfirm() {
    const button = this.page.locator(CONFIRM_BUTTON);
    await expect(button).toBeVisible();
    await button.click();
  }

  async clickCancel() {
    const button = this.page.locator(CANCEL_BUTTON);
    await expect(button).toBeVisible();
    await button.click();
  }
}

export default StopFillingModal;

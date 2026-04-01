import { expect, Page } from "@playwright/test";

const EDIT_BUTTON = "#pause-submissions-dialog_edit";

class PauseSubmissionsDialog {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickEdit() {
    const button = this.page.locator(EDIT_BUTTON);
    await expect(button).toBeVisible();
    await button.click();
  }
}

export default PauseSubmissionsDialog;

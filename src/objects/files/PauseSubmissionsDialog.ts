import { expect, Page } from "@playwright/test";

const EDIT_BUTTON = "#pause-submissions-dialog_edit";

class PauseSubmissionsDialog {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get editButton() {
    return this.page.locator(EDIT_BUTTON);
  }

  async clickEdit() {
    await expect(this.editButton).toBeVisible();
    await this.editButton.click();
  }
}

export default PauseSubmissionsDialog;

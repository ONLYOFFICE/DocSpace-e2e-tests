import { expect, Page } from "@playwright/test";
import BaseInviteDialog from "../common/BaseInviteDialog";

class ContactsReassignmentDialog extends BaseInviteDialog {
  constructor(page: Page) {
    super(page);
  }

  async checkReassignmentTitleExist() {
    await this.checkDialogTitleExist("Data reassignment");
  }

  async checkAllDataTransfered() {
    const progressStatusElements = this.dialog.locator(".progress-status");
    await expect(progressStatusElements).toBeVisible();
    const count = await progressStatusElements.count();

    for (let i = 0; i < count; i++) {
      const element = progressStatusElements.nth(i);
      await expect(element).toContainText("All data transferred");
    }

    const progressBar = this.dialog.getByTestId("progress-bar");
    await expect(progressBar).toBeVisible();
    await expect(progressBar).toHaveAttribute("data-progress", "100");
  }
}

export default ContactsReassignmentDialog;

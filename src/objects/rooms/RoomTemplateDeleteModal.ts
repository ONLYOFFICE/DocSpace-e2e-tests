import { expect } from "@playwright/test";
import BaseDialog from "../common/BaseDialog";

class RoomTemplateDeleteModal extends BaseDialog {
  private get warningCheckbox() {
    return this.dialog.locator("label[data-testid='delete_warning_checkbox']");
  }

  private get deleteButton() {
    return this.page.locator("#delete-file-modal_submit");
  }

  async checkDialogTitleExist() {
    await super.checkDialogTitleExist("Delete template?");
  }

  async confirmAndDelete() {
    await expect(this.warningCheckbox).toBeVisible();
    await this.warningCheckbox.click();
    await expect(this.deleteButton).toBeEnabled();
    await this.deleteButton.click();
  }
}

export default RoomTemplateDeleteModal;

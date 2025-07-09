import { Page } from "@playwright/test";
import BasePage from "@/src/objects/common/BasePage";

export default class SettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async removeSettingsUpdatedToast() {
    await this.toast.removeToast("Settings have been successfully updated");
  }
  async removeOperationCompletedToast() {
    await this.toast.removeToast("Operation has been successfully completed.");
  }

  async removeUpdatedSuccessfullyToast() {
    await this.toast.removeToast("Updated successfully");
  }
}

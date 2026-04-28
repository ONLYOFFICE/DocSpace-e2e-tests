import { expect } from "@playwright/test";
import BaseDialog from "../common/BaseDialog";

class RoomsAccessSettingsDialog extends BaseDialog {
  private get availableToggle() {
    return this.page.getByTestId("template_access_settings_modal_available");
  }

  private get availableToggleLabel() {
    return this.availableToggle.getByTestId("toggle-button-container");
  }

  private get saveButton() {
    return this.page.getByTestId("template_access_settings_modal_save_button");
  }

  private get chooseFromListLink() {
    return this.page.getByTestId(
      "template_access_settings_choose_from_list_link",
    );
  }

  private get accessList() {
    return this.page.getByTestId("template_access_settings_scroll_list");
  }

  async checkAccessSettingsTitleExist() {
    await expect(this.dialogHeader.getByText("Access settings")).toBeVisible();
  }

  async toggleAvailableToEveryone() {
    await expect(this.availableToggleLabel).toBeVisible();
    await this.availableToggleLabel.click();
  }

  async expectAvailableToggleChecked(checked: boolean) {
    await expect(this.availableToggle).toHaveAttribute(
      "aria-checked",
      String(checked),
    );
  }

  async clickChooseFromList() {
    await expect(this.chooseFromListLink).toBeVisible();
    await this.chooseFromListLink.click();
  }

  async selectUserFromPicker(name: string) {
    const item = this.dialog.getByText(name, { exact: false }).first();
    await expect(item).toBeVisible();
    await item.click();
  }

  async expectUserInAccessList(name: string) {
    await expect(
      this.accessList.getByText(name, { exact: false }),
    ).toBeVisible();
  }

  async clickSaveButton() {
    await this.clickSubmitButton(this.saveButton);
  }
}

export default RoomsAccessSettingsDialog;

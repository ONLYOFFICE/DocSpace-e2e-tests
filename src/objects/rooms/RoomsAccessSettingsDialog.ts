import { expect } from "@playwright/test";
import BaseDialog from "../common/BaseDialog";

class RoomsAccessSettingsDialog extends BaseDialog {
  async checkAccessSettingsTitleExist() {
    await expect(this.dialogHeader.getByText("Access settings")).toBeVisible();
  }
}

export default RoomsAccessSettingsDialog;

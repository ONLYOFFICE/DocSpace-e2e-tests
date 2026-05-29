import { expect } from "@playwright/test";
import BaseDialog from "../common/BaseDialog";

class ConvertDialog extends BaseDialog {
  async checkDialogVisible() {
    await this.checkDialogExist();
  }

  async confirm() {
    await this.clickSubmitButton(
      this.page.getByTestId("convert_dialog_continue_button"),
    );
    // The modal hides by removing the "visible" CSS class, not via
    // display:none — so we check class removal rather than state:"hidden".
    await expect(this.dialog).not.toHaveClass(/visible/);
  }
}

export default ConvertDialog;

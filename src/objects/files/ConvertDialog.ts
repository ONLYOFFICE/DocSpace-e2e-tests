import BaseDialog from "../common/BaseDialog";

/**
 * Modal dialog that appears when a user uploads a legacy Office format
 * (.doc, .xls, .ppt) that DocSpace auto-converts to its modern OOXML
 * equivalent (.docx, .xlsx, .pptx).
 *
 * The dialog warns about the conversion and requires explicit confirmation
 * before the upload proceeds. After confirmation both files appear in the
 * table: the original (e.g. "file.doc") and the converted copy (e.g. "file").
 *
 * Triggered by: data-testid="modal-dialog"
 * Confirm button: data-testid="convert_dialog_continue_button"
 */
class ConvertDialog extends BaseDialog {
  async checkDialogVisible() {
    await this.checkDialogExist();
  }

  async confirm() {
    await this.clickSubmitButton(
      this.page.getByTestId("convert_dialog_continue_button"),
    );
    await this.dialog.waitFor({ state: "hidden" });
  }
}

export default ConvertDialog;

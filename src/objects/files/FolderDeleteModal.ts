import { expect, Locator, Page } from "@playwright/test";
import { deleteDialogTexts } from "@/src/utils/constants/files";

const DIALOG = "modal-dialog";
const MOVE_TO_TRASH = "#delete-file-modal_submit";
const CANCEL_DELETE_FOLDER = "#delete-file-modal_cancel";
const DONT_ASK_AGAIN_CHECKBOX = "delete_dialog_dont_ask_again_checkbox";
const DONT_ASK_AGAIN_HELP = "delete_dialog_dont_ask_again_help";
const HELP_ICON = "icon-button";

// "Move to Trash?" confirmation for files and folders
class FolderDeleteModal {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Several modal-dialog containers are mounted at once - pick the one
  // that holds the delete submit button
  private get dialog(): Locator {
    return this.page
      .getByTestId(DIALOG)
      .filter({ has: this.page.locator(MOVE_TO_TRASH) });
  }

  private get dontAskAgainCheckbox(): Locator {
    return this.dialog.getByTestId(DONT_ASK_AGAIN_CHECKBOX);
  }

  async clickDeleteFolder() {
    const createRoom = this.page.locator(MOVE_TO_TRASH);
    await expect(createRoom).toBeVisible();
    await createRoom.click();
  }

  async clickCancelDeleteFolder() {
    const cancelButton = this.page.locator(CANCEL_DELETE_FOLDER);
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();
  }

  // Title, message and an unchecked "Don't ask again" option
  async checkDialogOpened(message: string) {
    await expect(this.dialog).toBeVisible();
    await expect(
      this.dialog.getByText(deleteDialogTexts.title, { exact: true }),
    ).toBeVisible();
    await expect(this.dialog.getByText(message, { exact: true })).toBeVisible();
    await expect(this.dontAskAgainCheckbox).toContainText(
      deleteDialogTexts.dontAskAgain,
    );
    await expect(
      this.dontAskAgainCheckbox.getByRole("checkbox"),
    ).not.toBeChecked();
    await expect(this.dialog.locator(MOVE_TO_TRASH)).toHaveText(
      deleteDialogTexts.submitButton,
    );
    await expect(this.dialog.locator(CANCEL_DELETE_FOLDER)).toHaveText(
      deleteDialogTexts.cancelButton,
    );
  }

  async checkDialogNotVisible() {
    await expect(this.page.locator(MOVE_TO_TRASH)).not.toBeVisible();
  }

  // The help icon next to "Don't ask again" tells where to turn it back on
  async checkDontAskAgainHint() {
    await this.dialog
      .getByTestId(DONT_ASK_AGAIN_HELP)
      .getByTestId(HELP_ICON)
      .click();
    await expect(
      this.page
        .getByRole("tooltip")
        .filter({ hasText: deleteDialogTexts.dontAskAgainHint }),
    ).toBeVisible();
    // Click the title to close the tooltip
    await this.dialog
      .getByText(deleteDialogTexts.title, { exact: true })
      .click();
  }

  async checkDontAskAgain() {
    await this.dontAskAgainCheckbox.click();
    await expect(this.dontAskAgainCheckbox.getByRole("checkbox")).toBeChecked();
  }
}

export default FolderDeleteModal;

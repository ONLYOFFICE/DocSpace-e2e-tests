import { expect, Page } from "@playwright/test";
import BaseDialog from "../common/BaseDialog";

const SUBMIT_BUTTON = '[data-test-id="conflict-resolve-submit-button"]';
const CANCEL_BUTTON = '[data-test-id="conflict-resolve-cancel-button"]';

// Dialog shown when uploading a file whose name already exists in the destination.
// The user must choose how to resolve the naming conflict before the upload proceeds.
// File conflict options: "Overwrite with version update" | "Create file copy" | "Skip"
// Folder conflict options: "Merge folders" | "Copy and keep both folders" | "Skip"
export type TConflictResolveOption =
  | "Overwrite with version update"
  | "Create file copy"
  | "Merge folders"
  | "Copy and keep both folders"
  | "Skip";

class ConflictResolveDialog extends BaseDialog {
  constructor(page: Page) {
    super(page);
  }

  private get submitButton() {
    return this.page.locator(SUBMIT_BUTTON);
  }

  private get cancelButton() {
    return this.page.locator(CANCEL_BUTTON);
  }

  // Returns true if the dialog is currently visible (non-throwing check).
  get isVisible() {
    return this.submitButton.isVisible({ timeout: 5000 }).catch(() => false);
  }

  // Selects a conflict resolution strategy without submitting.
  async selectOption(option: TConflictResolveOption) {
    await this.dialog.locator("p", { hasText: option }).click();
  }

  // Clicks the submit button and waits for the dialog to close.
  async submit() {
    await expect(this.submitButton).toBeVisible();
    await this.submitButton.click();
    await this.dialog.waitFor({ state: "detached" });
  }

  // Clicks the cancel button and waits for the dialog to close.
  async cancel() {
    await expect(this.cancelButton).toBeVisible();
    await this.cancelButton.click();
    await this.dialog.waitFor({ state: "detached" });
  }

  // Shorthand: selects the given option and submits in one call.
  async resolveWith(option: TConflictResolveOption) {
    await expect(this.dialog).toBeVisible();
    await this.selectOption(option);
    await this.submit();
  }
}

export default ConflictResolveDialog;

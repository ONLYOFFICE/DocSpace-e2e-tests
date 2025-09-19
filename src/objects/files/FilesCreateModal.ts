import { expect, Page, test } from "@playwright/test";

const MODAL_DIALOG = "#modal-dialog";
const CREATE_TEXT_INPUT = "#create-text-input";

const cancelButtons = [
  "new_document_cancel_button",
  "new_spreadsheet_cancel_button",
  "new_presentation_cancel_button",
  "new_pdf_form_cancel_button",
  "new_folder_cancel_button",
];

const createButtons = [
  "new_document_save_button",
  "new_spreadsheet_save_button",
  "new_presentation_save_button",
  "new_pdf_form_save_button",
  "new_folder_save_button",
  "rename_save_button",
];

class FilesCreateModal {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get modal() {
    return this.page.locator(MODAL_DIALOG);
  }

  private get createTextInput() {
    return this.page.locator(CREATE_TEXT_INPUT);
  }

  async checkModalExist() {
    return test.step("Check modal exist", async () => {
      await expect(this.modal).toBeVisible();
    });
  }

  async checkModalTitleExist(title: string) {
    return test.step("Check modal title exist", async () => {
      await expect(this.modal.getByText(title)).toBeVisible();
    });
  }

  async fillCreateTextInput(text: string) {
    return test.step("Fill create text input", async () => {
      await expect(this.createTextInput).toBeVisible();
      await this.createTextInput.fill(text);
    });
  }

  async clickCreateButton() {
    return test.step("Click create button", async () => {
      for (const buttonTestId of createButtons) {
        const button = this.page.getByTestId(buttonTestId);

        if (await button.isVisible()) {
          await button.click();
          return;
        }
      }
    });
  }

  async closeModalByClickCancelButton() {
    return test.step("Close modal by click cancel button", async () => {
      for (const buttonTestId of cancelButtons) {
        const button = this.page.getByTestId(buttonTestId);

        if (await button.isVisible()) {
          await button.click();
          return;
        }
      }
    });
  }
}

export default FilesCreateModal;

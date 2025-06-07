import { expect, Page } from "@playwright/test";

const MODAL_DIALOG = "#modal-dialog";
const CREATE_TEXT_INPUT = "#create-text-input";
const CREATE_BUTTON = ".modal-footer button[type='submit']";

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

  private get createButton() {
    return this.page.locator(CREATE_BUTTON);
  }

  async checkModalExist() {
    await expect(this.modal).toBeVisible();
  }

  async checkModalTitleExist(title: string) {
    await expect(this.modal.getByText(title)).toBeVisible();
  }

  async fillCreateTextInput(text: string) {
    await expect(this.createTextInput).toBeVisible();
    await this.createTextInput.fill(text);
  }

  async clickCreateButton() {
    await this.createButton.click();
  }

  async closeModalByClickOutside() {
    await this.page.mouse.click(1, 1);
  }
}

export default FilesCreateModal;

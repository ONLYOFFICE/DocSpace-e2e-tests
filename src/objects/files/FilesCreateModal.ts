import { expect, Page } from "@playwright/test";

const CREATE_TEXT_INPUT = "#create-text-input";
const CREATE_BUTTON_TEXT = "Create";

class FilesCreateModal {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get modal() {
    return this.page.getByRole("dialog").filter({
      has: this.page.getByRole("button", {
        name: CREATE_BUTTON_TEXT,
        exact: true,
      }),
    });
  }

  private get createTextInput() {
    return this.modal.locator(CREATE_TEXT_INPUT);
  }

  private get createButton() {
    return this.modal.getByRole("button", {
      name: CREATE_BUTTON_TEXT,
      exact: true,
    });
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

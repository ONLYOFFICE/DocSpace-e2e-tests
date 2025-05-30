import { expect, Page } from "@playwright/test";

const MODAL_DIALOG = "#modal-dialog";

class FilesCreateModal {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get modal() {
    return this.page.locator(MODAL_DIALOG);
  }

  async checkModalExist() {
    await expect(this.modal).toBeVisible();
  }

  async checkModalTitleExist(title: string) {
    await expect(this.modal.getByText(title)).toBeVisible();
  }

  async closeModalByClickOutside() {
    await this.page.mouse.click(1, 1);
  }
}

export default FilesCreateModal;

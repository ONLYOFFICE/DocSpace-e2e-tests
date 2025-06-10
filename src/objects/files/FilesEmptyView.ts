import { expect, Page } from "@playwright/test";

import FilesCreateModal from "./FilesCreateModal";
import { DOC_ACTIONS } from "@/src/utils/constants/files";

const GOTO_DOCUMENTS_BUTTON = "#empty-view-goto-personal";

const mapDocActions = {
  "#create-doc-option": DOC_ACTIONS.CREATE_DOCUMENT,
  "#create-spreadsheet-option": DOC_ACTIONS.CREATE_SPREADSHEET,
  "#create-presentation-option": DOC_ACTIONS.CREATE_PRESENTATION,
  "#create-form-option": DOC_ACTIONS.CREATE_PDF_FORM,
} as const;

class FilesEmptyView {
  page: Page;
  modal: FilesCreateModal;

  constructor(page: Page) {
    this.page = page;
    this.modal = new FilesCreateModal(page);
  }

  async checkNoDocsTextExist() {
    await expect(this.page.getByText("No docs here yet")).toBeVisible();
  }

  async checkNoFilesTextExist() {
    await expect(this.page.getByText("No files here yet")).toBeVisible();
  }

  async clickGotoDocumentsButton() {
    await this.page.locator(GOTO_DOCUMENTS_BUTTON).click();
  }

  async openAndValidateFileCreateModals() {
    for (const [selector, modalTitle] of Object.entries(mapDocActions)) {
      await this.page.locator(selector).click();
      await this.modal.checkModalExist();
      await this.modal.checkModalTitleExist(modalTitle);
      await this.modal.closeModalByClickOutside();
    }
  }
}

export default FilesEmptyView;

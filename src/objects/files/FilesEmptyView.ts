import { expect, Page } from "@playwright/test";

import FilesCreateModal from "./FilesCreateModal";
import { DOC_ACTIONS } from "@/src/utils/constants/files";

const GOTO_DOCUMENTS_BUTTON = "#empty-view-goto-personal";
const AI_CHAT_OPTION = "#open-ai-chat";
const EMPTY_VIEW_SUBTITLE = "Drop files here or create new ones.";

const mapDocActions = {
  "#create-doc-option": DOC_ACTIONS.CREATE_DOCUMENT,
  "#create-spreadsheet-option": DOC_ACTIONS.CREATE_SPREADSHEET,
  "#create-presentation-option": DOC_ACTIONS.CREATE_PRESENTATION,
  "#create-form-option": DOC_ACTIONS.CREATE_PDF_FORM,
} as const;

// Full content of each empty-view action item: id, displayed title and
// subheading. Separate from mapDocActions above, whose values are the
// resulting create-modal titles, not the item's own label.
const EMPTY_VIEW_ITEMS = [
  {
    id: "#create-doc-option",
    title: "Create a new document",
    description: "Take advantage of vast word processing functionality.",
  },
  {
    id: "#create-spreadsheet-option",
    title: "Create a new spreadsheet",
    description: "Carry out precise calculations with minimal effort.",
  },
  {
    id: "#create-presentation-option",
    title: "Create a new presentation",
    description: "Impress your audience with stunning slides.",
  },
  {
    id: "#create-form-option",
    title: "Create a new PDF form",
    description: "Collect votes, get opinions and store data using PDF forms",
  },
  {
    id: AI_CHAT_OPTION,
    title: "AI Chat",
    description: "Get answers, find files and draft content with AI.",
  },
] as const;

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

  async checkEmptyViewSubtitleExist() {
    await expect(this.page.getByText(EMPTY_VIEW_SUBTITLE)).toBeVisible();
  }

  async checkEmptyViewItemsExist() {
    for (const item of EMPTY_VIEW_ITEMS) {
      const wrapper = this.page.locator(item.id);
      await expect(
        wrapper.getByText(item.title, { exact: true }),
      ).toBeVisible();
      await expect(
        wrapper.getByText(item.description, { exact: true }),
      ).toBeVisible();
    }
  }

  async clickAiChatOption() {
    await this.page.locator(AI_CHAT_OPTION).click();
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

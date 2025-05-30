import { Page } from "@playwright/test";
import FilesCreateModal from "./FilesCreateModal";

const DOC_ACTIONS_MAP = {
  "#create-doc-option": "New document",
  "#create-spreadsheet-option": "New spreadsheet",
  "#create-presentation-option": "New presentation",
  "#create-form-option": "New PDF form",
} as const;

class MyDocuments {
  page: Page;
  modal: FilesCreateModal;

  portalDomain: string;

  constructor(page: Page, portalDomain: string) {
    this.page = page;
    this.portalDomain = portalDomain;
    this.modal = new FilesCreateModal(page);
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/rooms/personal`);

    await this.page.waitForURL(/.*rooms\/personal.*/, {
      waitUntil: "networkidle",
    });
  }

  async openRecentlyAccessibleTab() {
    await this.page.getByText("Recently accessible via link").click();
  }

  async openAndValidateFileCreateModals() {
    for (const [selector, modalTitle] of Object.entries(DOC_ACTIONS_MAP)) {
      await this.page.locator(selector).click();
      await this.modal.checkModalExist();
      await this.modal.checkModalTitleExist(modalTitle);
      await this.modal.closeModalByClickOutside();
    }
  }
}

export default MyDocuments;

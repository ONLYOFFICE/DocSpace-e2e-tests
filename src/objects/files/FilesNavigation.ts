import { Page } from "@playwright/test";
import { DOC_ACTIONS, listDocActions } from "../../utils/constants/files";
import FilesCreateModal from "./FilesCreateModal";
import BaseNavigation from "../common/BaseNavigation";
import FilesCreateContextMenu from "./FilesCreateContextMenu";

class FilesNavigation extends BaseNavigation {
  contenxtMenu: FilesCreateContextMenu;
  modal: FilesCreateModal;

  constructor(page: Page) {
    super(page);
    this.contenxtMenu = new FilesCreateContextMenu(page);
    this.modal = new FilesCreateModal(page);
  }

  async validateCreateFileModal(actionText: string) {
    const modalTitle =
      actionText === DOC_ACTIONS.CREATE_PDF_BLANK
        ? DOC_ACTIONS.CREATE_PDF_FORM
        : actionText;

    await this.modal.checkModalExist();
    await this.modal.checkModalTitleExist(modalTitle);
    await this.modal.closeModalByClickOutside();
  }

  async openAndValidateFileCreateModals() {
    for (const actionText of listDocActions) {
      await this.openCreateDropdown();
      await this.contenxtMenu.selectCreateAction(actionText);
      await this.validateCreateFileModal(actionText);
    }
  }
}

export default FilesNavigation;

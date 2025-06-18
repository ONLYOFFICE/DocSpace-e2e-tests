import { Page } from "@playwright/test";
import { DOC_ACTIONS, listDocActions } from "../../utils/constants/files";
import FilesCreateModal from "./FilesCreateModal";
import BaseNavigation from "../common/BaseNavigation";
import FilesCreateContextMenu from "./FilesCreateContextMenu";

const navActions = {
  moveToArchive: {
    button: "#menu-archive",
    submit: "#shared_move-to-archived-modal_submit",
  },
  delete: {
    button: "#menu-delete",
    submit: "#delete-file-modal_submit",
  },
} as const;

class FilesNavigation extends BaseNavigation {
  contextMenu: FilesCreateContextMenu;
  modal: FilesCreateModal;

  constructor(page: Page) {
    super(page, navActions);
    this.contextMenu = new FilesCreateContextMenu(page);
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
      await this.contextMenu.selectCreateAction(actionText);
      await this.validateCreateFileModal(actionText);
    }
  }

  async delete() {
    await this.performAction(navActions.delete);
  }

  async selectCreateAction(actionText: string) {
    await this.contextMenu.selectCreateAction(actionText);
  }
}

export default FilesNavigation;

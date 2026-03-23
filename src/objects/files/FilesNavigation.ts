import { expect, Page } from "@playwright/test";
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
  bulkMoveTo: {
    button: "[data-testid='table_group_menu_item_menu-move-to']",
  },
  bulkCopy: {
    button: "[data-testid='table_group_menu_item_menu-copy']",
  },
  bulkDownload: {
    button: "[data-testid='table_group_menu_item_menu-download']",
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

  async bulkMoveTo() {
    await this.performAction(navActions.bulkMoveTo);
  }

  async bulkCopy() {
    await this.performAction(navActions.bulkCopy);
  }

  async bulkDownload() {
    await this.performAction(navActions.bulkDownload);
  }

  async selectCreateAction(actionText: string) {
    await this.contextMenu.selectCreateAction(actionText);
  }

  private get actionsMainButton() {
    return this.page.locator("[data-testid='main-button']");
  }

  async openActionsDropdown() {
    await expect(async () => {
      await expect(this.actionsMainButton).toBeVisible({ timeout: 500 });
      await this.actionsMainButton.click();
      await this.contextMenu.checkMenuExists(500);
    }).toPass();
  }

  async uploadFiles(filePaths: string | string[]) {
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    await this.openActionsDropdown();
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      this.contextMenu.clickOption({
        type: "data-testid",
        value: "upload-files",
      }),
    ]);
    await fileChooser.setFiles(paths);
  }

  async uploadFolder(folderPath: string) {
    await this.openActionsDropdown();
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      this.contextMenu.clickOption({
        type: "data-testid",
        value: "upload-folder",
      }),
    ]);
    await fileChooser.setFiles(folderPath);
  }
}

export default FilesNavigation;

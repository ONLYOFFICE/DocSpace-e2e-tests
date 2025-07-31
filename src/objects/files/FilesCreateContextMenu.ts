import { Page } from "@playwright/test";
import { DOC_ACTIONS } from "../../utils/constants/files";
import FilesCreateModal from "./FilesCreateModal";
import { BaseContextMenu } from "../common/BaseContextMenu";

class FilesCreateContextMenu extends BaseContextMenu {
  modal: FilesCreateModal;

  constructor(page: Page) {
    super(page);
    this.modal = new FilesCreateModal(page);
  }

  async selectCreateAction(actionText: string) {
    if (actionText === DOC_ACTIONS.CREATE_PDF_BLANK) {
      await this.hoverOption("PDF Form");
      await this.clickOption(actionText, true);
    } else {
      await this.clickOption(actionText);
    }
  }
}

export default FilesCreateContextMenu;

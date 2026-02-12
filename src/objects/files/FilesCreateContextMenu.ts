import { Page } from "@playwright/test";
import { DOC_ACTIONS } from "../../utils/constants/files";
import FilesCreateModal from "./FilesCreateModal";
import { BaseContextMenu } from "../common/BaseContextMenu";

const ROOM_TEMPLATE_GALLERY = "actions_form-room_template_from-file";
const TEMPLATE_GALLERY = "template-gallery";

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

  async openRoomTemplateGallery() {
    await this.clickOption({ type: "id", value: ROOM_TEMPLATE_GALLERY });
  }

  async openTemplateGallery() {
    await this.clickOption({ type: "data-testid", value: TEMPLATE_GALLERY });
  }
}

export default FilesCreateContextMenu;

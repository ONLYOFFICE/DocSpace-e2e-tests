import { expect, Page } from "@playwright/test";
import { DOC_ACTIONS } from "../../utils/constants/files";
import FilesCreateModal from "./FilesCreateModal";
import { BaseContextMenu } from "../common/BaseContextMenu";

const TEMPLATE_GALLERY = "template-gallery";

class FilesCreateContextMenu extends BaseContextMenu {
  modal: FilesCreateModal;

  constructor(page: Page) {
    super(page);
    this.modal = new FilesCreateModal(page);
  }

  async selectCreateAction(actionText: string) {
    if (actionText === DOC_ACTIONS.CREATE_PDF_BLANK) {
      const parent = this.menu.getByText("PDF Form", { exact: true });
      await parent.hover({ timeout: 3000 });
      await expect(this.submenu).toBeVisible({ timeout: 2000 });
      const submenuItem = this.submenu.getByText(actionText, { exact: true });
      await submenuItem.hover({ timeout: 2000 });
      await submenuItem.click({ timeout: 2000 });
    } else {
      const item = this.menu.getByText(actionText, { exact: true });
      await item.click({ timeout: 3000 });
    }
  }

  async openTemplateGallery() {
    await this.clickOption({ type: "data-testid", value: TEMPLATE_GALLERY });
  }
}

export default FilesCreateContextMenu;

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
      const submenuItem = this.submenu.getByText(actionText, { exact: true });

      await expect(async () => {
        await parent.hover();
        await expect(submenuItem).toBeVisible({ timeout: 2000 });
      }).toPass({ timeout: 10000 });

      await submenuItem.click({ timeout: 5000 });
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

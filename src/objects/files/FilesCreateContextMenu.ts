import { expect, Page } from "@playwright/test";
import { DOC_ACTIONS } from "../../utils/constants/files";
import FilesCreateModal from "./FilesCreateModal";
import { BaseContextMenu } from "../common/BaseContextMenu";

const TEMPLATE_GALLERY = "template-gallery";

// The create dropdown shows short labels ("Document", "Folder", ...) while
// DOC_ACTIONS keeps the longer "New ..." text used for modal title checks.
const MENU_ITEM_TEXT: Partial<Record<string, string>> = {
  [DOC_ACTIONS.CREATE_DOCUMENT]: "Document",
  [DOC_ACTIONS.CREATE_SPREADSHEET]: "Spreadsheet",
  [DOC_ACTIONS.CREATE_PRESENTATION]: "Presentation",
  [DOC_ACTIONS.CREATE_FOLDER]: "Folder",
  [DOC_ACTIONS.CREATE_PDF_FORM]: "PDF Form",
};

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
      const menuText = MENU_ITEM_TEXT[actionText] ?? actionText;
      const item = this.menu.getByText(menuText, { exact: true });
      await expect(async () => {
        await item.click({ timeout: 3000 });
      }).toPass({ timeout: 10000 });
    }
  }

  async openTemplateGallery() {
    await this.clickOption({ type: "data-testid", value: TEMPLATE_GALLERY });
  }
}

export default FilesCreateContextMenu;

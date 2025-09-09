import { Page, expect } from "@playwright/test";
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

  // now the method creates a new file and opens the ONLYOFFICE editor tab
async createAndOpenEditor(
  actionText: string,               // "New document" | "New spreadsheet" | ...
  opts: { name?: string } = {}
): Promise<Page> {

  await this.page.getByRole("menuitem", { name: actionText }).click();

  const dialog = this.page
    .getByRole("dialog")
    .filter({ has: this.page.getByTestId("new_document_save_button") })
    .first();

  await expect(dialog).toBeVisible();

  if (opts.name) {
    const nameInput = dialog.getByTestId("new_document_text_input");
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill(opts.name);
  }

 
  const popupPromise = this.page.waitForEvent("popup", {
    timeout: 15000,
    predicate: p => p.url() === "about:blank" || /\/doceditor/.test(p.url()),
  });

  await dialog.getByTestId("new_document_save_button").click();

 let editorPage = await popupPromise.catch(() => null as unknown as Page);

  editorPage = editorPage ?? this.page;

  await editorPage.waitForURL(/\/doceditor/, { timeout: 15000 });
  await editorPage.waitForLoadState("domcontentloaded");

  return editorPage;
}
}

export default FilesCreateContextMenu;

import { expect, Page } from "@playwright/test";

const MOVE_TO_TRASH = "#delete-file-modal_submit";
const CANCEL_DELETE_FOLDER = "#delete-file-modal_cancel";

class FolderDeleteModal {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickDeleteFolder() {
    const createRoom = this.page.locator(MOVE_TO_TRASH);
    await expect(createRoom).toBeVisible();
    await createRoom.click();
  }

  async clickCancelDeleteFolder() {
    const cancelButton = this.page.locator(CANCEL_DELETE_FOLDER);
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();
  }
}

export default FolderDeleteModal;

import { expect, Page } from "@playwright/test";

const CREATE_ROOM_BUTTON = "#create-room";
const CANCEL_SHARE_FOLDER_BUTTON = "#cancel-share-folder";

class FolderShareModal {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickCreateRoom() {
    const createRoom = this.page.locator(CREATE_ROOM_BUTTON);
    await expect(createRoom).toBeVisible();
    await createRoom.click();
  }

  async clickCancelShareFolder() {
    const cancelButton = this.page.locator(CANCEL_SHARE_FOLDER_BUTTON);
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();
  }
}

export default FolderShareModal;

import { expect, Page } from "@playwright/test";
import BaseArticle from "../common/BaseArticle";

const NEW_ROOM_BUTTON = "create_new_room_button";
const DIALOG_HEADER = "#modal-header-swipe";
const DIALOG_TITLE = "Choose room type";

class RoomsArticle extends BaseArticle {
  constructor(page: Page) {
    super(page);
  }

  private get newRoomButton() {
    return this.articleContainer.getByTestId(NEW_ROOM_BUTTON);
  }
  private get dialogHeader() {
    // Workaround: two modals share data-testid in DOM
    return this.page.getByTestId("aside-header").last();
  }

  async openCreateDialog() {
    await expect(this.newRoomButton).toBeVisible();
    await this.newRoomButton.click();
    await expect(this.dialogHeader).toBeVisible();
  }
}

export default RoomsArticle;

import { expect, Page, Locator } from "@playwright/test";

const CHECK_READY_FORM = "Check ready forms";
const BACK_TO_ROOM = "Back to room";
const FILL_IT_OUT_AGAIN = "Fill it out again";

class RoomPDFCompleted {
  private page: Page;
  private backToRoomButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backToRoomButton = page.locator('button:has-text("Back to room")');
  }

  setPdfPage(page: Page) {
    this.page = page;
    this.backToRoomButton = page.locator('button:has-text("Back to room")');
  }

  async chooseBackToRoom() {
    await this.backToRoomButton.click();
  }
}

export default RoomPDFCompleted;
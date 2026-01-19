import { Page } from "@playwright/test";
const CHECK_READY_FORM = "goto_complete_folder_button";
const BACK_TO_ROOM = "back_to_room_button";
const FILL_IT_OUT_AGAIN = "fill_again_link";

class RoomPDFCompleted {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  private get backToRoomButton() {
    return this.page.getByTestId(BACK_TO_ROOM);
  }

  async chooseBackToRoom() {
    await this.backToRoomButton.click();
  }

  private get fillItOutAgainButton() {
    return this.page.getByTestId(FILL_IT_OUT_AGAIN);
  }

  async chooseFillItOutAgain() {
    await this.fillItOutAgainButton.click();
  }

  public async isReadyFormButtonVisible() {
    return this.checkReadyFormButton.isVisible();
  }

  private get checkReadyFormButton() {
    return this.page.getByTestId(CHECK_READY_FORM);
  }

  async checkReadyForm() {
    await this.checkReadyFormButton.click();
  }
}

export default RoomPDFCompleted;

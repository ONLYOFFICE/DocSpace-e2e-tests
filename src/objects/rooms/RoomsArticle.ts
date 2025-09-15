import { expect, Page } from "@playwright/test";
import BaseArticle from "../common/BaseArticle";

class RoomsArticle extends BaseArticle {
  constructor(page: Page) {
    super(page);
  }
  

  private get newRoomButton() {
    return this.articleContainer.getByRole("button", { name: "New room" });
  }
  private get dialogHeader() {
    return this.page.getByTestId("aside-header");
  }

  async openCreateDialog() {
    await expect(this.newRoomButton).toBeVisible();
    await this.newRoomButton.click();
    await expect(this.dialogHeader).toBeVisible();
  }
}

export default RoomsArticle;

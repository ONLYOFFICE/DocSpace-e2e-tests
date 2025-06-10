import { expect, Page } from "@playwright/test";
import BaseArticle from "../common/BaseArticle";
import { listArticleDocActions } from "@/src/utils/constants/files";

class RoomsArticle extends BaseArticle {
  constructor(page: Page) {
    super(page);
  }

  private get newRoomButton() {
    return this.articleContainer.getByRole("button", { name: "New room" });
  }

  async clickNewRoomButton() {
    await expect(this.newRoomButton).toBeVisible();
    await this.newRoomButton.click();
  }
}

export default RoomsArticle;

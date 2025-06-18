import { expect, Page } from "@playwright/test";

const GOTO_ROOMS_BUTTON = "#empty-view-goto-shared";

class ArchiveEmptyView {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async checkNoArchivedRoomsExist() {
    await expect(
      this.page.getByText("No archived rooms here yet"),
    ).toBeVisible();
  }

  async gotoRooms() {
    await this.page.locator(GOTO_ROOMS_BUTTON).click();
  }
}

export default ArchiveEmptyView;

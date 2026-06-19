import { expect, Page } from "@playwright/test";

const PANEL = ".new-files-panel";
const MARK_AS_READ_BUTTON = "mark_as_read_button";
const DATE_ITEM = ".date-item";
const ROOM_ITEM_TITLE = ".room-item-title";
const FILE_ITEM = '[class*="fileItem"]';
const OPEN_LOCATION_BUTTON = ".open-location-button";
const MORE_ITEMS_LINK = ".more-items__link";

const SHARED_WITH_ME_BADGE =
  '[data-testid="article-item"]:has(#document_catalog-share) [data-testid="badge"]';
const ROOMS_BADGE =
  '[data-testid="article-item"]:has(#document_catalog-shared) [data-testid="badge"]';
const MY_DOCUMENTS_BADGE =
  '[data-testid="article-item"]:has(#document_catalog-personal) [data-testid="badge"]';

class NewFilesPanel {
  private page: Page;
  private panel: ReturnType<Page["locator"]>;

  constructor(page: Page) {
    this.page = page;
    this.panel = page.locator(PANEL);
  }

  async openByClickingSharedWithMeBadge() {
    const badge = this.page.locator(SHARED_WITH_ME_BADGE);
    await expect(badge).toBeVisible();
    await badge.click();
  }

  async openByClickingRoomsBadge() {
    const badge = this.page.locator(ROOMS_BADGE);
    await expect(badge).toBeVisible();
    await badge.click();
  }

  async openByClickingMyDocumentsBadge() {
    const badge = this.page.locator(MY_DOCUMENTS_BADGE);
    await expect(badge).toBeVisible();
    await badge.click();
  }

  async expectVisible() {
    await expect(this.panel).toBeVisible();
  }

  async expectNotVisible() {
    await expect(this.panel).not.toBeVisible();
  }

  async expectFileItemVisible(fileName: string) {
    await expect(
      this.panel.locator(FILE_ITEM).filter({ hasText: fileName }),
    ).toBeVisible();
  }

  async expectRoomTitleVisible(roomName: string) {
    await expect(
      this.panel.locator(ROOM_ITEM_TITLE).filter({ hasText: roomName }),
    ).toBeVisible();
  }

  async expectDateItemVisible() {
    await expect(this.panel.locator(DATE_ITEM).first()).toBeVisible();
  }

  async expectMoreItemsLinkVisible() {
    await expect(this.panel.locator(MORE_ITEMS_LINK)).toBeVisible();
  }

  async expectSharedWithMeBadgeVisible(visible: boolean) {
    const badge = this.page.locator(SHARED_WITH_ME_BADGE);
    if (visible) {
      await expect(badge).toBeVisible();
    } else {
      await expect(badge).not.toBeVisible();
    }
  }

  async expectRoomsBadgeVisible(visible: boolean) {
    const badge = this.page.locator(ROOMS_BADGE);
    if (visible) {
      await expect(badge).toBeVisible();
    } else {
      await expect(badge).not.toBeVisible();
    }
  }

  async expectMyDocumentsBadgeVisible(visible: boolean) {
    const badge = this.page.locator(MY_DOCUMENTS_BADGE);
    if (visible) {
      await expect(badge).toBeVisible();
    } else {
      await expect(badge).not.toBeVisible();
    }
  }

  async clickMarkAsRead(fileName: string) {
    await expect(
      this.panel.locator(FILE_ITEM).filter({ hasText: fileName }),
    ).toBeVisible();
    const button = this.panel.getByTestId(MARK_AS_READ_BUTTON);
    await expect(button).toBeVisible();
    await button.click();
  }

  async clickOpenLocation(fileName: string) {
    const item = this.panel.locator(FILE_ITEM).filter({ hasText: fileName });
    await item.hover();
    const button = item.locator(OPEN_LOCATION_BUTTON);
    await expect(button).toBeVisible();
    await button.click();
  }

  async clickMoreItemsLink() {
    await this.panel.locator(MORE_ITEMS_LINK).click();
  }
}

export default NewFilesPanel;

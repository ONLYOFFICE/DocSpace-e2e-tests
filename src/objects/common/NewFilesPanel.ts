import { expect, Page } from "@playwright/test";
import AppsSidebar from "./AppsSidebar";
import { apps, filesSubItems } from "@/src/utils/constants/navigation";

const PANEL = ".new-files-panel";
const MARK_AS_READ_BUTTON = "mark_as_read_button";
const DATE_ITEM = ".date-item";
const ROOM_ITEM_TITLE = ".room-item-title";
const FILE_ITEM = '[class*="fileItem"]';
const OPEN_LOCATION_BUTTON = ".open-location-button";
const MORE_ITEMS_LINK = ".more-items__link";

class NewFilesPanel {
  private page: Page;
  private panel: ReturnType<Page["locator"]>;
  private sidebar: AppsSidebar;

  constructor(page: Page) {
    this.page = page;
    this.panel = page.locator(PANEL);
    this.sidebar = new AppsSidebar(page);
  }

  private async clickBadge(badge: ReturnType<Page["locator"]>) {
    await expect(badge).toBeVisible();
    await badge.click();
  }

  async openByClickingSharedWithMeBadge() {
    await this.sidebar.expandApp(apps.files);
    await this.clickBadge(
      this.sidebar.subItemBadge(apps.files, filesSubItems.sharedWithMe),
    );
  }

  async openByClickingRoomsBadge() {
    await this.clickBadge(this.sidebar.itemBadge(apps.rooms));
  }

  async openByClickingMyDocumentsBadge() {
    await this.clickBadge(this.sidebar.itemBadge(apps.files));
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

  private async expectBadgeVisible(
    badge: ReturnType<Page["locator"]>,
    visible: boolean,
  ) {
    if (visible) {
      await expect(badge).toBeVisible();
    } else {
      await expect(badge).not.toBeVisible();
    }
  }

  async expectSharedWithMeBadgeVisible(visible: boolean) {
    await this.sidebar.expandApp(apps.files);
    await this.expectBadgeVisible(
      this.sidebar.subItemBadge(apps.files, filesSubItems.sharedWithMe),
      visible,
    );
  }

  async expectRoomsBadgeVisible(visible: boolean) {
    await this.expectBadgeVisible(this.sidebar.itemBadge(apps.rooms), visible);
  }

  async expectMyDocumentsBadgeVisible(visible: boolean) {
    await this.expectBadgeVisible(this.sidebar.itemBadge(apps.files), visible);
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

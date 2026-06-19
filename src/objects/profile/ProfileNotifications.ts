import { expect, Page } from "@playwright/test";
import { getPortalUrl } from "../../../config";
import { notificationsText } from "@/src/utils/constants/profile";

const FILE_ACTIVITY_TOGGLE = "actions_rooms_toggle_button";
const ROOMS_ACTIVITY_TOGGLE = "rooms_activity_toggle_button";
const DAILY_FEED_TOGGLE = "daily_feed_toggle_button";
const USEFUL_TIPS_TOGGLE = "useful_tips_toggle_button";
const NOTIFICATION_SETTINGS_URL = "/api/2.0/settings/notification";
const SHARED_WITH_ME_BADGE =
  '[data-testid="article-item"]:has(#document_catalog-share) [data-testid="badge"]';
const ROOMS_BADGE =
  '[data-testid="article-item"]:has(#document_catalog-shared) [data-testid="badge"]';
const MY_DOCUMENTS_BADGE =
  '[data-testid="article-item"]:has(#document_catalog-personal) [data-testid="badge"]';

class ProfileNotifications {
  private page: Page;
  private portalDomain: string;

  constructor(page: Page, portalDomain: string) {
    this.page = page;
    this.portalDomain = portalDomain;
  }

  async open() {
    await expect(async () => {
      await this.page
        .goto(`${getPortalUrl(this.portalDomain)}/profile/notifications`, {
          waitUntil: "domcontentloaded",
        })
        .catch(() => {});
      await expect(this.page).toHaveURL(/.*profile\/notifications.*/);
    }).toPass({ timeout: 30000 });
  }

  async toggleFileActivity() {
    await Promise.all([
      this.page.waitForResponse(
        (r) =>
          r.url().includes(NOTIFICATION_SETTINGS_URL) &&
          r.request().method() === "POST",
      ),
      this.page.getByTestId(FILE_ACTIVITY_TOGGLE).click(),
    ]);
  }

  async expectFileActivityEnabled(enabled: boolean) {
    await expect(this.page.getByTestId(FILE_ACTIVITY_TOGGLE)).toHaveAttribute(
      "aria-checked",
      String(enabled),
    );
  }

  async expectFileActivityDescriptionVisible() {
    await expect(
      this.page.getByText(notificationsText.fileActivityDescription),
    ).toBeVisible();
  }

  async expectRoomsActivityDescriptionVisible() {
    await expect(
      this.page.getByText(notificationsText.roomsActivityDescription),
    ).toBeVisible();
  }

  async expectDailyFeedDescriptionVisible() {
    await expect(
      this.page.getByText(notificationsText.dailyFeedDescription),
    ).toBeVisible();
  }

  async expectUsefulTipsDescriptionVisible() {
    await expect(
      this.page.getByText(notificationsText.usefulTipsDescription),
    ).toBeVisible();
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

  async toggleRoomsActivity() {
    await Promise.all([
      this.page.waitForResponse(
        (r) =>
          r.url().includes(NOTIFICATION_SETTINGS_URL) &&
          r.request().method() === "POST",
      ),
      this.page.getByTestId(ROOMS_ACTIVITY_TOGGLE).click(),
    ]);
  }

  async expectRoomsActivityEnabled(enabled: boolean) {
    await expect(this.page.getByTestId(ROOMS_ACTIVITY_TOGGLE)).toHaveAttribute(
      "aria-checked",
      String(enabled),
    );
  }

  async toggleDailyFeed() {
    await Promise.all([
      this.page.waitForResponse(
        (r) =>
          r.url().includes(NOTIFICATION_SETTINGS_URL) &&
          r.request().method() === "POST",
      ),
      this.page.getByTestId(DAILY_FEED_TOGGLE).click(),
    ]);
  }

  async expectDailyFeedEnabled(enabled: boolean) {
    await expect(this.page.getByTestId(DAILY_FEED_TOGGLE)).toHaveAttribute(
      "aria-checked",
      String(enabled),
    );
  }

  async toggleUsefulTips() {
    await Promise.all([
      this.page.waitForResponse(
        (r) =>
          r.url().includes(NOTIFICATION_SETTINGS_URL) &&
          r.request().method() === "POST",
      ),
      this.page.getByTestId(USEFUL_TIPS_TOGGLE).click(),
    ]);
  }

  async expectUsefulTipsEnabled(enabled: boolean) {
    await expect(this.page.getByTestId(USEFUL_TIPS_TOGGLE)).toHaveAttribute(
      "aria-checked",
      String(enabled),
    );
  }
}

export default ProfileNotifications;

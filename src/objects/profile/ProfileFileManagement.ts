import { expect, Page } from "@playwright/test";
import { getPortalUrl } from "../../../config";

const ROOM_GROUPING_TOGGLE = "room_grouping_toggle_button";
const OPEN_SAME_TAB_TOGGLE = "open_same_tab_toggle_button";
const DEFAULT_HOMEPAGE_COMBO = "default_homepage_combobox";
const DEFAULT_HOMEPAGE_DROPDOWN =
  '[data-testid="default_homepage_combobox_dropdown"]';
const LOGO_BUTTON = ".logo-icon_svg";
const SAVE_COPY_ORIGINAL_TOGGLE = "save_copy_original_toggle_button";
const DISPLAY_NOTIFICATION_TOGGLE = "display_notification_toggle_button";
const DISPLAY_FILE_EXTENSION_TOGGLE = "display_file_extension_toggle_button";
// Note: "cancelletion" is the actual testid spelling in the app
const CANCELLATION_NOTIFICATION_TOGGLE =
  "cancelletion_notification_toggle_button";

class ProfileFileManagement {
  private page: Page;
  private portalDomain: string;

  constructor(page: Page, portalDomain: string) {
    this.page = page;
    this.portalDomain = portalDomain;
  }

  async open() {
    await expect(async () => {
      await this.page
        .goto(`${getPortalUrl(this.portalDomain)}/profile/file-management`, {
          waitUntil: "domcontentloaded",
        })
        .catch(() => {});
      await expect(this.page).toHaveURL(/.*profile\/file-management.*/);
    }).toPass({ timeout: 30000 });
  }

  async clickLogoAndExpectUrl(expectedUrl: RegExp) {
    await this.page.locator(LOGO_BUTTON).click();
    await this.page.waitForURL(expectedUrl, { waitUntil: "load" });
  }

  async toggleRoomGrouping() {
    await this.page.getByTestId(ROOM_GROUPING_TOGGLE).click();
  }

  async toggleOpenInSameTab() {
    const toggle = this.page.getByTestId(OPEN_SAME_TAB_TOGGLE);
    await expect(toggle).toBeEnabled();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");
  }

  async disableOpenInSameTab() {
    const toggle = this.page.getByTestId(OPEN_SAME_TAB_TOGGLE);
    await expect(toggle).toBeEnabled();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
  }

  async expectOpenInSameTabEnabled(enabled: boolean) {
    const toggle = this.page.getByTestId(OPEN_SAME_TAB_TOGGLE);
    await expect(toggle).toHaveAttribute("aria-checked", String(enabled));
  }

  async selectDefaultHomepage(option: string) {
    await this.page.getByTestId(DEFAULT_HOMEPAGE_COMBO).click();
    await this.page
      .locator(DEFAULT_HOMEPAGE_DROPDOWN)
      .getByText(option, { exact: true })
      .click();
  }

  async expectDefaultHomepageOption(option: string) {
    await expect(this.page.getByTestId(DEFAULT_HOMEPAGE_COMBO)).toContainText(
      option,
    );
  }

  async toggleSaveCopyOriginalFormat() {
    const toggle = this.page.getByTestId(SAVE_COPY_ORIGINAL_TOGGLE);
    await expect(toggle).toBeEnabled();
    await toggle.click();
  }

  async expectSaveCopyOriginalFormatEnabled(enabled: boolean) {
    const toggle = this.page.getByTestId(SAVE_COPY_ORIGINAL_TOGGLE);
    await expect(toggle).toHaveAttribute("aria-checked", String(enabled));
  }

  async toggleDisplayTrashNotification() {
    const toggle = this.page.getByTestId(DISPLAY_NOTIFICATION_TOGGLE);
    await expect(toggle).toBeEnabled();
    await toggle.click();
  }

  async expectDisplayTrashNotificationEnabled(enabled: boolean) {
    const toggle = this.page.getByTestId(DISPLAY_NOTIFICATION_TOGGLE);
    await expect(toggle).toHaveAttribute("aria-checked", String(enabled));
  }

  async toggleDisplayFileExtension() {
    const toggle = this.page.getByTestId(DISPLAY_FILE_EXTENSION_TOGGLE);
    await expect(toggle).toBeEnabled();
    await toggle.click();
  }

  async expectDisplayFileExtensionEnabled(enabled: boolean) {
    const toggle = this.page.getByTestId(DISPLAY_FILE_EXTENSION_TOGGLE);
    await expect(toggle).toHaveAttribute("aria-checked", String(enabled));
  }

  async toggleCancellationNotification() {
    const toggle = this.page.getByTestId(CANCELLATION_NOTIFICATION_TOGGLE);
    await expect(toggle).toBeEnabled();
    await toggle.click();
  }

  async expectCancellationNotificationEnabled(enabled: boolean) {
    const toggle = this.page.getByTestId(CANCELLATION_NOTIFICATION_TOGGLE);
    await expect(toggle).toHaveAttribute("aria-checked", String(enabled));
  }

  async expectDefaultHomepageOptionNotAvailable(option: string) {
    await this.page.getByTestId(DEFAULT_HOMEPAGE_COMBO).click();
    await expect(
      this.page
        .locator(DEFAULT_HOMEPAGE_DROPDOWN)
        .getByText(option, { exact: true }),
    ).not.toBeVisible();
  }
}

export default ProfileFileManagement;

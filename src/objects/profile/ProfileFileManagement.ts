import { expect, Page } from "@playwright/test";
import { getPortalUrl } from "../../../config";

const ROOM_GROUPING_TOGGLE = "room_grouping_toggle_button";
const DEFAULT_HOMEPAGE_COMBO = "default_homepage_combobox";
const DEFAULT_HOMEPAGE_DROPDOWN =
  '[data-testid="default_homepage_combobox_dropdown"]';
const LOGO_BUTTON = ".logo-icon_svg";

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

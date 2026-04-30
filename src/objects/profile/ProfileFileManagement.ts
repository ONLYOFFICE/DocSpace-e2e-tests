import { expect, Page } from "@playwright/test";
import { getPortalUrl } from "../../../config";

const ROOM_GROUPING_TOGGLE = "room_grouping_toggle_button";
const DEFAULT_HOMEPAGE_SECTION = ".default-page-setting";
const DEFAULT_HOMEPAGE_COMBO = '[data-test-id="combo-button"]';
const DEFAULT_HOMEPAGE_OPTION_ROLE = "option";
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
    const section = this.page.locator(DEFAULT_HOMEPAGE_SECTION);
    await section.locator(DEFAULT_HOMEPAGE_COMBO).click();
    await this.page
      .getByRole(DEFAULT_HOMEPAGE_OPTION_ROLE)
      .filter({ hasText: option })
      .click();
  }

  async expectDefaultHomepageOption(option: string) {
    const section = this.page.locator(DEFAULT_HOMEPAGE_SECTION);
    await expect(section.locator(DEFAULT_HOMEPAGE_COMBO)).toContainText(option);
  }

  async expectDefaultHomepageOptionNotAvailable(option: string) {
    const section = this.page.locator(DEFAULT_HOMEPAGE_SECTION);
    await section.locator(DEFAULT_HOMEPAGE_COMBO).click();
    await expect(
      this.page
        .getByRole(DEFAULT_HOMEPAGE_OPTION_ROLE)
        .filter({ hasText: option }),
    ).not.toBeVisible();
  }
}

export default ProfileFileManagement;

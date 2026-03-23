import { expect, Page } from "@playwright/test";
import { getPortalUrl } from "../../../config";

const ROOM_GROUPING_TOGGLE = "room_grouping_toggle_button";

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

  async toggleRoomGrouping() {
    await this.page.getByTestId(ROOM_GROUPING_TOGGLE).click();
  }
}

export default ProfileFileManagement;

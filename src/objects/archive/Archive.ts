import { expect, Page } from "@playwright/test";

import BaseNavigation from "../common/BaseNavigation";
import InfoPanel from "../common/InfoPanel";
import BaseTable from "../common/BaseTable";
import ArchiveEmptyView from "./ArchiveEmptyView";
import BaseFilter from "../common/BaseFilter";

const navActions = {
  restore: {
    button: "#menu-unarchive",
    submit: "#restore-all_submit",
  },
  delete: {
    button: "#menu-delete-room",
    submit: "#delete-file-modal_submit",
  },
} as const;

const LAST_ACTIVITY_CHECKBOX =
  ".table-container_settings-checkbox:has(span:text-is('Last activity'))";

class MyArchive {
  page: Page;
  portalDomain: string;

  navigation: BaseNavigation;
  archiveTable: BaseTable;
  archiveEmptyView: ArchiveEmptyView;

  baseFilter: BaseFilter;
  infoPanel: InfoPanel;

  constructor(page: Page, portalDomain: string) {
    this.page = page;
    this.portalDomain = portalDomain;

    this.navigation = new BaseNavigation(page, navActions);
    this.archiveTable = new BaseTable(page);
    this.archiveEmptyView = new ArchiveEmptyView(page);
    this.baseFilter = new BaseFilter(page);
    this.infoPanel = new InfoPanel(page);
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/rooms/archived`, {
      waitUntil: "load",
    });
    await expect(this.page).toHaveURL(/.*rooms\/archived.*/);
  }

  async restoreRooms() {
    await this.navigation.performAction(navActions.restore);
  }

  async deleteRooms() {
    await this.navigation.performAction(navActions.delete);
  }

  async hideLastActivityColumn() {
    await this.archiveTable.hideTableColumn(
      this.page.locator(LAST_ACTIVITY_CHECKBOX),
    );
  }
}

export default MyArchive;

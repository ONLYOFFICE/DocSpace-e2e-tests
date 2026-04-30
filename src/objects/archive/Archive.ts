import { expect, Page } from "@playwright/test";
import { getPortalUrl } from "../../../config";

import BaseNavigation from "../common/BaseNavigation";
import InfoPanel from "../common/InfoPanel";
import BaseTable from "../common/BaseTable";
import ArchiveEmptyView from "./ArchiveEmptyView";
import BaseFilter from "../common/BaseFilter";
import BasePage from "../common/BasePage";

import { BaseContextMenu } from "../common/BaseContextMenu";
import {
  archiveToastMessages,
  archiveContextMenuOption,
} from "@/src/utils/constants/archive";

const navActions = {
  restore: {
    button: "#menu-unarchive",
    submit: "#restore-all_submit",
  },
  delete: {
    button: '[data-testid="option_delete"]',
    submit: "#delete-file-modal_submit",
    confirmCheckboxSelector:
      "#modal-dialog label[data-testid='delete_warning_checkbox']",
  },
} as const;

const BULK_DELETE_BUTTON = "#menu-delete-room";

const LAST_ACTIVITY_CHECKBOX =
  ".table-container_settings-checkbox:has(span:text-is('Last activity'))";

class MyArchive extends BasePage {
  portalDomain: string;

  navigation: BaseNavigation;
  archiveTable: BaseTable;
  archiveEmptyView: ArchiveEmptyView;
  contextMenu: BaseContextMenu;

  baseFilter: BaseFilter;
  infoPanel: InfoPanel;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;

    this.navigation = new BaseNavigation(page, navActions);
    this.archiveTable = new BaseTable(page);
    this.archiveEmptyView = new ArchiveEmptyView(page);
    this.contextMenu = new BaseContextMenu(page);
    this.baseFilter = new BaseFilter(page);
    this.infoPanel = new InfoPanel(page);
  }

  async open() {
    await this.page.goto(`${getPortalUrl(this.portalDomain)}/rooms/archived`, {
      waitUntil: "load",
    });
    await expect(this.page).toHaveURL(/.*rooms\/archived.*/);
  }

  async restoreRooms() {
    await this.archiveTable.selectAllRows();
    await this.navigation.performAction(navActions.restore);
    await this.removeToast(archiveToastMessages.unarchived);
  }

  async deleteRooms() {
    await this.archiveTable.selectAllRows();
    await this.deleteSelectedRooms();
  }

  async selectRooms(titles: string[]) {
    if (titles.length === 0) return;

    const firstRow = await this.archiveTable.getRowByTitle(titles[0]);
    await expect(firstRow).toBeVisible();
    await firstRow.click();
    await this.archiveTable.expectRowIsChecked(firstRow);

    for (const title of titles.slice(1)) {
      const row = await this.archiveTable.getRowByTitle(title);
      await expect(row).toBeVisible();
      await row.click({ modifiers: ["Control"] });
      await this.archiveTable.expectRowIsChecked(row);
    }
  }

  async deleteSelectedRooms() {
    await this.page.locator(BULK_DELETE_BUTTON).click();
    await this.confirmDeleteDialog();
    await this.removeToast(archiveToastMessages.removed);
  }

  async restoreSingleRoom(roomName: string) {
    await this.archiveTable.openContextMenu(roomName);
    await this.contextMenu.clickOption(archiveContextMenuOption.restore);
    await this.page.locator(navActions.restore.submit).click();
  }

  async deleteSingleRoom(roomName: string) {
    await this.archiveTable.openContextMenu(roomName);
    await this.contextMenu.clickOption(archiveContextMenuOption.delete);
    await this.confirmDeleteDialog();
    await this.removeToast(archiveToastMessages.roomRemoved);
  }

  private async confirmDeleteDialog() {
    await this.page.locator(navActions.delete.confirmCheckboxSelector).click();
    await this.page.locator(navActions.delete.submit).click();
  }

  async hideLastActivityColumn() {
    await this.archiveTable.hideTableColumn(
      this.page.locator(LAST_ACTIVITY_CHECKBOX),
    );
  }
}

export default MyArchive;

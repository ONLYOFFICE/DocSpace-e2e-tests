import { expect, Page } from "@playwright/test";
import { getPortalUrl } from "../../../config";
import BasePage from "../common/BasePage";
import FilesEmptyView from "./FilesEmptyView";
import FilesTable from "./FilesTable";
import FilesFilter from "./FilesFilter";
import InfoPanel from "../common/InfoPanel";
import { apps, filesSubItems } from "@/src/utils/constants/navigation";
import { documentContextMenuOption } from "@/src/utils/constants/files";

class Recent extends BasePage {
  private portalDomain: string;
  filesEmptyView: FilesEmptyView;
  filesTable: FilesTable;
  filesFilter: FilesFilter;
  infoPanel: InfoPanel;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
    this.filesEmptyView = new FilesEmptyView(page);
    this.filesTable = new FilesTable(page);
    this.filesFilter = new FilesFilter(page);
    this.infoPanel = new InfoPanel(page);
  }

  private async waitForRecentPage() {
    await expect(this.page).toHaveURL(/\/recent\/filter/);
  }

  async open() {
    await this.page.goto(`${getPortalUrl(this.portalDomain)}/recent/filter`);
    await this.waitForRecentPage();
  }

  async openFromNavigation() {
    await this.sidebar.openSubItem(apps.files, filesSubItems.recent);
    await this.waitForRecentPage();
  }

  private async openRowContextMenu(name: string) {
    const nameCell = this.page
      .locator("[data-testid^='recent-cell-name']")
      .filter({ hasText: name })
      .first();
    await expect(nameCell).toBeVisible();

    await expect(async () => {
      await nameCell.click({ button: "right" });
      await expect(this.filesTable.contextMenu.menu).toBeVisible({
        timeout: 3000,
      });
    }).toPass({ timeout: 15000 });
  }

  async removeFromRecent(name: string) {
    await this.openRowContextMenu(name);
    await this.filesTable.contextMenu.clickOption(
      documentContextMenuOption.removeFromRecent,
    );
  }

  async downloadFromRecent(name: string) {
    return this.waitForDownload(async () => {
      await this.openRowContextMenu(name);
      await this.filesTable.contextMenu.clickSubmenuOption(
        documentContextMenuOption.download,
        "Original format",
      );
    });
  }

  async openFileLocation(name: string) {
    await this.openRowContextMenu(name);
    await this.filesTable.contextMenu.clickOption(
      documentContextMenuOption.openLocation,
    );
  }

  async checkNoRecentFilesTextExist() {
    await expect(
      this.page.getByText("No recent files yet", { exact: true }),
    ).toBeVisible();
  }
}

export default Recent;

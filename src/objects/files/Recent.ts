import { expect, Page } from "@playwright/test";
import { getPortalUrl } from "../../../config";
import BasePage from "../common/BasePage";
import FilesEmptyView from "./FilesEmptyView";
import FilesTable from "./FilesTable";
import FilesFilter from "./FilesFilter";
import InfoPanel from "../common/InfoPanel";
import { apps, filesSubItems } from "@/src/utils/constants/navigation";

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

  async checkNoRecentFilesTextExist() {
    await expect(
      this.page.getByText("No recent files here yet", { exact: true }),
    ).toBeVisible();
  }
}

export default Recent;

import { expect, Page } from "@playwright/test";
import { getPortalUrl } from "../../../config";
import BasePage from "../common/BasePage";
import FilesTable from "./FilesTable";
import FilesFilter from "./FilesFilter";
import InfoPanel from "../common/InfoPanel";
import { apps, filesSubItems } from "@/src/utils/constants/navigation";

const SHARED_WITH_ME_URL = /shared-with-me/;

class SharedWithMe extends BasePage {
  private portalDomain: string;
  filesTable: FilesTable;
  filesFilter: FilesFilter;
  infoPanel: InfoPanel;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
    this.filesTable = new FilesTable(page);
    this.filesFilter = new FilesFilter(page);
    this.infoPanel = new InfoPanel(page);
  }

  async open() {
    await this.page.goto(
      `${getPortalUrl(this.portalDomain)}/shared-with-me/filter`,
    );
    await this.waitForSharedWithMePage();
  }

  async openFromNavigation() {
    await this.sidebar.openSubItem(apps.files, filesSubItems.sharedWithMe);
    await this.waitForSharedWithMePage();
  }

  private async waitForSharedWithMePage() {
    await expect(this.page).toHaveURL(SHARED_WITH_ME_URL);
    await this.page.waitForLoadState("domcontentloaded");
  }

  async checkEmptyViewVisible() {
    await expect(this.page.getByTestId("empty-view")).toBeVisible();
  }
}

export default SharedWithMe;

import { expect, Page } from "@playwright/test";
import { getPortalUrl } from "../../../config";
import BasePage from "../common/BasePage";
import FilesTable from "./FilesTable";
import FilesFilter from "./FilesFilter";
import InfoPanel from "../common/InfoPanel";
import { apps, filesSubItems } from "@/src/utils/constants/navigation";
import { waitForGetItemMetadataResponse } from "./api";

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

  async waitForSharedWithMePage() {
    await expect(this.page).toHaveURL(SHARED_WITH_ME_URL);
    await this.page.waitForLoadState("domcontentloaded");
  }

  // Selects an item and opens its Metadata tab, waiting for the metadata
  // request. The item must not be selected yet - otherwise no request is sent.
  async openItemMetadata(name: string) {
    const metadataLoaded = waitForGetItemMetadataResponse(this.page);
    await this.filesTable.selectRow(name);
    await this.infoPanel.open();
    await this.infoPanel.openTab("Metadata");
    await metadataLoaded;
  }

  async checkEmptyViewVisible() {
    await expect(this.page.getByTestId("empty-view")).toBeVisible();
  }
}

export default SharedWithMe;

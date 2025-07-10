import { Page } from "@playwright/test";
import FilesArticle from "./FilesArticle";
import FilesCreateContextMenu from "./FilesCreateContextMenu";
import FilesNavigation from "./FilesNavigation";
import InfoPanel from "../common/InfoPanel";
import FilesTable from "./FilesTable";
import FilesFilter from "./FilesFilter";
import FilesEmptyView from "./FilesEmptyView";
import Network from "../common/Network";

class MyDocuments {
  private page: Page;
  private portalDomain: string;
  private network: Network;

  filesArticle: FilesArticle;
  filesCreateContextMenu: FilesCreateContextMenu;
  filesNavigation: FilesNavigation;
  filesTable: FilesTable;
  filesFilter: FilesFilter;
  filesEmptyView: FilesEmptyView;

  infoPanel: InfoPanel;

  constructor(page: Page, portalDomain: string) {
    this.page = page;
    this.portalDomain = portalDomain;

    this.infoPanel = new InfoPanel(page);

    this.filesArticle = new FilesArticle(page);
    this.filesCreateContextMenu = new FilesCreateContextMenu(page);
    this.filesNavigation = new FilesNavigation(page);
    this.filesTable = new FilesTable(page);
    this.filesFilter = new FilesFilter(page);
    this.filesEmptyView = new FilesEmptyView(page);
    this.network = Network.getInstance(this.page);
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/rooms/personal`);
    await this.page.waitForLoadState("load");
  }

  async openRecentlyAccessibleTab() {
    await this.page.getByText("Recently accessible via link").click();
  }

  async deleteAllDocs() {
    await this.filesTable.selectAllRows();
    await this.filesNavigation.delete();
    await this.filesEmptyView.checkNoDocsTextExist();
  }
}

export default MyDocuments;

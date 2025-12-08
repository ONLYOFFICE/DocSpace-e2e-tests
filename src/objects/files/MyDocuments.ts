import { expect, Page } from "@playwright/test";
import FilesArticle from "./FilesArticle";
import FilesCreateContextMenu from "./FilesCreateContextMenu";
import FilesNavigation from "./FilesNavigation";
import InfoPanel from "../common/InfoPanel";
import FilesTable from "./FilesTable";
import FilesFilter from "./FilesFilter";
import FilesEmptyView from "./FilesEmptyView";
import BasePage from "../common/BasePage";

class MyDocuments extends BasePage {
  private portalDomain: string;

  filesArticle: FilesArticle;
  filesCreateContextMenu: FilesCreateContextMenu;
  filesNavigation: FilesNavigation;
  filesTable: FilesTable;
  filesFilter: FilesFilter;
  filesEmptyView: FilesEmptyView;

  infoPanel: InfoPanel;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;

    this.infoPanel = new InfoPanel(page);

    this.filesArticle = new FilesArticle(page);
    this.filesCreateContextMenu = new FilesCreateContextMenu(page);
    this.filesNavigation = new FilesNavigation(page);
    this.filesTable = new FilesTable(page);
    this.filesFilter = new FilesFilter(page);
    this.filesEmptyView = new FilesEmptyView(page);
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/rooms/personal`);
    await expect(this.page).toHaveURL(/.*rooms\/personal.*/);
    await this.page.waitForLoadState("load");
  }

  async openRecentlyAccessibleTab() {
    await this.page.getByText("Recently accessible via link").click();
  }

  async deleteAllDocs() {
    await this.filesTable.selectAllRows();
    await this.filesNavigation.delete();
    await this.removeToast("successfully moved to Trash");
    await this.filesEmptyView.checkNoDocsTextExist();
  }

  async renameFile(oldName: string, newName: string) {
    await this.filesTable.openContextMenuForItem(oldName);
    await this.filesTable.contextMenu.clickOption("Rename");
    await this.filesNavigation.modal.checkModalExist();
    await this.filesNavigation.modal.fillCreateTextInput(newName);
    await this.filesNavigation.modal.clickCreateButton();
    await this.filesTable.checkRowExist(newName);
    await this.filesTable.checkRowNotExist(oldName);
  }

  async addToFavorites(itemName: string) {
    await this.filesTable.openContextMenuForItem(itemName);
    await this.filesTable.contextMenu.clickOption("Mark as favorite");
  }
}

export default MyDocuments;

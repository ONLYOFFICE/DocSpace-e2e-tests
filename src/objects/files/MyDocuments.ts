import { expect, Page } from "@playwright/test";
import FilesArticle from "./FilesArticle";
import FilesCreateContextMenu from "./FilesCreateContextMenu";
import FilesNavigation from "./FilesNavigation";
import InfoPanel from "../common/InfoPanel";
import FilesTable from "./FilesTable";
import FilesFilter from "./FilesFilter";
import FilesEmptyView from "./FilesEmptyView";
import BasePage from "../common/BasePage";
import { test } from "@playwright/test";

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

  get checkMyDocuments() {
    return this.page.getByTestId("heading").filter({ hasText: "My documents" });
  }

  checkMyDocumentsExist() {
    return test.step("Check my documents exist", async () => {
      await expect(this.checkMyDocuments).toBeVisible();
    });
  }

  async open() {
    return test.step("Open my documents", async () => {
      await this.navigateToMyDocuments();
      await this.page.waitForLoadState("load");
      await this.checkMyDocumentsExist();
    });
  }

  async openRecentlyAccessibleTab() {
    return test.step("Open recently accessible tab", async () => {
      await this.page.locator("#document_catalog-recent").click();
    });
  }

  async deleteAllDocs() {
    return test.step("Delete all docs", async () => {
      await this.filesTable.selectAllRows();
      await this.filesNavigation.delete();
      await this.removeToast("successfully moved to Trash");
      await this.filesEmptyView.checkNoDocsTextExist();
    });
  }
}

export default MyDocuments;

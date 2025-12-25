import { expect, Page } from "@playwright/test";
import FilesArticle from "./FilesArticle";
import FilesCreateContextMenu from "./FilesCreateContextMenu";
import FilesNavigation from "./FilesNavigation";
import InfoPanel from "../common/InfoPanel";
import FilesTable from "./FilesTable";
import FilesFilter from "./FilesFilter";
import FilesEmptyView from "./FilesEmptyView";
import BasePage from "../common/BasePage";
import DownloadDialog from "./DownloadDialog";
import { ORIGINAL_DOC_EXTENSIONS } from "@/src/constants/downloadFormats";

class MyDocuments extends BasePage {
  private portalDomain: string;

  filesArticle: FilesArticle;
  filesCreateContextMenu: FilesCreateContextMenu;
  filesNavigation: FilesNavigation;
  filesTable: FilesTable;
  filesFilter: FilesFilter;
  filesEmptyView: FilesEmptyView;
  downloadDialog: DownloadDialog;

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
    this.downloadDialog = new DownloadDialog(page);
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

  async downloadOriginalFile(fileName: string, expectedExtension: string) {
    const download = await this.waitForDownload(async () => {
      await this.filesTable.openContextMenuForItem(fileName);
      await this.filesTable.contextMenu.clickSubmenuOption(
        "Download",
        "Original format",
      );
    });

    expect(download.suggestedFilename().toLowerCase()).toContain(
      expectedExtension.toLowerCase(),
    );
    await download.delete();
  }

  async downloadFolderAsArchive(folderName: string) {
    const download = await this.waitForDownload(async () => {
      await this.filesTable.openContextMenuForItem(folderName);
      await this.filesTable.contextMenu.clickOption("Download");
    });

    expect(download.suggestedFilename().toLowerCase()).toContain(".zip");
    await download.delete();
  }

  async downloadFileAs(
    format: string,
    fileName = "Document",
    expectedExtension?: string,
  ) {
    await this.filesTable.openContextMenuForItem(fileName);
    await this.filesTable.contextMenu.clickSubmenuOption(
      "Download",
      "Download as",
    );
    await this.downloadDialog.expectOpen();
    await this.downloadDialog.selectFormat(format);

    const download = await this.waitForDownload(async () => {
      await this.downloadDialog.submitDownload();
    });

    expect(download.suggestedFilename().toLowerCase()).toContain(
      expectedExtension ??
        (format === "Original format"
          ? (ORIGINAL_DOC_EXTENSIONS[fileName] ?? ".docx")
          : format.toLowerCase()),
    );

    await download.delete();
    await this.downloadDialog.close();
  }
}

export default MyDocuments;

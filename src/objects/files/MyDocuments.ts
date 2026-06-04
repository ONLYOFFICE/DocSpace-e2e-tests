import { expect, Page } from "@playwright/test";
import { getPortalUrl } from "../../../config";
import {
  dropFile,
  dropFolder,
  dropFolderWithFiles,
} from "@/src/utils/helpers/dragDrop";
import FilesArticle from "./FilesArticle";
import FilesCreateContextMenu from "./FilesCreateContextMenu";
import FilesNavigation from "./FilesNavigation";
import InfoPanel from "../common/InfoPanel";
import FilesTable from "./FilesTable";
import FilesFilter from "./FilesFilter";
import FilesEmptyView from "./FilesEmptyView";
import BasePage from "../common/BasePage";
import DownloadDialog from "./DownloadDialog";
import FilesSelectPanel from "./FilesSelectPanel";
import FolderDeleteModal from "./FolderDeleteModal";
import ConflictResolveDialog from "./ConflictResolveDialog";
import ConvertDialog from "./ConvertDialog";
import DocumentEditor from "./DocumentEditor";
import SpreadsheetEditor from "./SpreadsheetEditor";
import PresentationEditor from "./PresentationEditor";
import PdfFormEditor from "./PdfFormEditor";
import { ORIGINAL_DOC_EXTENSIONS } from "@/src/constants/downloadFormats";
import {
  DOC_ACTIONS,
  documentContextMenuOption,
  pdfFormMoreOptionsSubmenu,
} from "@/src/utils/constants/files";
import { TRoomCreateTitles } from "@/src/utils/constants/rooms";

const CONTEXT_MENU_ENTERED =
  ".p-contextmenu.p-component.p-contextmenu-enter-done";

class MyDocuments extends BasePage {
  private portalDomain: string;

  filesArticle: FilesArticle;
  filesCreateContextMenu: FilesCreateContextMenu;
  filesNavigation: FilesNavigation;
  filesTable: FilesTable;
  filesFilter: FilesFilter;
  filesEmptyView: FilesEmptyView;
  downloadDialog: DownloadDialog;
  filesSelectPanel: FilesSelectPanel;
  folderDeleteModal: FolderDeleteModal;
  conflictResolveDialog: ConflictResolveDialog;
  convertDialog: ConvertDialog;

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
    this.filesSelectPanel = new FilesSelectPanel(page);
    this.folderDeleteModal = new FolderDeleteModal(page);
    this.conflictResolveDialog = new ConflictResolveDialog(page);
    this.convertDialog = new ConvertDialog(page);
  }

  async open() {
    await this.page.goto(`${getPortalUrl(this.portalDomain)}/rooms/personal`);
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

  // "Ask AI" appears in the file context menu when at least one AI agent exists.
  async clickAskAi(fileName: string) {
    await this.filesTable.openContextMenuForItem(fileName, true);
    await this.filesTable.contextMenu.clickOption(
      documentContextMenuOption.askAi,
    );
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

  async createDocumentFile(fileName = "Document", checkExists = true) {
    await expect(async () => {
      await this.filesNavigation.openCreateDropdown();
      await this.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_DOCUMENT,
      );
      await this.filesNavigation.modal.checkModalExist();
    }).toPass({ timeout: 20000 });
    await this.filesNavigation.modal.fillCreateTextInput(fileName);
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 5000 }),
      this.filesNavigation.modal.clickCreateButton(),
    ]).catch(() => [null]);
    await newPage?.close();
    if (checkExists) {
      await this.filesTable.checkRowExist(fileName);
    }
  }

  async openDocumentInEditor(fileName: string): Promise<DocumentEditor> {
    await this.filesTable.openContextMenuForItem(fileName, true);
    const [editorPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 30000 }),
      this.filesTable.contextMenu.clickOption(documentContextMenuOption.edit),
    ]);
    return new DocumentEditor(editorPage);
  }

  async openDocumentInSameTab(fileName: string): Promise<DocumentEditor> {
    await this.filesTable.openContextMenuForItem(fileName, true);
    await this.filesTable.contextMenu.clickOption(
      documentContextMenuOption.edit,
    );
    await this.page.waitForURL(/doceditor/, {
      waitUntil: "load",
      timeout: 30000,
    });
    const editor = new DocumentEditor(this.page);
    await editor.waitForLoad();
    return editor;
  }

  async openSpreadsheetInSameTab(fileName: string): Promise<SpreadsheetEditor> {
    await this.filesTable.openContextMenuForItem(fileName, true);
    await this.filesTable.contextMenu.clickOption(
      documentContextMenuOption.edit,
    );
    await this.page.waitForURL(/doceditor/, {
      waitUntil: "load",
      timeout: 30000,
    });
    const editor = new SpreadsheetEditor(this.page);
    await editor.waitForLoad();
    return editor;
  }

  async openPresentationInSameTab(
    fileName: string,
  ): Promise<PresentationEditor> {
    await this.filesTable.openContextMenuForItem(fileName, true);
    await this.filesTable.contextMenu.clickOption(
      documentContextMenuOption.edit,
    );
    await this.page.waitForURL(/doceditor/, {
      waitUntil: "load",
      timeout: 30000,
    });
    const editor = new PresentationEditor(this.page);
    await editor.waitForLoad();
    return editor;
  }

  async createDocumentAndOpenEditor(fileName = "Document") {
    await expect(async () => {
      await this.filesNavigation.openCreateDropdown();
      await this.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_DOCUMENT,
      );
      await this.filesNavigation.modal.checkModalExist();
    }).toPass({ timeout: 20000 });
    await this.filesNavigation.modal.fillCreateTextInput(fileName);
    const [editorPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 30000 }),
      this.filesNavigation.modal.clickCreateButton(),
    ]);
    await editorPage.waitForLoadState("load");
    return new DocumentEditor(editorPage);
  }

  async createDocumentAndOpenEditorInSameTab(fileName = "Document") {
    await expect(async () => {
      await this.filesNavigation.openCreateDropdown();
      await this.page
        .locator(CONTEXT_MENU_ENTERED)
        .waitFor({ state: "visible" });
      await this.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_DOCUMENT,
      );
      await this.filesNavigation.modal.checkModalExist();
    }).toPass({ timeout: 20000 });
    await this.filesNavigation.modal.fillCreateTextInput(fileName);
    await this.filesNavigation.modal.clickCreateButton();
    await this.page.waitForURL(/doceditor/, {
      waitUntil: "load",
      timeout: 30000,
    });
    const editor = new DocumentEditor(this.page);
    await editor.waitForLoad();
    return editor;
  }

  async createSpreadsheetAndOpenEditorInSameTab(fileName = "Spreadsheet") {
    await expect(async () => {
      await this.filesNavigation.openCreateDropdown();
      await this.page
        .locator(CONTEXT_MENU_ENTERED)
        .waitFor({ state: "visible" });
      await this.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_SPREADSHEET,
      );
      await this.filesNavigation.modal.checkModalExist();
    }).toPass({ timeout: 20000 });
    await this.filesNavigation.modal.fillCreateTextInput(fileName);
    await this.filesNavigation.modal.clickCreateButton();
    await this.page.waitForURL(/doceditor/, {
      waitUntil: "load",
      timeout: 30000,
    });
    const editor = new SpreadsheetEditor(this.page);
    await editor.waitForLoad();
    return editor;
  }

  async createPresentationAndOpenEditorInSameTab(fileName = "Presentation") {
    await expect(async () => {
      await this.filesNavigation.openCreateDropdown();
      await this.page
        .locator(CONTEXT_MENU_ENTERED)
        .waitFor({ state: "visible" });
      await this.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_PRESENTATION,
      );
      await this.filesNavigation.modal.checkModalExist();
    }).toPass({ timeout: 20000 });
    await this.filesNavigation.modal.fillCreateTextInput(fileName);
    await this.filesNavigation.modal.clickCreateButton();
    await this.page.waitForURL(/doceditor/, {
      waitUntil: "load",
      timeout: 30000,
    });
    const editor = new PresentationEditor(this.page);
    await editor.waitForLoad();
    return editor;
  }

  async createPdfFormAndOpenEditorInSameTab(fileName = "PDF Form") {
    await expect(async () => {
      await this.filesNavigation.openCreateDropdown();
      await this.page
        .locator(CONTEXT_MENU_ENTERED)
        .waitFor({ state: "visible" });
      await this.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_PDF_BLANK,
      );
      await this.filesNavigation.modal.checkModalExist();
    }).toPass({ timeout: 20000 });
    await this.filesNavigation.modal.fillCreateTextInput(fileName);
    await this.filesNavigation.modal.clickCreateButton();
    await this.page.waitForURL(/doceditor/, {
      waitUntil: "load",
      timeout: 30000,
    });
    const editor = new PdfFormEditor(this.page);
    await editor.waitForLoad();
    return editor;
  }

  async openPdfFormInSameTab(fileName: string): Promise<PdfFormEditor> {
    await this.filesTable.openContextMenuForItem(fileName, true);
    await this.filesTable.contextMenu.clickOption(
      documentContextMenuOption.edit,
    );
    await this.page.waitForURL(/doceditor/, {
      waitUntil: "load",
      timeout: 30000,
    });
    const editor = new PdfFormEditor(this.page);
    await editor.waitForLoad();
    return editor;
  }

  async createSpreadsheetAndOpenEditor(fileName = "Spreadsheet") {
    await expect(async () => {
      await this.filesNavigation.openCreateDropdown();
      await this.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_SPREADSHEET,
      );
      await this.filesNavigation.modal.checkModalExist();
    }).toPass({ timeout: 20000 });
    await this.filesNavigation.modal.fillCreateTextInput(fileName);
    const [editorPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 30000 }),
      this.filesNavigation.modal.clickCreateButton(),
    ]);
    await editorPage.waitForLoadState("load");
    return new SpreadsheetEditor(editorPage);
  }

  async createPresentationAndOpenEditor(fileName = "Presentation") {
    await expect(async () => {
      await this.filesNavigation.openCreateDropdown();
      await this.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_PRESENTATION,
      );
      await this.filesNavigation.modal.checkModalExist();
    }).toPass({ timeout: 20000 });
    await this.filesNavigation.modal.fillCreateTextInput(fileName);
    const [editorPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 30000 }),
      this.filesNavigation.modal.clickCreateButton(),
    ]);
    await editorPage.waitForLoadState("load");
    return new PresentationEditor(editorPage);
  }

  async createPdfFormAndOpenEditor(fileName = "PDF Form") {
    await expect(async () => {
      await this.filesNavigation.openCreateDropdown();
      await this.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_PDF_BLANK,
      );
      await this.filesNavigation.modal.checkModalExist();
    }).toPass({ timeout: 20000 });
    await this.filesNavigation.modal.fillCreateTextInput(fileName);
    const [editorPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 30000 }),
      this.filesNavigation.modal.clickCreateButton(),
    ]);
    await editorPage.waitForLoadState("load");
    return new PdfFormEditor(editorPage);
  }

  /**
   * Opens a file via the "Preview" context menu option. DocSpace opens the
   * editor in a new tab, so this method returns the new Page. Set up
   * console capture on the returned page immediately to avoid missing the
   * "opened in mode view" message emitted during editor initialisation.
   */
  async openFileViaPreview(fileName: string): Promise<Page> {
    await this.filesTable.openContextMenuForItem(fileName, true);
    const [editorPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 30000 }),
      this.filesTable.contextMenu.clickOption(
        documentContextMenuOption.preview,
      ),
    ]);
    // bringToFront ensures the tab is active so the editor initialises correctly
    // (avoids the background-tab throttling described in Bug 81446 without reload)
    await editorPage.bringToFront();
    await editorPage.waitForLoadState("load");
    return editorPage;
  }

  async uploadAndVerifyConversion(filePath: string, fileName: string) {
    await this.filesNavigation.uploadFiles(filePath);
    await this.convertDialog.checkDialogVisible();
    await this.convertDialog.confirm();
    await expect(await this.filesTable.getRowByTitle(fileName)).toHaveCount(2);
  }

  async openVersionHistory(fileName: string) {
    await this.filesTable.openContextMenuForItem(fileName);
    await this.filesTable.contextMenu.clickSubmenuOption(
      documentContextMenuOption.moreOptions,
      pdfFormMoreOptionsSubmenu.showVersionHistory,
    );
  }

  async deleteFile(fileName: string) {
    await this.filesTable.openContextMenuForItem(fileName);
    await this.filesTable.contextMenu.clickOption("Delete");
    await this.folderDeleteModal.clickDeleteFolder();
    await this.removeToast("successfully moved to Trash");
    await this.filesTable.checkRowNotExist(fileName);
  }

  async moveFileTo(fileName: string, folderName: string) {
    await this.filesTable.openContextMenuForItem(fileName);
    await this.filesTable.contextMenu.clickSubmenuOption(
      "Move or copy",
      "Move to",
    );
    await this.filesSelectPanel.checkFileSelectPanelExist();
    await this.filesSelectPanel.selectItemByText(folderName);
    await this.filesSelectPanel.confirmSelection();
    await this.filesTable.checkRowNotExist(fileName);
  }

  async copyFileTo(fileName: string, folderName: string) {
    await this.filesTable.openContextMenuForItem(fileName);
    await this.filesTable.contextMenu.clickSubmenuOption(
      "Move or copy",
      "Copy",
    );
    await this.filesSelectPanel.checkFileSelectPanelExist();
    await this.filesSelectPanel.selectItemByText(folderName);
    await this.filesSelectPanel.confirmSelection();
    await this.filesTable.checkRowExist(fileName);
  }

  async duplicateFile(fileName: string) {
    await this.filesTable.openContextMenuForItem(fileName);
    await this.filesTable.contextMenu.clickSubmenuOption("Move or copy", {
      type: "data-testid",
      value: "option_create-duplicate",
    });
    await this.filesTable.checkRowExist(`${fileName} (1)`);
  }

  async moveFileToNewRoom(
    fileName: string,
    roomType: TRoomCreateTitles,
    roomName: string,
  ) {
    await this.filesTable.openContextMenuForItem(fileName);
    await this.filesTable.contextMenu.clickSubmenuOption(
      "Move or copy",
      "Move to",
    );
    await this.filesSelectPanel.checkFileSelectPanelExist();
    await this.filesSelectPanel.gotoDocSpaceRoot();
    await this.filesSelectPanel.select("rooms");
    await this.filesSelectPanel.createNewItem();
    await this.filesSelectPanel.selectRoomTypeFromDropdown(roomType);
    await this.filesSelectPanel.fillNewItemName(roomName);
    await this.filesSelectPanel.acceptCreate();
    await this.filesSelectPanel.selectItemByText(roomName);
  }

  async bulkDeleteFiles(fileNames: string[]) {
    await this.filesTable.selectMultipleRows(fileNames);
    await this.filesNavigation.delete();
    await this.removeToast("successfully moved to Trash");
    for (const fileName of fileNames) {
      await this.filesTable.checkRowNotExist(fileName);
    }
  }

  async bulkMoveTo(fileNames: string[], folderName: string) {
    await this.filesTable.selectMultipleRows(fileNames);
    await this.filesNavigation.bulkMoveTo();
    await this.filesSelectPanel.checkFileSelectPanelExist();
    await this.filesSelectPanel.selectItemByText(folderName);
    await this.filesSelectPanel.confirmSelection();
    for (const fileName of fileNames) {
      await this.filesTable.checkRowNotExist(fileName);
    }
  }

  async bulkCopyTo(fileNames: string[], folderName: string) {
    await this.filesTable.selectMultipleRows(fileNames);
    await this.filesNavigation.bulkCopy();
    await this.filesSelectPanel.checkFileSelectPanelExist();
    await this.filesSelectPanel.selectItemByText(folderName);
    await this.filesSelectPanel.confirmSelection();
    for (const fileName of fileNames) {
      await this.filesTable.checkRowExist(fileName);
    }
  }

  async bulkDownload(fileNames: string[]) {
    const download = await this.waitForDownload(async () => {
      await this.filesTable.selectMultipleRows(fileNames);
      await this.filesNavigation.bulkDownload();
    });
    expect(download.suggestedFilename().toLowerCase()).toContain(".zip");
    await download.delete();
  }

  async confirmMoveToPublicRoom() {
    await this.page.getByRole("button", { name: "OK" }).click();
  }

  async uploadFileByDragAndDrop(filePath: string) {
    await dropFile(this.page, filePath);
  }

  async uploadFolderByDragAndDrop(folderName: string) {
    await dropFolder(this.page, folderName);
  }

  async uploadFolderWithFilesByDragAndDrop(folderPath: string) {
    await dropFolderWithFiles(this.page, folderPath);
    await this.page.goto(`${getPortalUrl(this.portalDomain)}/rooms/personal`);
    await this.page.waitForLoadState("load");
  }
}

export default MyDocuments;

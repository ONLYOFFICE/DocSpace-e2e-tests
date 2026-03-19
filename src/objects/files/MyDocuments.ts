import { expect, Page } from "@playwright/test";
import path from "path";
import fs from "fs";
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
import DocumentEditor from "./DocumentEditor";
import SpreadsheetEditor from "./SpreadsheetEditor";
import PresentationEditor from "./PresentationEditor";
import PdfFormEditor from "./PdfFormEditor";
import { ORIGINAL_DOC_EXTENSIONS } from "@/src/constants/downloadFormats";
import { DOC_ACTIONS } from "@/src/utils/constants/files";
import { TRoomCreateTitles } from "@/src/utils/constants/rooms";

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

  async createDocumentFile(fileName = "Document") {
    await this.filesNavigation.openCreateDropdown();
    await this.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_DOCUMENT);
    await this.filesNavigation.modal.fillCreateTextInput(fileName);
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 5000 }),
      this.filesNavigation.modal.clickCreateButton(),
    ]).catch(() => [null]);
    await newPage?.close();
    await this.filesTable.checkRowExist(fileName);
  }

  async createDocumentAndOpenEditor(fileName = "Document") {
    await this.filesNavigation.openCreateDropdown();
    await this.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_DOCUMENT);
    await this.filesNavigation.modal.fillCreateTextInput(fileName);
    const [editorPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 30000 }),
      this.filesNavigation.modal.clickCreateButton(),
    ]);
    await editorPage.waitForLoadState("load");
    return new DocumentEditor(editorPage);
  }

  async createSpreadsheetAndOpenEditor(fileName = "Spreadsheet") {
    await this.filesNavigation.openCreateDropdown();
    await this.filesNavigation.selectCreateAction(
      DOC_ACTIONS.CREATE_SPREADSHEET,
    );
    await this.filesNavigation.modal.fillCreateTextInput(fileName);
    const [editorPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 30000 }),
      this.filesNavigation.modal.clickCreateButton(),
    ]);
    await editorPage.waitForLoadState("load");
    return new SpreadsheetEditor(editorPage);
  }

  async createPresentationAndOpenEditor(fileName = "Presentation") {
    await this.filesNavigation.openCreateDropdown();
    await this.filesNavigation.selectCreateAction(
      DOC_ACTIONS.CREATE_PRESENTATION,
    );
    await this.filesNavigation.modal.fillCreateTextInput(fileName);
    const [editorPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 30000 }),
      this.filesNavigation.modal.clickCreateButton(),
    ]);
    await editorPage.waitForLoadState("load");
    return new PresentationEditor(editorPage);
  }

  async createPdfFormAndOpenEditor(fileName = "PDF Form") {
    await this.filesNavigation.openCreateDropdown();
    await this.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_PDF_BLANK);
    await this.filesNavigation.modal.fillCreateTextInput(fileName);
    const [editorPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 30000 }),
      this.filesNavigation.modal.clickCreateButton(),
    ]);
    await editorPage.waitForLoadState("load");
    return new PdfFormEditor(editorPage);
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
    const resolvedPath = path.resolve(process.cwd(), filePath);
    const buffer = fs.readFileSync(resolvedPath);
    const fileName = path.basename(resolvedPath);

    await this.waitForDragDropZone();

    const dispatchEvent = async (type: string) => {
      await this.page.evaluate(
        ({ buffer, fileName, type }) => {
          const dz = document.querySelector(".drag-and-drop");
          if (!dz) throw new Error("Drop zone (.drag-and-drop) not found");
          const dt = new DataTransfer();
          dt.items.add(
            new File([new Uint8Array(buffer)], fileName, {
              type: "application/octet-stream",
            }),
          );
          const event = new DragEvent(type, {
            bubbles: true,
            cancelable: true,
          });
          Object.defineProperty(event, "dataTransfer", { value: dt });
          dz.dispatchEvent(event);
        },
        { buffer: [...buffer], fileName, type },
      );
    };

    await dispatchEvent("dragenter");
    await dispatchEvent("dragover");
    await this.waitForThirdPartyCapabilities();
    await dispatchEvent("drop");
  }

  async uploadFolderByDragAndDrop(folderName: string) {
    await this.waitForDragDropZone();

    await this.page.evaluate((name) => {
      const orig = DataTransferItem.prototype.webkitGetAsEntry;
      const g = globalThis as unknown as Record<string, unknown>;
      g.__origWebkitGetAsEntry = orig;
      DataTransferItem.prototype.webkitGetAsEntry = function () {
        if (!this.getAsFile()) return orig.call(this);
        return {
          isFile: false,
          isDirectory: true,
          name,
          fullPath: "/" + name,
          filesystem: null,
          createReader: () => ({
            readEntries: (cb: (entries: FileSystemEntry[]) => void) => cb([]),
          }),
        } as unknown as FileSystemDirectoryEntry;
      };
    }, folderName);

    const dispatchEvent = async (type: string) => {
      await this.page.evaluate(
        ({ folderName, type }) => {
          const dz = document.querySelector(".drag-and-drop");
          if (!dz) throw new Error("Drop zone (.drag-and-drop) not found");
          const dt = new DataTransfer();
          dt.items.add(new File([], folderName));
          const event = new DragEvent(type, {
            bubbles: true,
            cancelable: true,
          });
          Object.defineProperty(event, "dataTransfer", { value: dt });
          dz.dispatchEvent(event);
        },
        { folderName, type },
      );
    };

    await dispatchEvent("dragenter");
    await dispatchEvent("dragover");
    await this.waitForThirdPartyCapabilities();
    await dispatchEvent("drop");
    await this.restoreWebkitEntryMock();
  }

  async uploadFolderWithFilesByDragAndDrop(folderPath: string) {
    const resolvedPath = path.resolve(process.cwd(), folderPath);
    const folderName = path.basename(resolvedPath);
    const fileEntries = fs.readdirSync(resolvedPath).map((name) => ({
      name,
      buffer: [...fs.readFileSync(path.join(resolvedPath, name))],
    }));

    await this.waitForDragDropZone();

    await this.page.evaluate(
      ({ folderName, fileEntries }) => {
        const orig = DataTransferItem.prototype.webkitGetAsEntry;
        const g = globalThis as unknown as Record<string, unknown>;
        g.__origWebkitGetAsEntry = orig;
        DataTransferItem.prototype.webkitGetAsEntry = function () {
          if (!this.getAsFile()) return orig.call(this);
          const children = fileEntries.map(({ name, buffer }) => ({
            isFile: true,
            isDirectory: false,
            name,
            fullPath: `/${folderName}/${name}`,
            filesystem: null,
            file: (cb: (f: File) => void) =>
              cb(new File([new Uint8Array(buffer)], name)),
          }));
          return {
            isFile: false,
            isDirectory: true,
            name: folderName,
            fullPath: "/" + folderName,
            filesystem: null,
            createReader: () => {
              let served = false;
              return {
                readEntries: (cb: (entries: FileSystemEntry[]) => void) => {
                  if (!served) {
                    served = true;
                    cb(children as unknown as FileSystemEntry[]);
                  } else {
                    cb([]);
                  }
                },
              };
            },
          } as unknown as FileSystemDirectoryEntry;
        };
      },
      { folderName, fileEntries },
    );

    const dispatchEvent = async (type: string) => {
      await this.page.evaluate(
        ({ folderName, type }) => {
          const dz = document.querySelector(".drag-and-drop");
          if (!dz) throw new Error("Drop zone (.drag-and-drop) not found");
          const dt = new DataTransfer();
          dt.items.add(new File([], folderName));
          const event = new DragEvent(type, {
            bubbles: true,
            cancelable: true,
          });
          Object.defineProperty(event, "dataTransfer", { value: dt });
          dz.dispatchEvent(event);
        },
        { folderName, type },
      );
    };

    await dispatchEvent("dragenter");
    await dispatchEvent("dragover");
    await this.waitForThirdPartyCapabilities();
    await dispatchEvent("drop");
    await this.restoreWebkitEntryMock();

    await this.page.waitForResponse(
      (r) => r.url().includes("finalize") && r.status() === 201,
      { timeout: 30000 },
    );
    await this.page.goto(`https://${this.portalDomain}/rooms/personal`);
    await this.page.waitForLoadState("load");
  }

  private async waitForDragDropZone() {
    await this.page
      .locator(".drag-and-drop")
      .waitFor({ state: "attached", timeout: 10000 });
  }

  private async waitForThirdPartyCapabilities() {
    await this.page.waitForResponse(
      (r) =>
        r.url().includes("/files/thirdparty/capabilities") &&
        r.status() === 200,
      { timeout: 15000 },
    );
  }

  private async restoreWebkitEntryMock() {
    await this.page.evaluate(() => {
      const w = globalThis as unknown as Record<string, unknown>;
      DataTransferItem.prototype.webkitGetAsEntry =
        w.__origWebkitGetAsEntry as typeof DataTransferItem.prototype.webkitGetAsEntry;
      delete w.__origWebkitGetAsEntry;
    });
  }
}

export default MyDocuments;

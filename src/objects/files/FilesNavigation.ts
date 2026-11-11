import { Page, Request, Route } from "@playwright/test";
import fs from "fs";
import { DOC_ACTIONS, listDocActions } from "../../utils/constants/files";
import FilesCreateModal from "./FilesCreateModal";
import BaseNavigation from "../common/BaseNavigation";
import FilesCreateContextMenu from "./FilesCreateContextMenu";

// Chunk upload: POST api/2.0/files/{folderId}/session/{sessionId}/upload?chunkNumber=N
const CHUNK_UPLOAD_URL = /\/api\/2\.0\/files\/\d+\/session\/[^/]+\/upload/;
const UPLOAD_FINISHED_TIMEOUT = 30000;

const navActions = {
  moveToArchive: {
    button: "#menu-archive",
    submit: "#shared_move-to-archived-modal_submit",
  },
  delete: {
    button: "#menu-delete",
    submit: "#delete-file-modal_submit",
  },
  bulkMoveTo: {
    button: "[data-testid='table_group_menu_item_menu-move-to']",
  },
  bulkCopy: {
    button: "[data-testid='table_group_menu_item_menu-copy']",
  },
  bulkDownload: {
    button: "[data-testid='table_group_menu_item_menu-download']",
  },
} as const;

class FilesNavigation extends BaseNavigation {
  contextMenu: FilesCreateContextMenu;
  modal: FilesCreateModal;

  constructor(page: Page) {
    super(page, navActions);
    this.contextMenu = new FilesCreateContextMenu(page);
    this.modal = new FilesCreateModal(page);
  }

  async validateCreateFileModal(actionText: string) {
    const modalTitle =
      actionText === DOC_ACTIONS.CREATE_PDF_BLANK
        ? DOC_ACTIONS.CREATE_PDF_FORM
        : actionText;

    await this.modal.checkModalExist();
    await this.modal.checkModalTitleExist(modalTitle);
    await this.modal.closeModalByClickOutside();
  }

  async openAndValidateFileCreateModals() {
    for (const actionText of listDocActions) {
      await this.openCreateDropdown();
      await this.contextMenu.selectCreateAction(actionText);
      await this.validateCreateFileModal(actionText);
    }
  }

  async delete() {
    await this.performAction(navActions.delete);
  }

  // Only clicks Delete in the group menu - the dialog stays open
  async openDeleteDialog() {
    await this.performAction({ button: navActions.delete.button });
  }

  async bulkMoveTo() {
    await this.performAction(navActions.bulkMoveTo);
  }

  async bulkCopy() {
    await this.performAction(navActions.bulkCopy);
  }

  async bulkDownload() {
    await this.performAction(navActions.bulkDownload);
  }

  async selectCreateAction(actionText: string) {
    await this.contextMenu.selectCreateAction(actionText);
  }

  async uploadFiles(filePaths: string | string[]) {
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    await this.openCreateDropdown();
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      this.contextMenu.clickOption({
        type: "data-testid",
        value: "upload-files",
      }),
    ]);
    await fileChooser.setFiles(paths);
  }

  // Uploads the content of one file under several names, as separate files
  async uploadFileAs(filePath: string, fileNames: string[]) {
    const buffer = fs.readFileSync(filePath);
    await this.openCreateDropdown();
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      this.contextMenu.clickOption({
        type: "data-testid",
        value: "upload-files",
      }),
    ]);
    await fileChooser.setFiles(
      fileNames.map((name) => ({
        name,
        mimeType: "application/octet-stream",
        buffer,
      })),
    );
  }

  // Same as uploadFileAs, but the chunk upload response is held back: the
  // server has already saved the file and sent the socket event, so the
  // client gets the event before its upload request finishes.
  // Resolves once the held chunk response has been delivered to the client.
  async uploadFileAsWithSocketFirst(
    filePath: string,
    fileNames: string[],
    delayMs = 3000,
  ) {
    const isChunkUpload = (request: Request) =>
      request.method() === "POST" && CHUNK_UPLOAD_URL.test(request.url());

    const holdResponse = async (route: Route) => {
      if (!isChunkUpload(route.request())) {
        await route.fallback();
        return;
      }
      const response = await route.fetch();
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      await route.fulfill({ response });
    };

    // Page-level route: it is registered after the fixture's page route, so it
    // runs first (a context route would never be reached)
    await this.page.route(CHUNK_UPLOAD_URL, holdResponse);
    try {
      const uploadFinished = this.page.waitForEvent("response", {
        predicate: (response) => isChunkUpload(response.request()),
        timeout: UPLOAD_FINISHED_TIMEOUT,
      });
      await this.uploadFileAs(filePath, fileNames);
      await uploadFinished;
    } finally {
      // Ignore errors: the page may already be closed on test timeout
      await this.page.unroute(CHUNK_UPLOAD_URL, holdResponse).catch(() => {});
    }
  }

  // Uploads in-memory files of the given size - for uploads that must still
  // be running when the next step starts (no large files in data/).
  async uploadGeneratedFiles(fileNames: string[], sizeInBytes: number) {
    const buffer = Buffer.alloc(sizeInBytes, "a");
    await this.openCreateDropdown();
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      this.contextMenu.clickOption({
        type: "data-testid",
        value: "upload-files",
      }),
    ]);
    await fileChooser.setFiles(
      fileNames.map((name) => ({
        name,
        mimeType: "text/plain",
        buffer,
      })),
    );
  }

  async uploadFolder(folderPath: string) {
    await this.openCreateDropdown();
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      this.contextMenu.clickOption({
        type: "data-testid",
        value: "upload-folder",
      }),
    ]);
    await fileChooser.setFiles(folderPath);
  }
}

export default FilesNavigation;

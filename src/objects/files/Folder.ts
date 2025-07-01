import { expect, Page } from "@playwright/test";
import FilesNavigation from "./FilesNavigation";
import FilesTable from "./FilesTable";
import FolderShareModal from "./FolderShareModal";
import FolderDeleteModal from "./FolderDeleteModal";

export default class Folder {
  readonly filesNavigation: FilesNavigation;
  readonly filesTable: FilesTable;
  readonly folderShareModal: FolderShareModal;
  readonly folderDeleteModal: FolderDeleteModal;

  constructor(
    public page: Page,
    public portalDomain: string,
  ) {
    this.filesNavigation   = new FilesNavigation(page);
    this.filesTable        = new FilesTable(page);
    this.folderShareModal  = new FolderShareModal(page);
    this.folderDeleteModal = new FolderDeleteModal(page);
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/rooms/personal`);
    await this.page.waitForLoadState("load");
    await expect(this.page).toHaveURL(/.*rooms\/personal.*/);
  }

  async expectFolderVisible(name: string) {
    const locator = this.page.getByText(name, { exact: true });
    await expect(locator).toBeVisible();
  }

  async expectFolderNotVisible(name: string) {
    const locator = this.page.getByText(name, { exact: true });
    await locator.waitFor({ state: "detached", timeout: 10_000 });
  }

  async expectFolderRenamed(oldName: string, newName: string) {
    await this.expectFolderNotVisible(oldName);
    await this.expectFolderVisible(newName);
  }
}

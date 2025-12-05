import { expect, Page } from "@playwright/test";
import FilesNavigation from "./FilesNavigation";
import FilesTable from "./FilesTable";
import FolderShareModal from "./FolderShareModal";
import FolderDeleteModal from "./FolderDeleteModal";
import FilesSelectPanel from "./FilesSelectPanel";
import InfoPanel from "../common/InfoPanel";
import RoomsCreateDialog from "@/src/objects/rooms/RoomsCreateDialog";
import { waitForCreateRoomResponse } from "@/src/objects/rooms/api";
import { TRoomCreateTitles } from "@/src/utils/constants/rooms";
import { DOC_ACTIONS } from "@/src/utils/constants/files";
import BasePage from "../common/BasePage";
class Folder extends BasePage {
  private portalDomain: string;

  filesNavigation: FilesNavigation;
  filesTable: FilesTable;
  folderShareModal: FolderShareModal;
  folderDeleteModal: FolderDeleteModal;
  roomsCreateDialog: RoomsCreateDialog;
  filesSelectPanel: FilesSelectPanel;
  infoPanel: InfoPanel;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;

    this.filesNavigation = new FilesNavigation(page);
    this.filesTable = new FilesTable(page);
    this.folderShareModal = new FolderShareModal(page);
    this.folderDeleteModal = new FolderDeleteModal(page);
    this.roomsCreateDialog = new RoomsCreateDialog(page);
    this.filesSelectPanel = new FilesSelectPanel(page);
    this.infoPanel = new InfoPanel(page);
  }

  async open() {
    await this.page.goto(`https://${this.portalDomain}/rooms/personal`, {
      waitUntil: "load",
    });
    await expect(this.page).toHaveURL(/.*rooms\/personal.*/);
    const addButton = this.page.locator("#header_add-button");
    await expect(addButton).toBeVisible();
  }

  async expectFolderVisible(name: string) {
    const locator = this.page.getByText(name, { exact: true });
    await expect(locator).toBeVisible();
  }

  async expectFolderNotVisible(name: string) {
    const row = await this.filesTable.getRowByTitle(name);
    await expect(row).toHaveCount(0, { timeout: 10_000 });
  }

  async expectFolderRenamed(oldName: string, newName: string) {
    await this.expectFolderNotVisible(oldName);
    await this.expectFolderVisible(newName);
  }

  async createRoomFromFolder(roomType: TRoomCreateTitles, roomName?: string) {
    await this.roomsCreateDialog.openRoomType(roomType);
    if (roomName) {
      await this.roomsCreateDialog.fillRoomName(roomName);
    }
    await this.roomsCreateDialog.clickRoomDialogSubmit();
  }

  async createRoomFromFolderAndWait(
    roomType: TRoomCreateTitles,
    roomName?: string,
  ) {
    const createRoomRequest = waitForCreateRoomResponse(this.page);

    await this.createRoomFromFolder(roomType, roomName);
    await createRoomRequest;
  }

  async createNew(name: string) {
    await this.filesNavigation.openCreateDropdown();
    await this.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_FOLDER);
    await this.filesNavigation.modal.checkModalExist();
    await this.filesNavigation.modal.fillCreateTextInput(name);
    await this.filesNavigation.modal.clickCreateButton();
    await this.expectFolderVisible(name);
  }
}

export default Folder;

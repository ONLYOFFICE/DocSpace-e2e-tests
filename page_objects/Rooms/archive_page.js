export class ArchivePage {
  constructor(page) {
    this.page = page;
    this.archiveListSelector = "div[id='document_catalog-archive']";
    this.roomTitleSelector = (title) => `div[data-title='${title}']`;
    this.contextMenuButtonSelector = (title) =>
      `div[data-title='${title}'] div[data-testid='context-menu-button']`;
    // context menu buttons
    this.selectArchiveSelector = "li[id='option_select']";
    this.openArchiveButtonSelector = "li[id='option_open']";
    this.infoArchiveButtonSelector = "li[id='option_room-info']";
    this.downloadArchiveButtonSelector = "li[id='option_download']";
    this.unarchiveArchiveButtonSelector = "li[id='option_unarchive-room']";
    this.roomMoveArchiveSelector = "li[id='option_archive-room']";
    this.deleteArchiveButtonSelector = "li[id='option_delete']";
    this.deleteButtonSelector = 'button[id="delete-file-modal_submit"]';
    this.restoreButtonSelector = 'button[id="restore-all_submit"]';
  }

  async downloadRoom(roomTitle) {
    const download1Promise = page.waitForEvent("download");
    await this.page.click(this.downloadArchiveButtonSelector);
    const download1 = await download1Promise;
  }

  // Open the archive rooms list
  async openArchiveList() {
    await this.page.click(this.archiveListSelector);
  }
  // Open the context menu for a specific room
  async openRoomContextMenu(roomTitle) {
    await this.page.click(this.contextMenuButtonSelector(roomTitle));
  }

  async deleteRoom(roomTitle) {
    await this.openRoomContextMenu(roomTitle);
    await this.page.click(this.deleteArchiveButtonSelector);
    await this.page.click(this.deleteButtonSelector); // Confirmation of room deletion
  }

  async unarchiveRoom(roomTitle) {
    await this.openRoomContextMenu(roomTitle);
    await this.page.click(this.unarchiveArchiveButtonSelector);
    await this.page.click(this.restoreButtonSelector);
  }
}

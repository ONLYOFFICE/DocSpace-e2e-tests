export class RoomsListPage {
  constructor(page) {
    this.page = page;
    this.roomsListSelector = "div[id='document_catalog-shared']";
    this.roomTitleSelector = (title) => `div[data-title='${title}']`;
    this.contextMenuButtonSelector = (title) =>
      `div[data-title='${title}'] div[data-testid='context-menu-button']`;
    this.editRoomButtonSelector = "li[id='option_edit-room']";
    this.roomNameInputSelector = "input[id='shared_room-name']";
  }

  // Open the rooms list
  async openRoomsList() {
    await this.page.click(this.roomsListSelector);
  }

  // Open the context menu for a specific room
  async openRoomContextMenu(roomTitle) {
    await this.page.click(this.contextMenuButtonSelector(roomTitle));
  }

  async renameRoom(currentTitle, newTitle) {
    await this.openRoomContextMenu(currentTitle);
    await this.page.click(this.editRoomButtonSelector);
    await this.page.fill(this.roomNameInputSelector, newTitle);
    await this.page.press(this.roomNameInputSelector, "Enter");
  }

  async isRoomVisible(roomTitle) {
    await this.page.waitForSelector(this.roomTitleSelector(roomTitle));
    return true;
  }
}

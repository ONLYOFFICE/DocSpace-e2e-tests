export class RoomsListPage {
  constructor(page) {
    this.page = page;
    this.roomsListSelector = "div[id='document_catalog-shared']";
    this.roomTitleSelector = (title) => `div[data-title='${title}']`;
    this.contextMenuButtonSelector = (title) =>
      `div[data-title='${title}'] div[data-testid='context-menu-button']`;
    // edit room selectors
    this.editRoomButtonSelector = "li[id='option_edit-room']"; // Edit room button
    this.roomNameInputSelector = "input[id='shared_room-name']"; // Room name input
    this.roomTagsInputSelector = "input[id='shared_tags-input']"; // Room tags input
    this.saveButton = "button[type='button'][data-testid='button']"; // Save button

    this.roomIconInput = page.locator('input[type="file"]');
    this.uploadPicture = "[data-event='click focus']"; // Upload picture button
    this.boxSelector = "div[data-testid='box']"; // Upload picture button

    // archive room selectors
    this.roomMoveArchiveSelector = "li[id='option_archive-room']";  // Move to archive button
    this.loginButton = 'button[id="shared_move-to-archived-modal_submit"]'; // OK button

    this.toggleButton = "li[id='shared_third-party-storage-toggle']";
    this.roomtags = "div[data-testid='field-container']";
    this.saveButton = "button[type='button'][data-testid='button']";
    
  }

  
  async toggleThirdPartyStorage() {
    await this.page.click(this.toggleButton);
    await this.page.getByTestId('box').getByTestId('drop-down-item').first().click();
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

  async renametag(currentTitle, newTitle) {
    await this.openRoomContextMenu(currentTitle);
    await this.page.click(this.editRoomButtonSelector);
    await this.page.fill(this.roomTagsInputSelector, newTitle);
    await this.page.press(this.roomTagsInputSelector, "Enter");
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async uploadPictures(currentTitle) {
    await this.openRoomContextMenu(currentTitle);
    await this.page.click(this.editRoomButtonSelector);
    await this.page.getByTestId('box').getByTestId('room-icon').locator('div').filter({ hasText: 'Upload picture Customize cover' }).first().click();
    await this.page.locator('#modal-scroll input[type="file"]').setInputFiles('data/avatars/OAuthApp.jpg');
    await this.page.getByTestId('button').nth(3).click();
    const buttonLocator = this.page.locator('button[data-testid="button"]').nth(1); // Select the third button (index 2)
    const isVisible = await buttonLocator.isVisible(); // Check if the button is visible
    console.log('Button is visible:', isVisible); // Log the visibility result
    if (isVisible) {
        await buttonLocator.click(); // Click the button if it is visible
    } else {
        console.error('Button is not visible!'); // Notify if the button is not visible
    }
}

  async isRoomVisible(roomTitle) {
    await this.page.waitForSelector(this.roomTitleSelector(roomTitle));
    return true;
  } 
  
  async MoveRoomToArchive(roomTitle) {
    await this.openRoomContextMenu(roomTitle);
    await this.page.click(this.roomMoveArchiveSelector);
    await this.page.waitForSelector(this.roomTitleSelector(roomTitle));
    await this.page.click(this.loginButton);
  } 
}
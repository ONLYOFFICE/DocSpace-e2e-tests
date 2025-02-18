export class RoomsListPage {
  constructor(page) {
    this.page = page;
    this.roomsListSelector = "div[id='document_catalog-shared']";
    this.roomTitleSelector = (title) => `text=${title}`;
    this.contextMenuButtonSelector = (title) =>
      `div[data-title='${title}'] div[data-testid='context-menu-button']`;
     // edit room selectors
    this.editRoomButtonSelector = '[id="option_edit-room"]'; // Edit room button
    this.roomNameInputSelector = "input[id='shared_room-name']"; // Room name input
    this.roomTagsInputSelector = "input[id='shared_tags-input']"; // Room tags input
    this.saveButton = "button[type='button'][data-testid='button']"; // Save button

    this.roomIconInput = page.locator('input[type="file"]');
    this.uploadPicture = "[data-event='click focus']"; // Upload picture button
    this.boxSelector = "div[data-testid='box']"; // Upload picture button

    // archive room selectors
    this.roomMoveArchiveSelector = '[id="option_archive-room"]'; // Move to archive button
    this.submitButton = "button[id='shared_move-to-archived-modal_submit']";

    this.toggleButton = "li[id='shared_third-party-storage-toggle']";
    this.roomtags = "div[data-testid='field-container']";


    // Virtual Data Room functionality
    this.createRoomButtonSelector = "button[id='rooms-shared_create-room-button']"; // rooms-shared_create-room-button
    


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
    await this.page.press(this.roomNameInputSelector, 'Enter');
  }

  async renametag(currentTitle, newTitle) {
    await this.openRoomContextMenu(currentTitle);
    await this.page.click(this.editRoomButtonSelector);
    await this.page.fill(this.roomTagsInputSelector, newTitle);
    await this.page.press(this.roomTagsInputSelector, 'Enter');
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async uploadPicturesJPG(currentTitle) {
    await this.openRoomContextMenu(currentTitle);
    await this.page.click(this.editRoomButtonSelector);
    await this.page
      .getByTestId('box')
      .getByTestId('room-icon')
      .locator('div')
      .filter({ hasText: 'Upload picture Customize cover' })
      .first()
      .click();
    await this.page
      .locator('#modal-scroll input[type="file"]')
      .setInputFiles('data/avatars/OAuthApp.jpg');
    await this.page.getByTestId('button').nth(3).click();
    const buttonLocator = this.page.locator('button[data-testid="button"]').nth(1); // Select the third button (index 2)
    const isVisible = await buttonLocator.isVisible(); // Check if the button is visible
    console.log('Button is visible:', isVisible); // Log the visibility result
    if (isVisible) {
      await Promise.all([this.page.waitForLoadState('networkidle'), buttonLocator.click()]);
    } else {
      console.error('Button is not visible!');
    }
  }

  async uploadPicturesPNG(currentTitle) {
    await this.openRoomContextMenu(currentTitle);
    await this.page.click(this.editRoomButtonSelector);
    await this.page
      .getByTestId('box')
      .getByTestId('room-icon')
      .locator('div')
      .filter({ hasText: 'Upload picture Customize cover' })
      .first()
      .click();
    await this.page
      .locator('#modal-scroll input[type="file"]')
      .setInputFiles('data/avatars/AvatarPNG.png');
    await this.page.getByTestId('button').nth(3).click();
    const buttonLocator = this.page.locator('button[data-testid="button"]').nth(1); // Select the third button (index 2)
    const isVisible = await buttonLocator.isVisible(); // Check if the button is visible
    console.log('Button is visible:', isVisible); // Log the visibility result
    if (isVisible) {
      await Promise.all([this.page.waitForLoadState('networkidle'), buttonLocator.click()]);
    } else {
      console.error('Button is not visible!');
    }
  }

  async uploadPicturesCustomizeCover(currentTitle) {
    await this.openRoomContextMenu(currentTitle);
    await this.page.click(this.editRoomButtonSelector);
    await this.page.locator('#modal-scroll').getByTestId('room-icon').locator('div').nth(1).click();
    await this.page.locator('#modal-scroll').getByTestId('drop-down-item').nth(1).click();
    await this.page.locator('.sc-dRGYJT').first().click();
    await this.page.locator('.colors-container > div:nth-child(2)').click();
    await this.page.getByRole('button', { name: 'Apply' }).click();
    await this.page.getByTestId('box').getByTestId('room-icon').locator('div').nth(1).click();
    const buttonLocator = this.page.locator('button[data-testid="button"]').nth(1); // Select the third button (index 2)
    const isVisible = await buttonLocator.isVisible(); // Check if the button is visible
    console.log('Button is visible:', isVisible); // Log the visibility result
    if (isVisible) {
      await Promise.all([this.page.waitForLoadState('networkidle'), buttonLocator.click()]);
    } else {
      console.error('Button is not visible!');
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
    await this.page.click(this.submitButton);
  }
  async VDRchange() {
    try {
    const roomName = 'Test Virtual Data Room Func';
    await this.page.getByTestId('button').click();
    await this.page.getByTitle('Virtual Data Room').click();
    const nameInput = this.page.getByRole('textbox', { name: 'Name:' });
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.fill(roomName);
    await this.page.locator('.virtual-data-room-block_header').nth(2).click();
    await this.page.getByText('User Email').click();
    await this.page.getByText('User IP Address').click();
    await this.page.getByText('Current Date').click();
    await this.page.getByText('Room Name').click();
    const textInput = this.page.getByPlaceholder(' ', { exact: true });
    await textInput.click();
    await textInput.fill('TEST TEXT INPUT');
    await this.page.getByTestId('box').getByTestId('combobox').locator('div').first().click();
    const createRoomButton = this.page.getByRole('button', { name: 'Create', exact: true });
    await createRoomButton.waitFor({ state: 'visible', timeout: 5000 });
    await createRoomButton.click();
    const createFileButton = this.page.getByRole('button', { name: 'Create a new file', exact: true });
    await createFileButton.waitFor({ state: 'visible', timeout: 10000 });
    await createFileButton.click();
    const documentOption = this.page.getByRole('menuitem', { name: 'Document' });
    await documentOption.waitFor({ state: 'visible', timeout: 5000 });
    await documentOption.click();
    const createDocButton = this.page.getByRole('button', { name: 'Create', exact: true });
    await createDocButton.waitFor({ state: 'visible', timeout: 5000 });
    const pagePromise = this.page.context().waitForEvent('page');
    await createDocButton.click();
    const newPage = await pagePromise;
    await newPage.waitForLoadState('load', { timeout: 30000 });
    return true;
    } catch (error) {
    throw error;
    }
  }
}

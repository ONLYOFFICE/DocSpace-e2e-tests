import log from "loglevel";
import { FileGenerator } from "../../utils/file_generator.js";
import config from "../../config/config.js";

export class RoomsListPage {
  constructor(page) {
    this.page = page;
    this.mobileMenuButton = "path";
    this.roomsListSelector = "div[id='document_catalog-shared']";
    this.roomsList = this.page.locator(this.roomsListSelector);
    this.roomTitleSelector = (title) => `text=${title}`;
    this.contextMenuButtonSelector = (title) =>
      `div[data-title='${title}'] div[data-testid='context-menu-button']`;
    this.checkboxSelector = (title) =>
      `div[data-title='Test Public Room ${title}']  div[data-testid='room-icon']`;
    this.selectButtonSelector = '[id="option_select"]'; // Select button
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
    this.createRoomButtonSelector = config.IS_MOBILE
      ? this.page
          .getByTestId("main-button-mobile")
          .getByRole("img")
          .locator("path")
      : this.page.locator("#rooms-shared_create-room-button");

    this.createModalSubmitButton = this.page.locator(
      "#shared_create-room-modal_submit",
    );
    this.createFileButtonSelector = this.page
      .locator('div[class="add-button"][title="Actions"]')
      .locator('div[data-testid="icon-button"][data-event="click focus"]'); // rooms-shared_create-file-button
    this.submitButtonSelector = this.page.locator(
      '[data-testid="button"].submit',
    ); // Submit button in modal

    // Room type buttons by room-name
    this.publicRoomLocator = this.page.getByTestId("room-logo").nth(0);
    this.formFillingRoomLocator = this.page.getByTestId("room-logo").nth(1);
    this.collaborationRoomLocator = this.page.getByTestId("room-logo").nth(2);
    this.virtualDataRoomLocator = this.page.getByTestId("room-logo").nth(3);
    this.customRoomLocator = this.page.getByTestId("room-logo").nth(4);
  }

  async CreatePublicRoomFunc(connectorName = "") {
    const roomName = `Test Public Room ${connectorName}`;
    await this.createRoomButtonSelector.click();
    await this.publicRoomLocator.click();
    const nameInput = this.page.getByRole("textbox", { name: "Name:" });
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill(roomName);
    return roomName;
  }

  async CreateButton() {
    await this.createModalSubmitButton.waitFor({
      state: "visible",
      timeout: 5000,
    });
    return await this.createModalSubmitButton.click();
  }

  async toggleThirdPartyStorage() {
    await this.page.click(this.toggleButton);
    await this.page
      .getByTestId("box")
      .getByTestId("drop-down-item")
      .first()
      .click();
  }

  // Open the rooms list
  async openRoomsList() {
    if (config.IS_MOBILE) {
      // For mobile, first click menu button, then click rooms list
      const mobileMenuButton = this.page.locator(this.mobileMenuButton).first();
      await mobileMenuButton.click();
      await this.page.click("div[id='document_catalog-shared']");
    } else {
      // For desktop, directly click rooms list
      await this.page.click("div[id='document_catalog-shared']");
    }
  }

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
    await this.page.getByRole("button", { name: "Save" }).click();
  }

  async uploadPicturesJPG(currentTitle) {
    await this.openRoomContextMenu(currentTitle);
    await this.page.click(this.editRoomButtonSelector);
    const uploadPictureButton = this.page
      .getByTestId("box")
      .getByTestId("room-icon")
      .locator("div");
    await uploadPictureButton
      .filter({ hasText: "Upload picture Customize cover" })
      .first()
      .click();
    await this.page
      .locator('#modal-scroll input[type="file"]')
      .setInputFiles("data/avatars/OAuthApp.jpg");
    await this.page.getByTestId("button").nth(3).click();
    const buttonLocator = this.page
      .locator('button[data-testid="button"]')
      .nth(1); // Select the third button (index 2)
    const isVisible = await buttonLocator.isVisible(); // Check if the button is visible
    log.debug("Button is visible:", isVisible); // Log the visibility result
    if (isVisible) {
      await Promise.all([
        this.page.waitForLoadState("networkidle"),
        buttonLocator.click(),
      ]);
    } else {
      log.error("Button is not visible!");
    }
  }

  async uploadPicturesPNG(currentTitle) {
    await this.openRoomContextMenu(currentTitle);
    await this.page.click(this.editRoomButtonSelector);
    const uploadPictureButton = this.page
      .getByTestId("box")
      .getByTestId("room-icon")
      .locator("div");
    await uploadPictureButton
      .filter({ hasText: "Upload picture Customize cover" })
      .first()
      .click();
    await this.page
      .locator('#modal-scroll input[type="file"]')
      .setInputFiles("data/avatars/AvatarPNG.png");
    await this.page.getByTestId("button").nth(3).click();
    const buttonLocator = this.page
      .locator('button[data-testid="button"]')
      .nth(1); // Select the third button (index 2)
    const isVisible = await buttonLocator.isVisible(); // Check if the button is visible
    log.debug("Button is visible:", isVisible); // Log the visibility result
    if (isVisible) {
      await Promise.all([
        this.page.waitForLoadState("networkidle"),
        buttonLocator.click(),
      ]);
    } else {
      log.error("Button is not visible!");
    }
  }

  async uploadPicturesCustomizeCover(currentTitle) {
    await this.openRoomContextMenu(currentTitle);
    await this.page.click(this.editRoomButtonSelector);
    const roomIconMenu = this.page
      .locator("#modal-scroll")
      .getByTestId("room-icon");
    await roomIconMenu.locator("div").nth(1).click();
    const dropDownItems = this.page
      .locator("#modal-scroll")
      .getByTestId("drop-down-item");
    await dropDownItems.nth(1).click();
    await this.page.locator(".sc-dRGYJT").first().click();
    await this.page.locator(".colors-container > div:nth-child(2)").click();
    await this.page.getByRole("button", { name: "Apply" }).click();
    const mainRoomIcon = this.page.getByTestId("box").getByTestId("room-icon");
    await mainRoomIcon.locator("div").nth(1).click();
    const uploadButton = this.page
      .locator('button[data-testid="button"]')
      .nth(1);
    const isVisible = await uploadButton.isVisible();
    log.debug("Upload button is visible:", isVisible);
    if (isVisible) {
      await Promise.all([
        this.page.waitForLoadState("networkidle"),
        uploadButton.click(),
      ]);
    } else {
      log.error("Upload button is not visible!");
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
    const roomName = "Test Virtual Data Room Func";
    await this.createRoomButtonSelector.click();
    await this.virtualDataRoomLocator.click();
    const nameInput = this.page.getByRole("textbox", { name: "Name:" });
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill(roomName);
    await this.page.locator(".virtual-data-room-block_header").nth(2).click();
    await this.page.getByText("User Email").click();
    await this.page.getByText("User IP Address").click();
    await this.page.getByText("Current Date").click();
    await this.page.getByText("Room Name").click();
    const textInput = this.page.getByPlaceholder(" ", { exact: true });
    await textInput.click();
    await textInput.fill("TEST TEXT INPUT");
    await this.page
      .getByTestId("box")
      .getByTestId("combobox")
      .locator("div")
      .first()
      .click();
    // Click the Create button to create a room
    await this.createModalSubmitButton.click();

    // Wait for the file creation button to appear and click it
    const createFileButton = this.page.getByRole("button", {
      name: "Create a new file",
      exact: true,
    });
    await createFileButton.waitFor({ state: "visible", timeout: 10000 });
    await createFileButton.click();
  }

  async CreateVDRroom() {
    await this.createRoomButtonSelector.click();
    await this.virtualDataRoomLocator.click();
    const nameInput = this.page.locator("input[id='shared_room-name']");
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill("Test VDR Room Func");
    await this.createModalSubmitButton.click();
  }

  async CreatePublicRoom() {
    await this.createRoomButtonSelector.click();
    await this.publicRoomLocator.click();
    const nameInput = this.page.locator("input[id='shared_room-name']");
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill("Test Public Room Func");
    await this.createModalSubmitButton.click();
  }

  async CreateCollaborationroom() {
    await this.createRoomButtonSelector.click();
    await this.collaborationRoomLocator.click();
    const nameInput = this.page.locator("input[id='shared_room-name']");
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill("Test Collaboration Room Func");
    await this.createModalSubmitButton.click();
  }

  async CreateCustomroom() {
    await this.createRoomButtonSelector.click();
    await this.customRoomLocator.click();
    const nameInput = this.page.locator("input[id='shared_room-name']");
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill("Test Custom Room Func");
    await this.createModalSubmitButton.click();
  }

  async CreateDocumentFiles() {
    await this.createFileButtonSelector.click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole("menuitem").nth(0).click();
    await this.submitButtonSelector.click();
    return await this.page.context().waitForEvent("page");
  }

  async CreateSpreadsheet() {
    await this.createFileButtonSelector.click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole("menuitem").nth(1).click();
    await this.submitButtonSelector.click();
    return await this.page.context().waitForEvent("page");
  }

  async CreatePresentation() {
    await this.createFileButtonSelector.click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole("menuitem").nth(2).click();
    await this.submitButtonSelector.click();
    return await this.page.context().waitForEvent("page");
  }

  async CreateFolder() {
    await this.createFileButtonSelector.click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole("menuitem").nth(4).click();
    await this.submitButtonSelector.click();
    return true;
  }

  async CreatePDFform() {
    await this.createFileButtonSelector.click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole("menuitem").nth(5).click();
    await this.submitButtonSelector.click();
    return true;
  }

  async UploadFile(fileType = "pdf", options = {}) {
    // Generate file
    const fileName = `test_${fileType}_${Date.now()}`;
    const filePath = await FileGenerator.generateFile(fileType, {
      filename: `${fileName}.${fileType}`,
      title: options.title || `Test ${fileType.toUpperCase()} Document`,
      content:
        options.content ||
        `This is an automatically generated ${fileType.toUpperCase()} file for testing purposes.`,
    });

    await this.createFileButtonSelector.click();
    await this.page.waitForTimeout(500);
    const uploadPromise = this.page.waitForEvent("filechooser");
    await this.page.getByRole("menuitem").nth(5).click();
    const fileChooser = await uploadPromise;
    await fileChooser.setFiles(filePath);

    // Wait for file to appear in the list
    await this.page.waitForSelector(`[data-title="${fileName}.${fileType}"]`, {
      timeout: 10000,
    });
    // Cleanup temporary file
    await FileGenerator.cleanup(filePath);
    return `${fileName}.${fileType}`;
  }
}

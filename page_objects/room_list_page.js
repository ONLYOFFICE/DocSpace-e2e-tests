import log from "loglevel";

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
    this.createRoomButtonSelector =
      "button[id='rooms-shared_create-room-button']"; // rooms-shared_create-room-button
    this.createFileButtonSelector = "data-testid='icon-button'"; // rooms-shared_create-file-button
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
    await this.page.getByRole("button", { name: "Save" }).click();
  }

  async uploadPicturesJPG(currentTitle) {
    await this.openRoomContextMenu(currentTitle);
    await this.page.click(this.editRoomButtonSelector);
    await this.page
      .getByTestId("box")
      .getByTestId("room-icon")
      .locator("div")
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
    await this.page
      .getByTestId("box")
      .getByTestId("room-icon")
      .locator("div")
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
    await this.page
      .locator("#modal-scroll")
      .getByTestId("room-icon")
      .locator("div")
      .nth(1)
      .click();
    await this.page
      .locator("#modal-scroll")
      .getByTestId("drop-down-item")
      .nth(1)
      .click();
    await this.page.locator(".sc-dRGYJT").first().click();
    await this.page.locator(".colors-container > div:nth-child(2)").click();
    await this.page.getByRole("button", { name: "Apply" }).click();
    await this.page
      .getByTestId("box")
      .getByTestId("room-icon")
      .locator("div")
      .nth(1)
      .click();
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
    await this.page.getByTestId("button").click();
    await this.page.getByTitle("Virtual Data Room").click();
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
    const createRoomButton = this.page.getByRole("button", {
      name: "Create",
      exact: true,
    });
    await createRoomButton.waitFor({ state: "visible", timeout: 5000 });
    await createRoomButton.click();
    const createFileButton = this.page.getByRole("button", {
      name: "Create a new file",
      exact: true,
    });
    await createFileButton.waitFor({ state: "visible", timeout: 10000 });
    await createFileButton.click();
    const documentOption = this.page.getByRole("menuitem", {
      name: "Document",
    });
    await documentOption.waitFor({ state: "visible", timeout: 5000 });
    await documentOption.click();
    const createDocButton = this.page.getByRole("button", {
      name: "Create",
      exact: true,
    });
    await createDocButton.waitFor({ state: "visible", timeout: 5000 });
    const pagePromise = this.page.context().waitForEvent("page");
    await createDocButton.click();
    await pagePromise;
    return true;
  }
  async CreateVDRroom() {
    const roomName = "Test Virtual Data Room Func";
    await this.page.getByTestId("button").click();
    await this.page.getByTitle("Virtual Data Room").click();
    const nameInput = this.page.getByRole("textbox", { name: "Name:" });
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill(roomName);
    const createRoomButton = this.page.getByRole("button", {
      name: "Create",
      exact: true,
    });
    await createRoomButton.waitFor({ state: "visible", timeout: 5000 });
    await createRoomButton.click();
    return true;
  }
  async CreatePublicRoom() {
    const roomName = "Test Public Room Func";
    await this.page.getByTestId("button").click();
    await this.page.getByTitle("Public room").click();
    const nameInput = this.page.getByRole("textbox", { name: "Name:" });
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill(roomName);
    const createRoomButton = this.page.getByRole("button", {
      name: "Create",
      exact: true,
    });
    await createRoomButton.waitFor({ state: "visible", timeout: 5000 });
    await createRoomButton.click();
    return true;
  }
  async CreateCollaborationroom() {
    const roomName = "Test Collaboration Room Func";
    await this.page.getByTestId("button").click();
    await this.page.getByTitle("Collaboration room").click();
    const nameInput = this.page.getByRole("textbox", { name: "Name:" });
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill(roomName);
    const createRoomButton = this.page.getByRole("button", {
      name: "Create",
      exact: true,
    });
    await createRoomButton.waitFor({ state: "visible", timeout: 5000 });
    await createRoomButton.click();
    return true;
  }

  async CreateCustomroom() {
    const roomName = "Test Custom Room Func";
    await this.page.getByTestId("button").click();
    await this.page.getByTitle("Custom room").click();
    const nameInput = this.page.getByRole("textbox", { name: "Name:" });
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill(roomName);
    const createRoomButton = this.page.getByRole("button", {
      name: "Create",
      exact: true,
    });
    await createRoomButton.waitFor({ state: "visible", timeout: 5000 });
    await createRoomButton.click();
    return true;
  }

  async CreateDocumentFiles() {
    // Click the create button and wait for menu
    const addButton = this.page.locator(
      ".add-button > .sc-fqkvVR > .icon-button_svg > div > .injected-svg > path",
    );
    await addButton.waitFor({ state: "visible", timeout: 10000 });
    await addButton.click();

    // Wait for menu to be fully visible
    await this.page.waitForTimeout(500);

    // Select Document and ensure it's clickable
    const menuItem = this.page.getByRole("menuitem").nth(0);
    await menuItem.waitFor({ state: "visible", timeout: 10000 });
    await this.page.waitForTimeout(500);
    await menuItem.click();

    // Wait for dialog to settle
    await this.page.waitForTimeout(500);

    // Click Create button
    const createButton = this.page.locator(".modal-footer button").first();
    await createButton.waitFor({ state: "visible", timeout: 10000 });
    await createButton.click();

    // Wait for new tab to open
    await this.page.context().waitForEvent("page", { timeout: 10000 });
    await this.page.waitForTimeout(500);

    return true;
  }

  async CreateSpreadsheet() {
    // Click the create button
    const addButton = this.page.locator(
      ".add-button > .sc-fqkvVR > .icon-button_svg > div > .injected-svg > path",
    );
    await addButton.waitFor({ state: "visible" });
    await addButton.click();

    // Select Spreadsheet
    const menuItem = this.page.getByRole("menuitem").nth(1);
    await menuItem.waitFor({ state: "visible" });
    await menuItem.click();

    await this.page.waitForTimeout(500);

    // Click Create button
    const createButton = this.page.locator(".modal-footer button").first();
    await createButton.waitFor({ state: "visible" });
    await createButton.click();

    // Wait for new tab to open
    await this.page.context().waitForEvent("page", { timeout: 10000 });
    await this.page.waitForTimeout(500);

    return true;
  }

  async CreatePresentation() {
    // Click the create button
    const addButton = this.page.locator(
      ".add-button > .sc-fqkvVR > .icon-button_svg > div > .injected-svg > path",
    );
    await addButton.waitFor({ state: "visible" });
    await addButton.click();

    // Select Presentation
    const menuItem = this.page.getByRole("menuitem").nth(2);
    await menuItem.waitFor({ state: "visible" });
    await menuItem.click();

    await this.page.waitForTimeout(500);

    // Click Create button
    const createButton = this.page.locator(".modal-footer button").first();
    await createButton.waitFor({ state: "visible" });
    await createButton.click();

    // Wait for new tab to open
    await this.page.context().waitForEvent("page", { timeout: 10000 });
    await this.page.waitForTimeout(500);

    return true;
  }

  async CreateFolder() {
    // Click the create button
    const addButton = this.page.locator(
      ".add-button > .sc-fqkvVR > .icon-button_svg > div > .injected-svg > path",
    );
    await addButton.waitFor({ state: "visible" });
    await addButton.click();

    await this.page.waitForTimeout(1000);

    // Select Folder
    const menuItem = this.page.getByRole("menuitem").nth(4);
    await menuItem.waitFor({ state: "visible", timeout: 10000 });
    await this.page.waitForTimeout(1000);
    await menuItem.click();

    await this.page.waitForTimeout(1000);

    // Click Create button
    const createButton = this.page.locator(".modal-footer button").first();
    await createButton.waitFor({ state: "visible", timeout: 10000 });
    await createButton.click();

    await this.page.waitForTimeout(1000);

    return true;
  }

  async UploadFile(fileType = "pdf", options = {}) {
    // Generate file
    const FileGenerator = require("../utils/file_generator");
    const fileName = `test_${fileType}_${Date.now()}`;
    const filePath = await FileGenerator.generateFile(fileType, {
      filename: `${fileName}.${fileType}`,
      title: options.title || `Test ${fileType.toUpperCase()} Document`,
      content:
        options.content ||
        `This is an automatically generated ${fileType.toUpperCase()} file for testing purposes.`,
    });

    // Click the create button and wait for menu
    const addButton = this.page.locator(
      ".add-button > .sc-fqkvVR > .icon-button_svg > div > .injected-svg > path",
    );
    await addButton.waitFor({ state: "visible" });
    await addButton.click();

    // Select Upload option and wait for file chooser
    const uploadMenuItem = this.page.getByRole("menuitem").nth(5);
    await uploadMenuItem.waitFor({ state: "visible" });
    const uploadPromise = this.page.waitForEvent("filechooser");
    await uploadMenuItem.click();
    const fileChooser = await uploadPromise;

    // Upload the generated file
    await fileChooser.setFiles(filePath);

    // Wait for upload to complete
    await this.page.waitForLoadState("networkidle", { timeout: 10000 });

    // Wait for the file link to appear and be clickable
    const fileLink = this.page.getByRole("link", { name: fileName });
    await fileLink.waitFor({ state: "visible", timeout: 10000 });
    await fileLink.click();

    // Wait for any dialogs or modals to close
    await this.page.waitForTimeout(1000);

    // Cleanup: remove temporary file
    await FileGenerator.cleanup(filePath);
    return true;
  }

  async CreatePDFform() {
    // Click the create button
    const addButton = this.page.locator(
      ".add-button > .sc-fqkvVR > .icon-button_svg > div > .injected-svg > path",
    );
    await addButton.waitFor({ state: "visible" });
    await addButton.click();

    // Select PDF Form
    const menuItem = this.page.getByRole("menuitem").nth(4);
    await menuItem.waitFor({ state: "visible" });
    await menuItem.click();

    await this.page.waitForTimeout(500);

    // Click Create button
    const createButton = this.page.locator(".modal-footer button").first();
    await createButton.waitFor({ state: "visible" });
    await createButton.click();

    // Wait for new tab to open
    await this.page.context().waitForEvent("page", { timeout: 10000 });
    await this.page.waitForTimeout(500);

    return true;
  }
}

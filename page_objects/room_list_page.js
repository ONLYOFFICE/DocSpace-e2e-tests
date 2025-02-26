import log from "loglevel";
import { FileGenerator } from "../utils/file_generator.js";
import config from "../config/config.js";

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
    //Pub Room functionality
    this.pubToggleButtonLocator = this.page
      .getByTestId("toggle-button")
      .locator("circle");
    this.pubComboBoxLocator = this.page
      .getByTestId("box")
      .getByTestId("combobox");
    this.ConnectButtonLocator = this.page.locator(
      "#shared_third-party-storage_connect",
    );

    //Third party storage buttons
    this.ownCloudButton = this.page.locator('[data-third-party-id="ownCloud"]');
    this.nextCloudButton = this.page.locator(
      '[data-third-party-id="Nextcloud"]',
    );
    this.webDavButton = this.page.locator('[data-third-party-id="WebDav"]');
    this.kDriveButton = this.page.locator('[data-third-party-id="kDrive"]');
    this.oneDriveButton = this.page.locator('[data-third-party-id="OneDrive"]');
    this.dropboxButton = this.page.locator('[data-third-party-id="Dropbox"]');
    this.boxButton = this.page.locator('[data-third-party-id="Box"]');

    //Rooms choose
    this.NewRoomButtonLocator = this.page.locator(
      "#rooms-shared_create-room-button",
    );
    // Room type buttons by room-logo
    this.publicRoomLocator = this.page.getByTestId("room-logo").nth(0);
    this.formFillingRoomLocator = this.page.getByTestId("room-logo").nth(1);
    this.collaborationRoomLocator = this.page.getByTestId("room-logo").nth(2);
    this.virtualDataRoomLocator = this.page.getByTestId("room-logo").nth(3);
    this.customRoomLocator = this.page.getByTestId("room-logo").nth(4);
  }

  async CreatePublicRoomFunc(connectorName = "") {
    const roomName = `Test Public Room ${connectorName}`;
    await this.NewRoomButtonLocator.click();
    await this.publicRoomLocator.click();
    const nameInput = this.page.getByRole("textbox", { name: "Name:" });
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill(roomName);
    return roomName;
  }

  async ConnectNextcloud() {
    await this.pubComboBoxLocator.click();
    await this.nextCloudButton.click();
    await this.ConnectButtonLocator.click();
    await this.page.locator("#connection-url-input").click();
    await this.page.locator("#connection-url-input").fill(config.NEXTCLOUD_URL);
    await this.page.locator("#login-input").click();
    await this.page.locator("#login-input").fill(config.NEXTCLOUD_LOGIN);
    await this.page
      .getByTestId("password-input")
      .getByTestId("text-input")
      .click();
    await this.page
      .getByTestId("password-input")
      .getByTestId("text-input")
      .fill(config.NEXTCLOUD_PASSWORD);
    await this.page.getByRole("button", { name: "Save" }).click();
  }

  async BOX() {
    await this.pubComboBoxLocator.click();
    await this.boxButton.click();
    const page1Promise = this.page.waitForEvent("popup");
    await this.ConnectButtonLocator.click();
    const page1 = await page1Promise;
    await page1.waitForLoadState("networkidle");
    await page1.waitForSelector("#login");
    await page1.fill("#login", config.BOX_LOGIN);
    await page1.fill("#password", config.BOX_PASS);
    await page1.waitForSelector('input[type="submit"]');
    await page1.locator('input[type="submit"]').click();
    await page1.waitForLoadState("networkidle");
    await page1.waitForSelector("#consent_accept_button", { timeout: 10000 });
    await page1.locator("#consent_accept_button").click();
  }

  async Dropbox() {
    await this.pubComboBoxLocator.click();
    await this.dropboxButton.click();
    const page1Promise = this.page.waitForEvent("popup");
    await this.ConnectButtonLocator.click();
    const page1 = await page1Promise;
    await page1.waitForLoadState("networkidle");
    await page1.locator('input[name="susi_email"]').fill(config.DROPBOX_LOGIN);
    await page1.waitForTimeout(1000);
    await page1.keyboard.press("Enter");
    await page1
      .locator('input[name="login_password"]')
      .fill(config.DROPBOX_PASS);
    await page1.getByTestId("login-form-submit-button").click();
    await page1.waitForLoadState("networkidle");
  }

  async OneDrive() {
    await this.pubComboBoxLocator.click();
    await this.oneDriveButton.click();
    const page1Promise = this.page.waitForEvent("popup");
    await this.ConnectButtonLocator.click();
    const page1 = await page1Promise;
    await page1.waitForLoadState("networkidle");
    // Enter email
    await page1.waitForSelector('input[type="email"]');
    await page1.locator('input[type="email"]').fill(config.ONEDRIVE_LOGIN);
    await page1.click("#idSIButton9");
    // Check if lightbox exists
    const hasLightbox = await page1.locator("#lightbox-cover").isVisible();
    if (hasLightbox) {
      // If lightbox exists, enter password immediately
      await page1.waitForSelector('input[type="password"]');
      await page1.waitForLoadState("networkidle");
      await page1
        .locator('input[type="password"]')
        .fill(config.ONEDRIVE_PASSWORD);
      await page1.click("#idSIButton9");
      await page1.waitForTimeout(1000);
      await page1.waitForLoadState("networkidle");
      await page1.keyboard.press("Enter");
    } else {
      // If not, follow the alternative path
      await page1.waitForSelector("#idA_PWD_SwitchToCredPicker");
      await page1.click("#idA_PWD_SwitchToCredPicker");
      await page1.waitForSelector('input[type="password"]');
      await page1
        .locator('input[type="password"]')
        .fill(config.ONEDRIVE_PASSWORD);
      await page1.click("#idSIButton9");
      await page1.waitForTimeout(1000);
      await page1.keyboard.press("Enter");
    }
  }

  async CreateButton() {
    const createRoomButton = this.page.getByRole("button", {
      name: "Create",
      exact: true,
    });
    await createRoomButton.waitFor({ state: "visible", timeout: 5000 });
    await createRoomButton.click();
    return true;
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
    await this.NewRoomButtonLocator.click();
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

    // Нажимаем кнопку Create для создания комнаты
    await this.CreateButton();

    // Ждем появления кнопки создания файла и нажимаем её
    const createFileButton = this.page.getByRole("button", {
      name: "Create a new file",
      exact: true,
    });
    await createFileButton.waitFor({ state: "visible", timeout: 10000 });
    await createFileButton.click();
  }

  async CreateVDRroom() {
    await this.NewRoomButtonLocator.click();
    await this.virtualDataRoomLocator.click();
    const nameInput = this.page.getByRole("textbox", { name: "Name:" });
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill("Test Virtual Data Room Func");
    return await this.CreateButton();
  }

  async CreatePublicRoom() {
    await this.NewRoomButtonLocator.click();
    await this.publicRoomLocator.click();
    const nameInput = this.page.getByRole("textbox", { name: "Name:" });
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill("Test Public Room Func");
    return await this.CreateButton();
  }

  async CreateCollaborationroom() {
    await this.NewRoomButtonLocator.click();
    await this.collaborationRoomLocator.click();
    const nameInput = this.page.getByRole("textbox", { name: "Name:" });
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill("Test Collaboration Room Func");
    return await this.CreateButton();
  }

  async CreateCustomroom() {
    await this.NewRoomButtonLocator.click();
    await this.customRoomLocator.click();
    const nameInput = this.page.getByRole("textbox", { name: "Name:" });
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
    await nameInput.fill("Test Custom Room Func");
    return await this.CreateButton();
  }

  async CreateDocumentFiles() {
    await this.page
      .locator(
        ".add-button > .sc-fqkvVR > .icon-button_svg > div > .injected-svg > path",
      )
      .click();
    await this.page.getByRole("menuitem", { name: "Document" }).click();
    await this.page
      .getByRole("button", { name: "Create", exact: true })
      .click();
    const newPage = await this.page.context().waitForEvent("page");
    return newPage;
  }

  async CreateSpreadsheet() {
    await this.page
      .locator(
        ".add-button > .sc-fqkvVR > .icon-button_svg > div > .injected-svg > path",
      )
      .click();
    await this.page.getByRole("menuitem").nth(1).click();
    await this.page.locator(".modal-footer button").first().click();
    await this.page.context().waitForEvent("page");
    return true;
  }

  async CreatePresentation() {
    await this.page
      .locator(
        ".add-button > .sc-fqkvVR > .icon-button_svg > div > .injected-svg > path",
      )
      .click();
    await this.page.getByRole("menuitem").nth(2).click();
    await this.page.locator(".modal-footer button").first().click();
    await this.page.context().waitForEvent("page");
    return true;
  }

  async CreateFolder() {
    await this.page
      .locator(
        ".add-button > .sc-fqkvVR > .icon-button_svg > div > .injected-svg > path",
      )
      .click();
    await this.page.getByRole("menuitem").nth(4).click();
    await this.page
      .getByRole("button", { name: "Create", exact: true })
      .click();
    return true;
  }

  async CreatePDFform() {
    await this.page
      .locator(
        ".add-button > .sc-fqkvVR > .icon-button_svg > div > .injected-svg > path",
      )
      .click();
    await this.page.getByRole("menuitem").nth(5).click();
    await this.page
      .getByRole("button", { name: "Create", exact: true })
      .click();
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
}

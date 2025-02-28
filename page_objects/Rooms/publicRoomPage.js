import config from "../../config/config.js";
import { expect } from "@playwright/test";

export class PublicRoomPage {
  constructor(page) {
    this.page = page;
    this.roomsListSelector = "div[id='document_catalog-shared']";
    this.ownCloudButton = this.page.locator('[data-third-party-id="ownCloud"]');
    this.nextCloudButton = this.page.locator(
      '[data-third-party-id="Nextcloud"]',
    );
    this.webDavButton = this.page.locator('[data-third-party-id="WebDav"]');
    this.kDriveButton = this.page.locator('[data-third-party-id="kDrive"]');
    this.oneDriveButton = this.page.locator('[data-third-party-id="OneDrive"]');
    this.dropboxButton = this.page.locator('[data-third-party-id="Dropbox"]');
    this.boxButton = this.page.locator('[data-third-party-id="Box"]');
    // Public Room functionality
    this.publicRoomSettingsBox = this.page
      .getByTestId("box")
      .getByTestId("combobox");
    this.connectStorageButton = this.page.locator(
      "#shared_third-party-storage_connect",
    );
    this.pubToggleButtonLocator = this.page
      .getByTestId("toggle-button")
      .locator("label");
    this.createModalSubmitButton = this.page.locator(
      "#shared_create-room-modal_submit",
    );
    // Actions menu buttons
    this.actionsButton = this.page.locator(
      '[data-for="header_optional-button"]',
    );
    this.reconnectStorageButton = this.page.locator(
      "#option_reconnect-storage",
    );
    this.editRoomButton = this.page.locator("#option_edit-room");
    this.inviteUsersButton = this.page.locator("#option_invite-users-to-room");
    this.copySharedLinkButton = this.page.locator("#option_copy-external-link");
    this.roomInfoButton = this.page.locator("#option_room-info");
    this.embeddingSettingButton = this.page.locator(
      "#option_embedding-setting",
    );
    this.downloadButton = this.page.locator("#option_download");
    this.changeRoomOwnerButton = this.page.locator("#option_change-room-owner");
    this.archiveRoomButton = this.page.locator("#option_archive-room");
    this.leaveRoomButton = this.page.locator("#option_leave-room");
    // Other buttons
    this.shareButton = this.page.locator("#share-public-room");
  }

  async CreateButton() {
    await this.createModalSubmitButton.waitFor({
      state: "visible",
      timeout: 15000,
    });
    return await this.createModalSubmitButton.click();
  }

  async ConnectNextcloud() {
    await this.nextCloudButton.click();
    await this.connectStorageButton.click();
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
    await this.publicRoomSettingsBox.click();
    await this.boxButton.click();
    const page1Promise = this.page.waitForEvent("popup");
    await this.connectStorageButton.click();
    const page1 = await page1Promise;
    await page1.waitForLoadState("domcontentloaded");
    await page1.waitForSelector("#login");
    await page1.fill("#login", config.BOX_LOGIN);
    await page1.fill("#password", config.BOX_PASS);
    await page1.waitForSelector('input[type="submit"]');
    await page1.locator('input[type="submit"]').click();
    await page1.waitForLoadState("domcontentloaded");
    await page1.waitForSelector("#consent_accept_button", { timeout: 10000 });
    await page1.locator("#consent_accept_button").click();
  }

  async Dropbox() {
    await this.publicRoomSettingsBox.click();
    await this.dropboxButton.click();
    const page1Promise = this.page.waitForEvent("popup");
    await this.connectStorageButton.click();
    const page1 = await page1Promise;
    await page1.waitForLoadState("domcontentloaded");
    await page1.locator('input[name="susi_email"]').fill(config.DROPBOX_LOGIN);
    await page1.waitForTimeout(1000);
    await page1.keyboard.press("Enter");
    await page1
      .locator('input[name="login_password"]')
      .fill(config.DROPBOX_PASS);
    await page1.getByTestId("login-form-submit-button").click();
    await page1.waitForLoadState("domcontentloaded");
  }

  async OneDrive() {
    await this.publicRoomSettingsBox.click();
    await this.oneDriveButton.click();
    const page1Promise = this.page.waitForEvent("popup");
    await this.connectStorageButton.click();
    const page1 = await page1Promise;
    await page1.waitForLoadState("domcontentloaded");
    // Enter email
    await page1.waitForSelector('input[type="email"]');
    await page1.locator('input[type="email"]').fill(config.ONEDRIVE_LOGIN);
    await page1.click("#idSIButton9");
    // Check if lightbox exists
    const hasLightbox = await page1.locator("#lightbox-cover").isVisible();
    if (hasLightbox) {
      // If lightbox exists, enter password immediately
      await page1.waitForSelector('input[type="password"]');
      await page1.waitForLoadState("domcontentloaded");
      await page1
        .locator('input[type="password"]')
        .fill(config.ONEDRIVE_PASSWORD);
      await page1.click("#idSIButton9");
      await page1.waitForTimeout(1000);
      await page1.waitForLoadState("domcontentloaded");
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

  async shareRoomWithAllUsers() {
    await this.actionsButton.click();
    await this.copySharedLinkButton.click();
  }

  async getClipboardContent() {
    // Request permission to access the clipboard
    await this.page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
    // Wait for a short pause to make sure the link is copied
    await this.page.waitForTimeout(1000);
    // Get the clipboard content
    return await this.page.evaluate(() => navigator.clipboard.readText());
  }

  async openInIncognito(browser, sharedLink) {
    // Create a new context in incognito mode with permissions
    const incognitoContext = await browser.newContext({
      incognito: true,
      permissions: ["clipboard-read", "clipboard-write"],
      viewport: { width: 1920, height: 1080 },
    });
    const incognitoPage = await incognitoContext.newPage();
    // Go to the link
    await incognitoPage.goto(sharedLink);
    return { incognitoContext, incognitoPage };
  }

  async waitForFileInRoom(fileName) {
    // Wait for file upload
    await this.page.waitForTimeout(2000);
    // Check if the file is visible
    const fileLink = this.page.locator(`[data-title="${fileName}"]`);
    await expect(fileLink).toBeVisible({ timeout: 30000 });
    return fileLink;
  }

  async verifyDocumentInIncognito(incognitoPage, roomName, fileName) {
    // Check the room title
    const roomTitle = incognitoPage.getByText(roomName);
    await expect(roomTitle).toBeVisible();
    // Check if the file is visible
    const fileLink = incognitoPage.locator(`[data-title="${fileName}"]`);
    await expect(fileLink).toBeVisible({ timeout: 30000 });
  }

  async verifyStorageTagAndOpenRoom(roomName, storageTag) {
    // Wait for the room to appear in the list
    await this.page.waitForSelector(this.roomsListSelector);
    // Check storage tag
    const tag = this.page
      .locator(`div[data-title="${roomName}"]`)
      .first()
      .locator(`[data-testid="tags"] .tag[data-tag="${storageTag}"]`);
    await expect(tag).toBeVisible({ timeout: 5000 });
    // Open room
    await this.page.locator(`div[data-title="${roomName}"]`).first().click();
  }

  async uploadAndVerifyFile(browser, roomName, roomsListPage) {
    // Upload file
    const fileName = await roomsListPage.UploadFile("docx", {
      title: "Test Document",
      content: "This is a test document for public room",
    });
    // Wait for file to appear
    await this.waitForFileInRoom(fileName);
    await this.page.waitForTimeout(2000);
    // Share room and get link
    await this.shareRoomWithAllUsers();
    const sharedLink = await this.getClipboardContent();
    // Open and verify in incognito
    const { incognitoContext, incognitoPage } = await this.openInIncognito(
      browser,
      sharedLink,
    );
    await this.verifyDocumentInIncognito(incognitoPage, roomName, fileName);
    await incognitoContext.close();
    return fileName;
  }

  async enableThirdPartyStorage() {
    await this.page.waitForTimeout(1000);
    await this.pubToggleButtonLocator.waitFor({ state: "visible" });
    await this.pubToggleButtonLocator.click();
  }
}

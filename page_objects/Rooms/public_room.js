import config from "../../config/config.js";

export class PublicRoomPage {
  constructor(page) {
    this.page = page;
    this.ownCloudButton = this.page.locator('[data-third-party-id="ownCloud"]');
    this.nextCloudButton = this.page.locator(
      '[data-third-party-id="Nextcloud"]',
    );
    this.webDavButton = this.page.locator('[data-third-party-id="WebDav"]');
    this.kDriveButton = this.page.locator('[data-third-party-id="kDrive"]');
    this.oneDriveButton = this.page.locator('[data-third-party-id="OneDrive"]');
    this.dropboxButton = this.page.locator('[data-third-party-id="Dropbox"]');
    this.boxButton = this.page.locator('[data-third-party-id="Box"]');
    // Pub Room functionality
    this.togglePublicRoomButton = this.page
      .getByTestId("toggle-button")
      .locator("circle");
    this.publicRoomSettingsBox = this.page
      .getByTestId("box")
      .getByTestId("combobox");
    this.connectStorageButton = this.page.locator(
      "#shared_third-party-storage_connect",
    );
    this.pubToggleButtonLocator = this.page
      .getByTestId("toggle-button")
      .locator("circle");
    this.createModalSubmitButton = this.page.locator(
      "#shared_create-room-modal_submit",
    );
  }

  async CreateButton() {
    await this.createModalSubmitButton.waitFor({
      state: "visible",
      timeout: 5000,
    });
    return await this.createModalSubmitButton.click();
  }

  async ConnectNextcloud() {
    await this.publicRoomSettingsBox.click();
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
}

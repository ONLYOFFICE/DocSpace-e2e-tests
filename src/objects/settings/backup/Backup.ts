import config from "@/config";
import { expect, Page } from "@playwright/test";
import {
  navItems,
  mapBackupMethodsIds,
  TBackupMethodsIds,
  TThirdPartyResource,
  TThirdPartyStorage,
  toastMessages,
} from "@/src/utils/constants/settings";
import { BackupLocators } from "./Locators";
import { BaseDropdown } from "../../common/BaseDropdown";
import { Integration } from "../integration/Integration";
import BaseSelector from "../../common/BaseSelector";
import BasePage from "../../common/BasePage";
import { waitForGetAuthServiceResponse } from "../api";

export class Backup extends BasePage {
  locators: BackupLocators;
  selector: BaseSelector;
  regionDropdown: BaseDropdown;
  thirdPartyDropdown: BaseDropdown;

  integration: Integration;

  constructor(page: Page) {
    super(page);
    this.locators = new BackupLocators(page);
    this.integration = new Integration(page);
    this.regionDropdown = new BaseDropdown(page, {
      menu: this.locators.regionDropdown,
    });
    this.thirdPartyDropdown = new BaseDropdown(page, {
      menu: this.locators.thirdPartyDropdown,
    });
    this.selector = new BaseSelector(page);
  }

  async open() {
    await this.navigateToSettings();
    await this.navigateToArticle(navItems.backup);
    await this.checkDataBackupExist();
  }

  private async checkDataBackupExist() {
    await expect(this.locators.backupModulesDescription).toHaveText(
      /Use this option .*/,
    );
  }

  private async checkAutoBackupExist() {
    await expect(this.locators.backupModulesDescription).toHaveText(
      /The Automatic backup .*/,
    );
  }

  async openTab(tab: "Data backup" | "Automatic backup") {
    await this.page.getByTestId(tab).click();

    switch (tab) {
      case "Data backup":
        await this.checkDataBackupExist();
        break;

      case "Automatic backup":
        await this.checkAutoBackupExist();
        break;

      default:
        throw new Error("Invalid tab");
    }
  }

  async navigateToAutoBackup() {
    await this.navigateToArticle(navItems.backup);
    await this.locators.autoBackupTub.click();
  }

  async openBackupGuide(hash: "CreatingBackup_block" | "AutoBackup") {
    const page1Promise = this.page.waitForEvent("popup");
    await this.locators.backupGuideLink.click();
    const page1 = await page1Promise;
    await expect(page1).toHaveURL(
      new RegExp(`.*\\.onlyoffice\\.com/docspace/configuration#${hash}`),
    );
    await page1.close();
  }

  async openThirdPartyDropdown() {
    await this.locators.thirdPartyDropdownButton.click();
    await this.page.waitForTimeout(500);
  }

  async openRegionDropdown() {
    await this.locators.regionCombobox.click();
  }

  async openRoomSelector() {
    await this.locators.selectRoom.click();
    await this.selector.checkSelectorExist();
  }

  async enableAutoBackup() {
    if (await this.locators.autoBackupSwitch.isChecked()) {
      return;
    }
    await this.locators.autoBackupSwitch.click();
  }

  async disableAutoBackup() {
    if (!(await this.locators.autoBackupSwitch.isChecked())) {
      return;
    }
    await this.locators.autoBackupSwitch.click();
    await this.locators.saveButton2.click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async selectDocuments() {
    await this.locators.forwardDocSpace.click();
    await this.locators.forwardDocuments.click();
    await this.locators.selectButton.click();
  }

  async backupRoom() {
    await this.enableAutoBackup();
    await this.openRoomSelector();
    await this.selectDocuments();
  }

  async openTimeSelector() {
    await this.locators.timeCombobox.click();
  }

  async selectTime() {
    await this.locators.selectTime.click();
  }

  async openNumberCopySelector() {
    await this.locators.numberCopyBox.click();
  }

  async openScheduleSelector() {
    await this.locators.selectSchedule.click();
  }

  async selectNumberCopy() {
    await this.locators.selectCopies.click();
  }

  async saveAutoSavePeriod() {
    await this.locators.saveButton2.click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async setBackupTimeAndCopies() {
    await this.openTimeSelector();
    await this.selectTime();
    await this.openNumberCopySelector();
    await this.selectNumberCopy();
  }

  async expectConnectButtonNotToBeDisabled() {
    await expect(this.locators.connectButton).toBeVisible();
    await expect(this.locators.connectButton).not.toBeDisabled();
  }

  async openDaySelector() {
    await this.locators.dayBox.click();
  }

  async selectDay() {
    await this.locators.selectDay.click();
  }

  async openMonthSelector() {
    await this.locators.monthSelectorBox.click();
  }

  async selectMonth() {
    await this.locators.selectMonth.click();
  }

  async createBackupInRoom() {
    await this.selectBackupMethod(mapBackupMethodsIds.backupRoom);
    await this.openRoomSelector();
    await this.locators.forwardDocSpace.click();
    await this.locators.forwardDocuments.click();
    await this.locators.selectButton.click();
    await this.locators.createCopyButton.click();
    await this.removeToast(toastMessages.backCopyCreated);
  }

  async activateAWSS3() {
    await this.navigateToArticle(navItems.integration);
    const response = waitForGetAuthServiceResponse(this.page);
    await this.page.getByTestId("Third-party services").click();
    await response;
    await this.integration.activateAWSS3();
    await this.removeToast(toastMessages.updatedSuccessfully);
  }

  async selectBackupMethod(method: TBackupMethodsIds) {
    await this.page.locator(method).click();
  }

  async selectThirdPartyStorage(selection: TThirdPartyStorage) {
    await this.thirdPartyDropdown.clickOption(selection);
  }

  async selectThirdPartyResource(selection: TThirdPartyResource) {
    await this.thirdPartyDropdown.clickOption(selection);
  }

  async fillConnectingAccount(url: string, login: string, password: string) {
    await this.locators.connectionUrlInput.fill(url);
    await this.locators.loginInput.fill(login);
    await this.locators.passwordInput.fill(password);
  }

  async fillConnectingNextcloudAccount() {
    if (
      !config.NEXTCLOUD_URL ||
      !config.NEXTCLOUD_LOGIN ||
      !config.NEXTCLOUD_PASSWORD
    ) {
      throw new Error("Nextcloud configuration is missing");
    }

    await this.fillConnectingAccount(
      config.NEXTCLOUD_URL,
      config.NEXTCLOUD_LOGIN,
      config.NEXTCLOUD_PASSWORD,
    );
  }

  async openActionMenuResource() {
    await this.locators.actionMenuResource.click();
  }

  async performActionOnResource(action: "Disconnect" | "Reconnect") {
    await this.page.getByText(action, { exact: true }).click();
  }

  async openDisconnectServiceDialog() {
    await this.performActionOnResource("Disconnect");
    await expect(
      this.page.getByText("Disconnect cloud", { exact: true }).nth(1),
    ).toBeVisible();
  }

  async confirmDisconnectService() {
    await this.page.getByLabel("OK").nth(1).click();
    await expect(
      this.page.getByText("Disconnect cloud", { exact: true }).nth(1),
    ).toBeHidden();
  }

  async disconnectService() {
    await this.openActionMenuResource();
    await this.openDisconnectServiceDialog();
    await this.confirmDisconnectService();
  }

  async Dropbox() {
    await this.selectBackupMethod(mapBackupMethodsIds.thirdPartyResource);
    await this.openThirdPartyDropdown();
    await this.locators.selectDropbox.click();
  }

  async connectDropbox() {
    if (!config.DROPBOX_LOGIN || !config.DROPBOX_PASS) {
      throw new Error("Dropbox configuration is missing");
    }

    const page1Promise = this.page.waitForEvent("popup");
    await this.locators.connectButton.click();
    const page1 = await page1Promise;
    await page1.locator('[name="susi_email"]').click();
    await page1.locator('[name="susi_email"]').fill(config.DROPBOX_LOGIN);
    await expect(page1.locator('[name="susi_email"]')).toHaveValue(
      config.DROPBOX_LOGIN,
    );
    await page1.getByRole("button", { name: "Continue", exact: true }).click();
    await page1.locator('[name="login_password"]').fill(config.DROPBOX_PASS);
    await expect(page1.locator('[name="login_password"]')).toHaveValue(
      config.DROPBOX_PASS,
    );
    await page1.getByTestId("login-form-submit-button").click();
  }

  async createBackupInService() {
    await this.openRoomSelector();
    await this.locators.selectButton.click();
    await this.locators.createCopyButton.click();
    await this.removeToast(toastMessages.backCopyCreated);
  }

  async selectDropboxAutoBackup() {
    await this.enableAutoBackup();
    await this.selectBackupMethod(mapBackupMethodsIds.thirdPartyResource);
    await this.openThirdPartyDropdown();
    await this.locators.selectDropbox.click();
  }

  async selectRoomForBackup() {
    await this.openRoomSelector();
    await this.selector.selectItemByIndex(0, true);
    await this.locators.saveHereButton.click();
    await this.locators.saveButtonAutoBackup.click();
    // FIXME: Change this on "removeSettingsUpdatedToast" when it is fixed
    await this.toast.removeAllToast();
  }

  async connectBox() {
    if (!config.BOX_LOGIN || !config.BOX_PASS) {
      throw new Error("Box configuration is missing");
    }

    const page1Promise = this.page.waitForEvent("popup");
    await this.locators.connectButton.click();
    const page1 = await page1Promise;
    await page1.waitForLoadState("load");
    await page1.getByPlaceholder("Email").fill(config.BOX_LOGIN);
    await expect(page1.getByPlaceholder("Email")).toHaveValue(config.BOX_LOGIN);
    await page1.getByPlaceholder("Password").fill(config.BOX_PASS);
    await expect(page1.getByPlaceholder("Password")).toHaveValue(
      config.BOX_PASS,
    );
    await page1.locator('input[name="login_submit"]').click();
    await page1
      .locator('button[data-target-id="Button-grantAccessButtonLabel"]')
      .click();
    await page1.waitForLoadState("domcontentloaded");
  }
}

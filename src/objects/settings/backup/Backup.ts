import config from "@/config";
import { expect, Page } from "@playwright/test";
import {
  navItems,
  mapBackupMethodsIds,
  TBackupMethodsIds,
  TAutoBackupMethodsIds,
  TThirdPartyResource,
  TThirdPartyStorage,
  toastMessages,
  integrationTabs,
} from "@/src/utils/constants/settings";
import { BackupLocators } from "./Locators";
import { BaseDropdown } from "../../common/BaseDropdown";
import { Integration } from "../integration/Integration";
import BaseSelector from "../../common/BaseSelector";
import BasePage from "../../common/BasePage";

export class Backup extends BasePage {
  locators: BackupLocators;
  selector: BaseSelector;
  regionDropdown: BaseDropdown;
  thirdPartyDropdown: BaseDropdown;
  autoThirdPartyDropdown: BaseDropdown;
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
    this.autoThirdPartyDropdown = new BaseDropdown(page, {
      menu: this.locators.autoThirdPartyDropdown,
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

  async openTab(tab: "Data backup" | "auto-backup_tab") {
    await this.page.getByTestId(tab).click();

    switch (tab) {
      case "Data backup":
        await this.checkDataBackupExist();
        break;

      case "auto-backup_tab":
        await this.checkAutoBackupExist();
        break;

      default:
        throw new Error("Invalid tab");
    }
  }

  async navigateToAutoBackup() {
    await this.navigateToArticle(navItems.backup);
    await this.locators.autoBackupTab.click();
  }

  async openBackupGuide() {
    const page1Promise = this.page.waitForEvent("popup");
    await this.locators.backupGuideLink.click();
    const page1 = await page1Promise;
    await expect(page1).toHaveURL(
      new RegExp(
        `https://helpcenter\\.onlyoffice\\.com/docspace/configuration/docspace-backup-restore-settings\\.aspx#creatingbackup_block`,
      ),
    );
    await page1.close();
  }

  async openAutoBackupGuide() {
    const page1Promise = this.page.waitForEvent("popup");
    await this.locators.autoBackupGuideLink.click();
    const page1 = await page1Promise;
    await expect(page1).toHaveURL(
      new RegExp(
        `https://helpcenter\\.onlyoffice\\.com/docspace/configuration/docspace-backup-restore-settings\\.aspx#automaticbackup_block`,
      ),
    );
    await page1.close();
  }

  async openThirdPartyDropdown() {
    await this.locators.thirdPartyDropdownButton.click();
    await this.page.waitForTimeout(500);
  }

  // async openThirdPartyDropdownAutoBackup() {
  //   await this.locators.thirdPartyDropdownButtonAutoBackup.click();
  //   await this.page.waitForTimeout(500);
  // }

  async openRegionDropdown() {
    await this.locators.regionCombobox.click();
  }

  private async findRegionOption(regionLabel: string) {
    const dropdown = this.locators.regionDropdown;
    const option = dropdown.getByRole("option", {
      name: regionLabel,
      exact: true,
    });

    const collectVisibleOptions = async () => {
      const visibleOptions = dropdown.locator('[role="option"]');
      return (await visibleOptions.allTextContents())
        .map((text) => text.trim())
        .filter(Boolean);
    };

    let collected = await collectVisibleOptions();
    if ((await option.count()) > 0) {
      return { option, collected };
    }

    const scroller = dropdown.locator('[data-testid="scroller"]').first();
    if ((await scroller.count()) === 0) {
      return { option, collected };
    }

    for (let i = 1; i <= 40; i++) {
      await scroller.evaluate((el) => {
        el.scrollTop += 260;
      });
      await this.page.waitForTimeout(120);
      const texts = await collectVisibleOptions();
      if (texts.length > 0) {
        collected = Array.from(new Set([...collected, ...texts]));
      }
      if ((await option.count()) > 0) {
        return { option, collected };
      }
    }

    return { option, collected };
  }

  async selectRegion(regionLabel: string) {
    await this.openRegionDropdown();
    const { option, collected } = await this.findRegionOption(regionLabel);
    if ((await option.count()) === 0) {
      throw new Error(
        `Region option not found: "${regionLabel}". Available: ${Array.from(
          collected,
        ).join(" | ")}`,
      );
    }
    await this.regionDropdown.clickOption(regionLabel);
    await expect(this.locators.regionCombobox).toContainText(regionLabel);
  }

  async openRoomSelector() {
    await expect(this.locators.selectRoom).toBeVisible();
    await this.locators.selectRoom.click();
    await this.selector.checkSelectorExist();
  }

  async enableAutoBackup() {
    await this.locators.autoBackupSwitch.click();
  }

  async disableAutoBackup() {
    await this.locators.autoBackupSwitch.click();
    await this.locators.saveAutoBackupButton.click();
    await this.dismissToastSafely(toastMessages.settingsUpdated);
  }

  async selectDocuments() {
    await this.locators.forwardDocuments.click();
    await this.selector.checkSelectorAddButtonExist();
    await this.locators.selectButton.click();
  }

  async selectDocumentsNextCloud() {
    await this.locators.forwardDocumentsNextCloud.click();
    await this.locators.selectButton.click();
    await this.locators.thirdPartyCreateCopyButton.click();
  }

  async selectDocumentsNextCloudAutoBackup() {
    await this.locators.forwardDocumentsNextCloud.click();
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
    await this.locators.saveAutoBackupButton.click();
    await this.dismissToastSafely(toastMessages.settingsUpdated);
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
    await this.dismissToastSafely(toastMessages.backCopyCreated);
  }

  async activateAWSS3() {
    await this.navigateToArticle(navItems.integration);
    await this.integration.openTab(integrationTabs.thirdPartyServices);
    await this.integration.s3SwitchClick();
    await this.integration.activateAWSS3();
  }

  async selectBackupMethod(method: TBackupMethodsIds) {
    const option = this.page.getByTestId(method);
    await expect(option).toBeVisible();
    await expect(option).toBeEnabled();
    await option.click();
  }

  async selectAutoBackupMethod(method: TAutoBackupMethodsIds) {
    await this.page.getByTestId(method).click();
  }

  async selectThirdPartyStorage(selection: TThirdPartyStorage) {
    await this.thirdPartyDropdown.clickOption(selection);
  }

  async selectThirdPartyResource(selection: TThirdPartyResource) {
    await this.thirdPartyDropdown.clickOption(selection);
  }

  async selectAutoThirdPartyResource(selection: TThirdPartyResource) {
    await this.autoThirdPartyDropdown.clickOption(selection);
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
    await this.page.waitForTimeout(500); // temp plug
  }

  async openActionMenuResourceAutoBackup() {
    await this.locators.actionMenuResourceAutoBackup.click();
    await this.page.waitForTimeout(500); // temp plug
  }

  // async performActionOnResource(action: "Disconnect" | "Reconnect") {
  //   await this.page.getByText(action, { exact: true }).click();
  // }

  // async openDisconnectServiceDialog() {
  //   await this.performActionOnResource("Disconnect");
  //   await expect(
  //     this.page.getByText("Disconnect cloud", { exact: true }).nth(1),
  //   ).toBeVisible();
  // }

  // async confirmDisconnectService() {
  //   await this.page.getByLabel("OK").nth(1).click();
  //   await expect(
  //     this.page.getByText("Disconnect cloud", { exact: true }).nth(1),
  //   ).toBeHidden();
  // }

  async disconnectService() {
    await this.locators.disconnectButton.click();
    await this.locators.okButton.click();
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
    await this.locators.thirdPartyCreateCopyButton.click();
    await this.dismissToastSafely(toastMessages.backCopyCreated);
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
    await this.locators.saveAutoBackupButton.click();
    await this.dismissToastSafely(toastMessages.settingsUpdated);
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
    const grantAccessButton = page1.locator(
      'button[data-target-id="Button-grantAccessButtonLabel"]',
    );
    await expect(grantAccessButton).toBeVisible();
    await grantAccessButton.click();
    await page1.waitForLoadState("domcontentloaded");
  }

  async connectBoxAutoBackup() {
    if (!config.BOX_LOGIN || !config.BOX_PASS) {
      throw new Error("Box configuration is missing");
    }

    const page1Promise = this.page.waitForEvent("popup");
    await this.locators.connectButtonAutoBackup.click();
    const page1 = await page1Promise;
    await page1.waitForLoadState("load");
    await page1.getByPlaceholder("Email").fill(config.BOX_LOGIN);
    await expect(page1.getByPlaceholder("Email")).toHaveValue(config.BOX_LOGIN);
    await page1.getByPlaceholder("Password").fill(config.BOX_PASS);
    await expect(page1.getByPlaceholder("Password")).toHaveValue(
      config.BOX_PASS,
    );
    await page1.locator('input[name="login_submit"]').click();
    const grantAccessButton = page1.locator(
      'button[data-target-id="Button-grantAccessButtonLabel"]',
    );
    await expect(grantAccessButton).toBeVisible();
    await grantAccessButton.click();
    await page1.waitForLoadState("domcontentloaded");
  }

  async openThirdPartyServiceAutoBackup() {
    await expect(
      this.locators.thirdPartyDropdownButtonAutoBackup,
    ).toBeVisible();
    await expect(async () => {
      await this.locators.thirdPartyDropdownButtonAutoBackup.click();
      await expect(this.locators.autoThirdPartyDropdown).toBeVisible();
    }).toPass();
  }
}

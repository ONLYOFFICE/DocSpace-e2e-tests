import { Page } from "@playwright/test";

export class BackupLocators {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get backupGuideLink() {
    return this.page.getByTestId("creating_backup_learn_link");
  }

  get autoBackupGuideLink() {
    return this.page.getByTestId("automatic_backup_learn_link");
  }
  get autoBackupTab() {
    return this.page.getByTestId("auto-backup_tab");
  }
  get autoBackupSwitch() {
    return this.page
      .getByTestId("enable_automatic_backup_button")
      .getByTestId("toggle-button-container");
  }
  get selectRoom() {
    return this.page.getByTestId("file-input");
  }

  get backupModulesDescription() {
    return this.page.locator(".backup_modules-description");
  }

  get forwardDocSpace() {
    return this.page.getByTestId("selector").getByText("DocSpace");
  }
  get forwardDocumentsNextCloud() {
    return this.page.locator('[data-testid^="selector-item-"]', {
      hasText: "Documents",
    });
  }

  get forwardDocuments() {
    return this.page.getByTestId("selector-item-0").getByTestId("text");
  }

  get combobox() {
    return this.page.getByTestId("combobox");
  }

  get selectButton() {
    return this.page.getByTestId("selector_submit_button");
  }
  get timeCombobox() {
    return this.page.getByTestId("auto_backup_time_combobox");
  }
  get selectTime() {
    return this.page
      .getByTestId("drop_down_item_6")
      .filter({ hasText: "6:00" });
  }
  get numberCopyBox() {
    return this.page.getByTestId("auto_backup_max_copies_combobox");
  }
  get selectCopies() {
    return this.page
      .getByTestId("drop_down_item_6")
      .filter({ hasText: "6 - maximum number of backup copies" });
  }
  get selectSchedule() {
    return this.page.getByTestId("auto_backup_period_combobox");
  }

  get saveButton() {
    return this.page.getByTestId("connect_dialog_save_button");
  }
  get saveAutoBackupButton() {
    return this.page.getByTestId("auto_backup_storage_save_button");
  }

  get cancelAutoBackupButton() {
    return this.page.getByTestId("auto_backup_storage_cancel_button");
  }

  get selectEveryWeek() {
    return this.page
      .getByTestId("auto_backup_period_dropdown")
      .getByTestId("drop_down_item_1");
  }
  get dayBox() {
    return this.page.getByTestId("auto_backup_weekday_combobox");
  }
  get selectDay() {
    return this.page
      .getByTestId("auto_backup_weekday_dropdown")
      .getByTestId("drop_down_item_5");
  }
  get monthBox() {
    return this.page.locator(".schedule-backup_combobox.monthly_option");
  }
  get selectEveryMonth() {
    return this.page
      .getByTestId("auto_backup_period_dropdown")
      .getByTestId("drop_down_item_2");
  }
  get monthSelectorBox() {
    return this.page.getByTestId("auto_backup_month_combobox");
  }
  get selectMonth() {
    return this.page
      .getByTestId("auto_backup_month_dropdown")
      .getByTestId("drop_down_item_6");
  }
  get createBackupButton() {
    return this.page.getByTestId("create_temporary_backup_button");
  }
  get createCopyButton() {
    return this.page.getByTestId("create_backup_room_button");
  }

  get createAmazonCopyButton() {
    return this.page.getByTestId("amazon_create_copy_button");
  }

  get thirdPartyCreateCopyButton() {
    return this.page.getByTestId("third_party_create_copy_button");
  }

  get bucketInput() {
    return this.page.getByTestId("amazon-bucket-input");
  }
  get regionCombobox() {
    return this.page.getByTestId("amazon_settings_region_combobox");
  }

  get thirdPartyDropdown() {
    return this.page.getByTestId("manual_backup_accounts_dropdown");
  }

  get thirdPartyDropdownButton() {
    return this.page.locator('[data-test-id="combo-button"][role="button"]');
  }

  get thirdPartyDropdownButtonAutoBackup() {
    return this.page.getByTestId("auto_backup_accounts_combobox");
  }

  get regionDropdown() {
    return this.page.getByTestId("amazon_settings_region_dropdown");
  }

  get scrollContainer() {
    return this.page.locator(".ScrollbarsCustom-Content");
  }

  get selectNextcloud() {
    return this.page.getByTestId("drop-down-item").getByText("Nextcloud");
  }
  get connectButton() {
    return this.page.getByTestId("manual_backup_connect_account_button");
  }

  get connectButtonAutoBackup() {
    return this.page.getByTestId("auto_backup_connect_account_button");
  }
  get connectionUrlInput() {
    return this.page.locator("#connection-url-input");
  }
  get loginInput() {
    return this.page.locator("#login-input");
  }
  get passwordInput() {
    return this.page.getByTestId("input-block").getByTestId("text-input");
  }
  get selectNextCloudRepo() {
    return this.page.getByTestId("selector-item-1");
  }
  get saveHereButton() {
    return this.page.getByTestId("selector_submit_button");
  }

  get actionMenuResource() {
    return this.page.getByTestId("manual_backup_accounts_context_button");
  }

  get actionMenuResourceAutoBackup() {
    return this.page.getByTestId("auto_backup_accounts_context_button");
  }

  get reconnectButton() {
    return this.page.getByTestId("connection_settings_option");
  }

  get disconnectButton() {
    return this.page.getByTestId("disconnect_settings_option");
  }

  get okButton() {
    return this.page.getByTestId("delete_third_party_button");
  }

  get selectDropbox() {
    return this.page
      .getByTestId("drop-down-item")
      .filter({ hasText: "Dropbox" });
  }

  get autoThirdPartyDropdown() {
    return this.page.getByTestId("auto_backup_accounts_dropdown");
  }
}

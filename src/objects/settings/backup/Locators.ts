import { Page } from "@playwright/test";

export class BackupLocators {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get navigateToBackup() {
    return this.page.getByRole("link", { name: "Backup" });
  }
  get backupGuideLink() {
    return this.page.getByTestId("link");
  }
  get autoBackupTab() {
    return this.page.getByText("Automatic backup");
  }
  get autoBackupSwitch() {
    return this.page
      .locator(".backup_toggle-wrapper")
      .getByTestId("toggle-button-icon");
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
  get forwardDocuments() {
    return this.page
      .getByTestId("selector")
      .getByRole("paragraph")
      .filter({ hasText: "Documents" });
  }

  get combobox() {
    return this.page.getByTestId("combobox");
  }

  get selectButton() {
    return this.page.getByRole("button", { name: "Select" });
  }
  get timeCombobox() {
    return this.combobox.and(
      this.page.locator(".schedule-backup_combobox.time_options"),
    );
  }
  get selectTime() {
    return this.page.getByText("6:00");
  }
  get numberCopyBox() {
    return this.combobox.and(
      this.page.locator(".schedule-backup_combobox.max_copies"),
    );
  }
  get selectCopies() {
    return this.page
      .getByTestId("drop-down-item")
      .filter({ hasText: "6 - maximum number of backup copies" });
  }
  get selectSchedule() {
    return this.page.locator(".schedule-backup_combobox.days_option");
  }

  get autoBackupButtons() {
    return this.page.locator(".auto-backup_buttons");
  }

  get saveButton() {
    return this.page.locator('#save[data-testid="button"]');
  }
  get saveButton2() {
    return this.autoBackupButtons.getByRole("button", { name: "Save" });
  }
  get cancelButton() {
    return this.autoBackupButtons.getByRole("button", { name: "Cancel" });
  }
  get selectEveryWeek() {
    return this.page.getByText("Every week");
  }
  get dayBox() {
    return this.combobox.and(
      this.page.locator(".schedule-backup_combobox.weekly_option"),
    );
  }
  get selectDay() {
    return this.page.getByText("Friday");
  }
  get monthBox() {
    return this.combobox.and(
      this.page.locator(".schedule-backup_combobox.monthly_option"),
    );
  }
  get selectEveryMonth() {
    return this.page
      .getByTestId("drop-down-item")
      .filter({ hasText: "Every month" });
  }
  get monthSelectorBox() {
    return this.combobox.and(
      this.page.locator(".schedule-backup_combobox.month_options"),
    );
  }
  get selectMonth() {
    return this.page
      .getByTestId("drop-down-item")
      .filter({ hasText: /^6$/ })
      .nth(0);
  }
  get createBackupButton() {
    return this.page.getByTestId("button").filter({ hasText: "Create" });
  }
  get createCopyButton() {
    return this.page.getByTestId("button").filter({ hasText: "Create copy" });
  }
  get bucketInput() {
    return this.page.locator("#bucket-input");
  }
  get regionCombobox() {
    return this.combobox.and(this.page.locator(".region-combo-box"));
  }

  get thirdPartyDropdown() {
    return this.page.locator(".dropdown-container").nth(0);
  }
  get thirdPartyDropdownButton() {
    return this.page.locator(".backup_connection").locator(".combo-button");
  }

  get regionDropdown() {
    return this.page.locator(".dropdown-container").nth(1);
  }

  get scrollContainer() {
    return this.page.locator(".ScrollbarsCustom-Content");
  }

  get selectNextcloud() {
    return this.page.getByTestId("drop-down-item").getByText("Nextcloud");
  }
  get connectButton() {
    return this.page.getByTestId("button").filter({ hasText: "Connect" });
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
    return this.page
      .getByTestId("selector")
      .getByRole("paragraph")
      .filter({ hasText: "Documents" });
  }
  get saveHereButton() {
    return this.page.getByRole("button", { name: "Save here" });
  }
  get saveButtonAutoBackup() {
    return this.page.getByRole("button", { name: "Save", exact: true });
  }
  get actionMenuResource() {
    return this.page.getByTestId("context-menu-button");
  }
  get disconnectButton() {
    return this.page.getByText("Disconnect");
  }

  get selectDropbox() {
    return this.page
      .getByTestId("drop-down-item")
      .filter({ hasText: "Dropbox" });
  }
}

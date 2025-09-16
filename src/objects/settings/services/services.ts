import { expect, Page } from "@playwright/test";
import BasePage from "@/src/objects/common/BasePage";
import { navItems } from "@/src/utils/constants/settings";
import BaseTable, { TBaseTableLocators } from "../../common/BaseTable";
import { Payments } from "@/src/objects/settings/payments/Payments";
import BaseDialog from "../../common/BaseDialog";

class Services extends BasePage {
  table: BaseTable;
  dialog: BaseDialog;
  constructor(page: Page) {
    super(page);
    this.table = new BaseTable(this.page, this.tableLocators);
    this.dialog = new BaseDialog(this.page);
  }

  get tableLocators(): TBaseTableLocators {
    return {
      tableRows: this.page.locator(".table-container_row"),
    };
  }

  get payments() {
    return new Payments(this.page);
  }

  get backupSwitch() {
    return this.page.getByTestId("storage_service_backup_toggle");
  }

  get backupSwitchModal() {
    return this.page
      .getByTestId("service-backup-toggle-button")
      .getByTestId("toggle-button-icon");
  }

  get continueButton() {
    return this.page.getByTestId("service-confirmation-dialog-continue-button");
  }

  get closeButton() {
    return this.page.getByTestId("service-confirmation-dialog-close-button");
  }

  get closeBackupServiceModal() {
    return this.page.getByTestId("service-backup-dialog-close-button");
  }

  get backupService() {
    return this.page.getByTestId("storage_service_backup");
  }

  get diskStorageSwitch() {
    return this.page.getByTestId("storage_service_total_size_toggle");
  }

  get diskStorageBlock() {
    return this.page.getByTestId("storage_service_total_size");
  }

  get diskStorageCancelButton() {
    return this.page.getByTestId("storage_plan_upgrade_cancel_button");
  }

  get addStorageInput() {
    return this.page.getByTestId("quantity_picker_input");
  }

  get minusButton() {
    return this.page.getByTestId("quantity_picker_minus_icon");
  }

  get plusButton() {
    return this.page.getByTestId("quantity_picker_plus_icon");
  }

  get plus100Button() {
    return this.page.getByTestId("add_100_tab_item");
  }

  get plus200Button() {
    return this.page.getByTestId("add_200_tab_item");
  }

  get plus500Button() {
    return this.page.getByTestId("add_500_tab_item");
  }

  get plus1TButton() {
    return this.page.getByTestId("add_1024_tab_item");
  }

  get topUpLink() {
    return this.page.getByTestId("top_up_wallet_link");
  }

  get backTopUpButton() {
    return this.page.getByTestId("aside_header_back_icon_button");
  }

  get buyButton() {
    return this.page.getByTestId("storage_plan_upgrade_ok_button");
  }

  get cancelChangeLink() {
    return this.page.getByTestId("storage_summary_cancel_change_link");
  }

  get infoButton() {
    return this.page.getByTestId("payer_info_help_button");
  }

  get curentPaymentBlock() {
    return this.page.getByTestId("text").filter({ hasText: "Subscription will be automatically renewed" });
  }

  async open() {
    await this.navigateToSettings();
    await this.navigateToArticle(navItems.services);
  }

  async checkServicesRendered() {
    await expect(
      this.page.getByTestId("storage_service_total_size"),
    ).toContainText("Additional disk storage");
  }

  async addPaymentsMethod(stripePage: Page) {
    await this.payments.addPaymentsMethod(stripePage);
    await this.payments.fillPaymentDataFromAddPaymentMethodServices(stripePage);
    await expect(this.page.getByText("Card linked")).toBeVisible();
    await this.payments.fillAmountTopUpForServices();
    await this.payments.topUpButton.click();
  }

  async openTopUpWalletModal() {
    await this.backupSwitch.click();
    await this.dialog.checkDialogTitleExist("Top up wallet");
  }

  async openBackupServiceModal() {
    await this.backupService.click();
    await this.dialog.checkDialogTitleExist("Backup");
  }

  async openDiskStorageModal() {
    await this.diskStorageSwitch.click();
    await this.dialog.checkDialogTitleExist("Disk storage");
  }

  async clickSwitchInBackupServiceModal() {
    await this.backupService.click();
    await this.backupSwitchModal.click();
    await this.dialog.checkDialogTitleExist("Top up wallet");
  }

  async checkAdditionalStorage() {
    await this.addStorageInput.click();
    await this.addStorageInput.fill("200");
    await expect(this.addStorageInput).toHaveValue("200");
    await this.plusButton.click();
    await expect(this.addStorageInput).toHaveValue("201");
    await this.minusButton.click();
    await expect(this.addStorageInput).toHaveValue("200");
    await this.plus100Button.click();
    await expect(this.addStorageInput).toHaveValue("300");
    await this.plus200Button.click();
    await expect(this.addStorageInput).toHaveValue("500");
    await this.plus500Button.click();
    await expect(this.addStorageInput).toHaveValue("1000");
    await this.plus1TButton.click();
    await expect(this.addStorageInput).toHaveValue("2024");
  }

  async topUpLinkClick() {
    await this.topUpLink.click();
    await this.dialog.checkDialogTitleExist("Top up wallet");
  }

  async selectDiskStorage() {
    await this.diskStorageSwitch.click();
    await this.plus200Button.click();
  }

  async changeDiskStorageMinus() {
    await this.diskStorageBlock.click();
    await this.minusButton.click();
  }

  async changeDiskStoragePlus() {
    await this.diskStorageBlock.click();
    await this.plusButton.click();
  }

  async activateBackupService() {
    await this.navigateToArticle(navItems.services);
    await this.backupSwitch.click();
    await this.continueButton.click();
  }

  async hideDateCurrentPayment() {
    await this.curentPaymentBlock.evaluate((el) => {
        const textElement = el.querySelector('[data-testid="text"]') || el;
        if (textElement) {
            // Remove any date between "on" and "with"
            textElement.innerHTML = textElement.innerHTML.replace(
                /on [^w]+ with/g,
                'on with'
            );
        }
    });
  }
}

export default Services;

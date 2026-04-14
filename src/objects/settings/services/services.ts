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

  get backupActiveToggle() {
    return this.page
      .locator('[class*="serviceToggleSection"]')
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

  get aiToggle() {
    return this.page.getByTestId("storage_service_aitools_toggle");
  }

  get aiAmountInput() {
    return this.page.getByTestId("top_up_amount_input");
  }

  get aiTopUpButton() {
    return this.page.getByTestId("top_up_button");
  }

  get aiCancelButton() {
    return this.page.getByTestId("cancel_top_up_button");
  }

  get infoButton() {
    return this.page.getByTestId("payer_info_help_button");
  }

  get curentPaymentBlock() {
    return this.page
      .getByTestId("text")
      .filter({ hasText: "Subscription will be automatically renewed" });
  }

  async open() {
    await this.navigateToSettings();
    await this.navigateToArticle(navItems.billing);
    await this.page.getByTestId("services_tab").click();
  }

  async checkServicesRendered() {
    await expect(
      this.page.getByTestId("storage_service_total_size"),
    ).toContainText("Additional disk storage");
  }

  async addPaymentsMethod(stripePage: Page) {
    await this.payments.addPaymentsMethod(stripePage);
    await this.payments.fillPaymentDataFromAddPaymentMethodServices(stripePage);
    await expect(this.page.getByText("Card linked")).toBeVisible({
      timeout: 60000,
    });
    await this.payments.fillAmountTopUpForServices();
    await this.payments.topUpButton.click();
  }

  async openAiCreditsModal() {
    await this.aiToggle.click();
    await this.dialog.checkDialogTitleExist("Add credits to ONLYOFFICE AI");
  }

  async selectAiAmountTab(amount: string) {
    await this.page.getByTestId(`tab_item_${amount}`).click();
  }

  async openTopUpWalletModal() {
    await this.backupSwitch.click();
    await this.dialog.checkDialogTitleExist("Top up wallet");
  }

  async openBackupConfirmationModal() {
    await this.backupSwitch.click();
    await this.dialog.checkDialogTitleExist("Confirmation");
  }

  async openDiskStorageModal() {
    await this.diskStorageSwitch.click();
    await this.dialog.checkDialogTitleExist("Additional disk storage");
  }

  get diskStorageInput() {
    return this.page.getByTestId("modal-dialog").getByTestId("text-input");
  }

  async fillDiskStorageAmount(amount: string) {
    await this.diskStorageInput.click();
    await this.diskStorageInput.fill(amount);
    await expect(this.diskStorageInput).toHaveValue(amount);
  }

  async topUpLinkClick() {
    await this.topUpLink.click();
    await this.dialog.checkDialogTitleExist("Top up wallet");
  }

  async selectDiskStorage(amount: string) {
    await this.diskStorageSwitch.click();
    await this.fillDiskStorageAmount(amount);
  }

  async changeDiskStorage(amount: string) {
    await this.diskStorageBlock.click();
    await this.fillDiskStorageAmount(amount);
  }

  async waitForDiskStoragePage() {
    await this.page.waitForURL(/.*disk-storage.*/, { waitUntil: "load" });
  }

  async checkCurrentSubscriptionVisible() {
    await expect(this.page.getByText("Current subscription")).toBeVisible();
  }

  async waitForAiServicesPage() {
    await this.page.waitForURL(/.*ai-services.*/, { waitUntil: "load" });
  }

  async checkAiCreditsVisible() {
    await expect(this.page.getByText("Available credits")).toBeVisible();
  }

  async activateBackupService() {
    await this.navigateToSettings();
    await this.navigateToArticle(navItems.billing);
    await this.page.getByTestId("services_tab").click();
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
          "on with",
        );
      }
    });
  }
}

export default Services;

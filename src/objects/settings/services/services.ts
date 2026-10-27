import { expect, Page } from "@playwright/test";
import BasePage from "@/src/objects/common/BasePage";
import BaseTable, { TBaseTableLocators } from "../../common/BaseTable";
import { Payments } from "@/src/objects/settings/payments/Payments";
import BaseDialog from "../../common/BaseDialog";

// AI search id in servicestate requests
const AI_SEARCH_SERVICE = -18;

// Add-on ids as used in storage_service_<id> test ids
type TAddonId = "aitools" | "aisearch" | "backup" | "total_size" | "docscloud";

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

  get serviceActiveToggle() {
    return this.page
      .locator('[class*="serviceToggleSection"]')
      .getByTestId("toggle-button-icon");
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

  get diskStorageCancelOkButton() {
    return this.page.getByTestId("storage_plan_cancel_ok_button");
  }

  get diskStorageSettingsIcon() {
    return this.page.locator('[class*="settingsIcon"]');
  }

  get cancelSubscriptionMenuItem() {
    return this.page.getByRole("menuitem", { name: "Cancel subscription" });
  }

  get editSubscriptionMenuItem() {
    return this.page.getByRole("menuitem", { name: "Edit subscription" });
  }

  get downloadReportButton() {
    return this.page.getByTestId("download_report_button");
  }

  get subscriptionCancellationWarning() {
    return this.page.getByText("Change scheduled: Subscription cancellation");
  }

  async downloadReport() {
    const editorPromise = this.page.waitForEvent("popup", { timeout: 30000 });
    await this.downloadReportButton.click();
    const editor = await editorPromise;
    await editor.waitForURL("https://*.onlyoffice.io/doceditor?*");
    await editor.close();
  }

  async checkCancellationScheduled() {
    await expect(this.subscriptionCancellationWarning).toBeVisible();
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
    return this.page
      .getByTestId("text")
      .filter({ hasText: "Subscription will be automatically renewed" });
  }

  async open() {
    const url = new URL("/billing/addons", this.page.url());
    await this.page.goto(url.toString(), { waitUntil: "load" });
    await expect(this.backupService).toBeVisible();
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

  async openTopUpWalletModal() {
    await this.backupSwitch.click();
    await this.dialog.checkDialogTitleExist("Top up wallet");
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

  addonToggle(id: TAddonId) {
    return this.page.getByTestId(`storage_service_${id}_toggle`);
  }

  // Clicks an add-on toggle and waits for the service state request
  async switchAddon(id: TAddonId, enabled: boolean) {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.request().method() === "POST" &&
          resp.url().includes("/api/2.0/portal/payment/servicestate") &&
          resp.request().postDataJSON()?.enabled === enabled,
      ),
      this.addonToggle(id).click(),
    ]);
    expect(response.status()).toBe(200);
  }

  async expectAddonEnabled(id: TAddonId, enabled: boolean) {
    await expect(this.addonToggle(id)).toHaveAttribute(
      "aria-checked",
      String(enabled),
    );
  }

  // "AI Search requires AI agents & tools" dialog
  // Activate turns on AI features and then AI search (two requests)
  async activateAiFeaturesForAiSearch() {
    await expect(
      this.page.getByText("AI Search requires AI agents & tools."),
    ).toBeVisible();
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.request().method() === "POST" &&
          resp.url().includes("/api/2.0/portal/payment/servicestate") &&
          resp.request().postDataJSON()?.service === AI_SEARCH_SERVICE,
      ),
      this.page
        .getByTestId("service-confirmation-dialog-continue-button")
        .click(),
    ]);
    expect(response.status()).toBe(200);
  }

  async startDocsConnectTrial() {
    await this.addonToggle("docscloud").click();
    await this.page
      .getByRole("button", { name: "Start free 30-day trial" })
      .click();
    await this.page.waitForURL(/\/developer-tools\/docs-connect/);
  }

  async expectDocsConnectTrialActive(daysLeft: number) {
    const card = this.page.getByTestId("storage_service_docscloud");
    await this.expectAddonEnabled("docscloud", true);
    await expect(card.locator('[data-disabled="true"]')).toBeVisible();
    await expect(card).toContainText(`${daysLeft} Free days left`);
  }

  // Billing with data: a linked card and a Disk storage subscription
  // (the wallet must already be topped up)
  async linkCardAndSubscribeToDiskStorage() {
    await this.open();
    await this.payments.linkPaymentMethod();
    await this.open();
    await this.subscribeToDiskStorage("200");
  }

  // Buys the Disk storage add-on from the Add-ons page (charges the wallet)
  async subscribeToDiskStorage(amount: string) {
    await this.selectDiskStorage(amount);
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.request().method() === "PUT" &&
          resp.url().includes("/api/2.0/portal/payment/updatewallet"),
      ),
      this.buyButton.click(),
    ]);
    expect(response.status()).toBe(200);
    await this.waitForDiskStoragePage();
  }

  async checkCurrentSubscriptionVisible() {
    await expect(
      this.page.getByText("Current subscription", { exact: true }),
    ).toBeVisible();
  }

  async checkDiskStorageSubscriptionSize(gb: string) {
    await expect(
      this.page.getByText(`${gb} GB`, { exact: true }),
    ).toBeVisible();
  }

  async activateBackupService() {
    await this.open();
    if ((await this.backupSwitch.getAttribute("aria-checked")) !== "true") {
      await this.backupSwitch.click();
    }
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

import { expect, Page } from "@playwright/test";
import BasePage from "../../common/BasePage";
import {
  navItems,
  paymentsTab,
  TPaymentsTab,
  TTransactionHistoryFilter,
} from "@/src/utils/constants/settings";
import BaseDialog from "../../common/BaseDialog";
import BaseTable from "../../common/BaseTable";
export class Payments extends BasePage {
  portalUrl: string;
  dialog: BaseDialog;
  table: BaseTable;

  constructor(page: Page) {
    super(page);
    this.portalUrl = page.url();
    this.dialog = new BaseDialog(page);
    this.table = new BaseTable(page);
  }

  get numberOfadmins() {
    return this.page.getByTestId("text-input");
  }

  get minusButton() {
    return this.page.locator("[data-operation='minus']");
  }
  get plusButton() {
    return this.page.locator("[data-operation='plus']");
  }
  get approveButton() {
    return this.page.getByTestId("button");
  }

  get linkVerificationBlock() {
    return this.page.locator(".LinkVerificationBody");
  }

  get topUpBalanceButton() {
    return this.page.getByRole("button", {
      name: "Top up balance",
    });
  }

  get businessPlanUpdated() {
    return this.page.getByText("You are using Business plan");
  }

  get priceCalculationContainer() {
    return this.page.locator(".price-calculation-container");
  }
  get numberOfAdminsSlider() {
    return this.page.getByTestId("slider");
  }

  get numberOfAdminsInput() {
    return this.priceCalculationContainer.getByTestId("text-input");
  }

  get stripeCustomerPortalLink() {
    return this.page.locator(".payer-info_account-link");
  }

  get configureDocSpaceLink() {
    return this.page
      .getByRole("link", {
        name: "Learn more",
      })
      .nth(0);
  }

  get currentTariffCount() {
    return this.page.locator(".current-tariff_count").nth(1);
  }

  get requestNameInput() {
    return this.page.locator("#your-name");
  }

  get requestEmailInput() {
    return this.page.locator("#registration-email");
  }

  get requestDetailsInput() {
    return this.page.locator("#request-details");
  }

  get reguestSendButton() {
    return this.page.locator(".send-button");
  }

  get goToStripeLink() {
    return this.page.getByText("Go to the Stripe", {
      exact: true,
    });
  }

  get saveAutomaticPaymentsButton() {
    return this.page.getByRole("button", {
      name: "Save",
    });
  }

  get plus10Button() {
    return this.page.locator("[data-id='10']");
  }
  get plus20Button() {
    return this.page.locator("[data-id='20']");
  }
  get plus30Button() {
    return this.page.locator("[data-id='30']");
  }
  get plus50Button() {
    return this.page.locator("[data-id='50']");
  }
  get plus100Button() {
    return this.page.locator("[data-id='100']");
  }

  get datePickerFromButton() {
    return this.page
      .getByTestId("date-picker")
      .nth(0)
      .getByTestId("selected-label");
  }

  get datePickerToButton() {
    return this.page
      .getByTestId("date-picker")
      .nth(1)
      .getByTestId("selected-label");
  }

  get amountTopUpInput() {
    return this.page.getByPlaceholder("Enter an integer amount...");
  }

  get topUpButton() {
    return this.page.getByRole("button", {
      name: "Top up",
      exact: true,
    });
  }

  get automaticPaymentsSwitch() {
    return this.page.getByTestId("toggle-button-container").nth(0);
  }

  get automaticPaymentsBlock() {
    return this.page.getByText(/Automatically top up my card */).locator("..");
  }

  get balanceGoesBelowInput() {
    return this.automaticPaymentsBlock.getByTestId("text-input").nth(0);
  }

  get creditBackUpToInput() {
    return this.automaticPaymentsBlock.getByTestId("text-input").nth(1);
  }

  get editAutoTopUpButton() {
    return this.page.getByRole("button", {
      name: "Edit",
    });
  }

  get editAutoTopUpLink() {
    return this.page.locator('a:has-text("Edit")');
  }

  get transactionHistorySelectorButton() {
    return this.page.locator("[data-test-id='combo-button']").nth(0);
  }

  get calendar() {
    return this.page.getByTestId("calendar");
  }

  get emptyViewText() {
    return this.page.getByText("No findings found", {
      exact: true,
    });
  }

  get downloadReportButton() {
    return this.page.getByRole("button", {
      name: "Download report",
    });
  }

  async enableAutomaticPayments() {
    await this.automaticPaymentsSwitch.click();
    await expect(this.automaticPaymentsSwitch.locator("input")).toBeChecked();
    await expect(this.balanceGoesBelowInput).toBeVisible();
  }

  async saveAutomaticPayments() {
    await this.saveAutomaticPaymentsButton.click();
  }

  async checkWalletRefilledDialogExist() {
    await this.dialog.checkDialogTitleExist("Wallet refilled");
  }

  async hideDates() {
    await this.table.checkTableExist();

    await this.table.mapTableRows(async (row) => {
      await row
        .locator(".table-container_cell")
        .nth(0)
        .evaluate((cell: HTMLDivElement) => {
          cell.textContent = "*hidden*";
        }); // date cell;
    });

    await this.datePickerFromButton.evaluate((el: HTMLDivElement) => {
      el.textContent = "*hidden*";
    });
    await this.datePickerToButton.evaluate((el: HTMLDivElement) => {
      el.textContent = "*hidden*";
    });
  }

  async fillAmountTopUp(amount: number) {
    await this.plus10Button.click();
    await expect(this.amountTopUpInput).toHaveValue("10");
    await this.plus20Button.click();
    await expect(this.amountTopUpInput).toHaveValue("30");
    await this.plus30Button.click();
    await expect(this.amountTopUpInput).toHaveValue("60");
    await this.plus50Button.click();
    await expect(this.amountTopUpInput).toHaveValue("110");
    await this.plus100Button.click();
    await expect(this.amountTopUpInput).toHaveValue("210");
    await this.amountTopUpInput.fill(amount.toString());
    await expect(this.amountTopUpInput).toHaveValue(amount.toString());
  }

  async fillAutomaticPaymentsData(
    balanceGoesBelow: number,
    creditBackUpTo: number,
  ) {
    await this.balanceGoesBelowInput.fill(balanceGoesBelow.toString());
    await this.creditBackUpToInput.fill(creditBackUpTo.toString());
  }

  async openSendRequestDialog() {
    await this.approveButton.click();
    await expect(this.requestNameInput).toBeVisible();
  }

  async downloadReport() {
    const page1Promise = this.page.waitForEvent("popup");
    await this.downloadReportButton.click();
    const page1 = await page1Promise;
    await page1.waitForURL("https://*.onlyoffice.io/doceditor?*");
    await page1.close();
  }

  async fillRequestData() {
    await this.requestNameInput.fill(
      "Auto test auto test auto test auto test auto test auto test",
    );
    await this.requestEmailInput.fill("autotestautotest@example.com");
    await this.requestDetailsInput.fill(
      "autotestautotest autotestautotest autotestautotest autotestautotest autotestautotest autotestautotest autotestautotest autotestautotest autotestautotest autotestautotest",
    );
  }

  async sendRequest() {
    await this.reguestSendButton.click();
  }

  async openTopUpBalanceDialog() {
    await this.topUpBalanceButton.click();
    this.dialog.checkDialogTitleExist("Top up wallet");
  }

  async openTransactionHistoryFilter() {
    await this.transactionHistorySelectorButton.click();
    await expect(this.transactionHistorySelectorButton).toBeVisible();
  }

  async selectTransactionHistoryFilter(filter: TTransactionHistoryFilter) {
    await this.page.getByRole("option", { name: filter }).click();
  }

  async checkTariffPlanExist() {
    await expect(this.priceCalculationContainer).toBeVisible();
  }

  async checkWalletExist() {
    await expect(
      this.page.getByText("Balance", {
        exact: true,
      }),
    ).toBeVisible();
  }

  async checkCalendar() {
    await this.datePickerFromButton.click();
    await expect(this.calendar).toBeVisible();

    await this.datePickerToButton.click();
    await expect(this.calendar).toBeVisible();
  }

  async open() {
    await this.navigateToSettings();
    await this.navigateToArticle(navItems.payments);
    await this.openTab(paymentsTab.tariffPlan);
  }

  async openTab(tab: TPaymentsTab) {
    await this.page.getByTestId(tab).click();

    switch (tab) {
      case paymentsTab.tariffPlan:
        await this.checkTariffPlanExist();
        break;
      case paymentsTab.wallet:
        await this.checkWalletExist();
        break;
      default:
        break;
    }
  }

  async upgradePlan(adminsCount: number) {
    await this.numberOfadmins.fill(adminsCount.toString());
    const page1Promise = this.page.waitForEvent("popup");
    await this.approveButton.click();
    const page1 = await page1Promise;
    await page1.waitForLoadState();
    return page1;
  }

  async removeLinkVerification(stripePage: Page) {
    const isVerificationBlockVisible = await stripePage
      .locator(".LinkVerificationBody")
      .isVisible();
    if (isVerificationBlockVisible) {
      await stripePage
        .getByRole("button", {
          name: "Pay without Link",
        })
        .click();
    }
  }

  async fillPaymentData(stripePage: Page) {
    // Remove link verification block if present
    await expect(stripePage.locator("#payment-form")).toBeVisible();

    await this.removeLinkVerification(stripePage);

    await stripePage.locator("#shippingName").fill("Admin-zero");
    await stripePage.locator("#shippingCountry").selectOption("US");
    await stripePage.locator("#shippingAddressLine1").fill("1 World Way");
    await stripePage.locator("#shippingAddressLine2").fill("1 World Way");
    await stripePage.locator("#shippingLocality").fill("Los Angeles");
    await stripePage.locator("#shippingPostalCode").fill("90045");
    await stripePage.locator("#shippingAdministrativeArea").selectOption("CA");
    await stripePage.locator("#phoneNumber").fill("(800) 555-4545");

    const cardAccordionItem = stripePage.getByTestId("card-accordion-item");

    if (await cardAccordionItem.isVisible()) {
      await cardAccordionItem.click();
    }

    await expect(async () => {
      const cardNumberInput = stripePage.locator("#cardNumber");
      const cardNumberValue = "4242 4242 4242 4242";
      await cardNumberInput.fill(cardNumberValue);
      await expect(cardNumberInput).toHaveValue(cardNumberValue, {
        timeout: 500,
      });

      const cardExpiryInput = stripePage.locator("#cardExpiry");
      const cardExpiryValue = "01 / 30";
      await cardExpiryInput.fill(cardExpiryValue);
      await expect(cardExpiryInput).toHaveValue(cardExpiryValue, {
        timeout: 500,
      });

      const cardCvcInput = stripePage.locator("#cardCvc");
      const cardCvcValue = "123";
      await cardCvcInput.fill(cardCvcValue);
      await expect(cardCvcInput).toHaveValue(cardCvcValue, {
        timeout: 500,
      });

      await stripePage.getByTestId("hosted-payment-submit-button").click();
    }).toPass({
      timeout: 5000,
    });

    const returnUrl = new URL(
      "/portal-settings/payments/portal-payments?complete=true",
      this.portalUrl,
    ).href;
    await stripePage.waitForURL(returnUrl);
    await expect(
      stripePage.getByText("You are using Business plan"),
    ).toBeVisible();
    await stripePage.close();
  }

  async expectNumberOfAdminsCount(adminsCount: number) {
    await expect(this.currentTariffCount).toHaveText(`1/${adminsCount}`);
  }

  async downgradePlan() {
    await this.minusButton.click();
    await this.approveButton.click();
    await this.expectNumberOfAdminsCount(9);
    // ISSUE: sometimes toast is not appearing
    // await this.removeToast(toastMessages.planUpdated);
  }

  async updatePlan() {
    await this.plusButton.click();
    await this.approveButton.click();
    await this.expectNumberOfAdminsCount(10);
    // ISSUE: sometimes toast is not appearing
    // await this.removeToast(toastMessages.planUpdated);
  }
}

import { expect, Page } from "@playwright/test";
import BasePage from "../../common/BasePage";
import {
  navItems,
  paymentsTab,
  TPaymentsTab,
} from "@/src/utils/constants/settings";
import BaseDialog from "../../common/BaseDialog";
export class Payments extends BasePage {
  portalUrl: string;
  dialog: BaseDialog;

  constructor(page: Page) {
    super(page);
    this.portalUrl = page.url();
    this.dialog = new BaseDialog(page);
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

  // get removeToast() {
  //   return this.page.getByText("Business plan updated");
  // }

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

  get goToStipeLink() {
    return this.page.getByRole("link", {
      name: "Go to Stripe",
    });
  }

  get plus10Button() {
    return this.page.getByTestId("+$10");
  }
  get plus20Button() {
    return this.page.getByTestId("+$20");
  }
  get plus30Button() {
    return this.page.getByTestId("+$30");
  }
  get plus50Button() {
    return this.page.getByTestId("+$50");
  }
  get plus100Button() {
    return this.page.getByTestId("+$100");
  }

  get amountTopUpInput() {
    return this.page.getByPlaceholder("Enter an integer amount...");
  }

  get topUpButton() {
    return this.page.getByRole("button", {
      name: "Top up",
    });
  }

  get automaticPaymentsSwitch() {
    return this.page.getByTestId("toggle-button-input");
  }

  get balanceGoesBelowInput() {
    return this.page.getByTestId("text-input").nth(1);
  }

  get creditBackUpToInput() {
    return this.page.getByTestId("text-input").nth(2);
  }

  get editAutoTopUpButton() {
    return this.page.getByRole("button", {
      name: "Edit",
    });
  }

  async openSendRequestDialog() {
    await this.approveButton.click();
    await expect(this.requestNameInput).toBeVisible();
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

    await stripePage.getByTestId("card-accordion-item").click();

    await expect(async () => {
      const cardNumberInput = stripePage.locator("#cardNumber");
      const cardNumberValue = "4242 4242 4242 4242";
      await cardNumberInput.fill(cardNumberValue);
      expect(cardNumberInput).toHaveValue(cardNumberValue, {
        timeout: 500,
      });

      const cardExpiryInput = stripePage.locator("#cardExpiry");
      const cardExpiryValue = "01 / 30";
      await cardExpiryInput.fill(cardExpiryValue);
      expect(cardExpiryInput).toHaveValue(cardExpiryValue, {
        timeout: 500,
      });

      const cardCvcInput = stripePage.locator("#cardCvc");
      const cardCvcValue = "123";
      await cardCvcInput.fill(cardCvcValue);
      expect(cardCvcInput).toHaveValue(cardCvcValue, {
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
    // TODO: unstable
    // await this.removeToast("Business plan updated");
  }

  async updatePlan() {
    await this.plusButton.click();
    await this.approveButton.click();
    await this.expectNumberOfAdminsCount(10);
    // TODO: unstable
    // await this.removeToast("Business plan updated");
  }
}

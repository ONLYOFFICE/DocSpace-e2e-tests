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

  get upgradeNowButton() {
    return this.page.getByTestId("button");
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

  async checkDialogTopUpWalletExist() {
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

  async upgradePlan() {
    await this.numberOfadmins.fill("10");
    await this.page.waitForTimeout(2000);
    const page1Promise = this.page.waitForEvent("popup");
    await this.upgradeNowButton.click();
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

    // Check if accordion header exists before clicking
    await stripePage.getByTestId("card-accordion-item").click();

    await stripePage.locator("#cardNumber").fill("4242 4242 4242 4242");
    await stripePage.locator("#cardExpiry").fill("01 / 30");
    await stripePage.locator("#cardCvc").fill("123");
    await stripePage.getByTestId("hosted-payment-submit-button").click();

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

  async downgradePlan() {
    await this.minusButton.click();
    await this.approveButton.click();
    await expect(this.numberOfAdminsSlider).toBeDisabled();
    await expect(this.numberOfAdminsSlider).not.toBeDisabled();
    // not stable
    // await this.removeToast("Business plan updated");
  }

  async updatePlan() {
    await this.plusButton.click();
    await this.approveButton.click();
    await expect(this.numberOfAdminsSlider).toBeDisabled();
    await expect(this.numberOfAdminsSlider).not.toBeDisabled();
    // not stable
    // await this.removeToast("Business plan updated");
  }
}

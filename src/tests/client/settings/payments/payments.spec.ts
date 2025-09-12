import { test } from "@/src/fixtures";
import { Payments } from "@/src/objects/settings/payments/Payments";
import Screenshot from "@/src/objects/common/Screenshot";
import {
  paymentsTab,
  toastMessages,
  transactionHistoryFilter,
} from "@/src/utils/constants/settings";
import { expect } from "@playwright/test";

test.describe("Payments", () => {
  let payments: Payments;
  let screenshot: Screenshot;

  test.beforeEach(async ({ page, login }) => {
    screenshot = new Screenshot(page, {
      screenshotDir: "payments",
    });

    await login.loginToPortal();
    payments = new Payments(page);
    await payments.open();
  });

  test("Test flow", async ({ page }) => {
    await test.step("Payment", async () => {
      await screenshot.expectHaveScreenshot("payment_free_plan");
      await payments.openTab(paymentsTab.wallet);
      await screenshot.expectHaveScreenshot("payment_free_wallet");
      await payments.openTopUpBalanceDialog();
      await screenshot.expectHaveScreenshot("payment_free_top_up_dialog");
      await payments.dialog.close();
      await payments.openTab(paymentsTab.tariffPlan);
      const stripePage = await payments.upgradePlan(10);
      await payments.fillPaymentData(stripePage);
      await page.pause();
      await payments.hideDateTariffPlan();
      await screenshot.expectHaveScreenshot("payment_business_plan");
      await page.reload();
    });

    await test.step("Stripe customer portal link", async () => {
      const page1Promise = page.waitForEvent("popup");
      await payments.stripeCustomerPortalLink.click({ force: true });
      const page1 = await page1Promise;
      await page1.waitForURL("https://billing.stripe.com/p/session/*");
      await page1.close();

      await payments.openTab(paymentsTab.wallet);
      const page2Promise = page.waitForEvent("popup");
      await payments.stripeCustomerPortalLink.click({ force: true });
      const page2 = await page2Promise;
      await page2.waitForURL("https://billing.stripe.com/p/session/*");
      await page2.close();
    });

    await test.step("Configure DocSpace settings link", async () => {
      const page1Promise = page.context().waitForEvent("page");
      await payments.configureDocSpaceLink.click({
        modifiers: ["ControlOrMeta"],
      });
      const page1 = await page1Promise;
      await page1.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration#configuring_docspace_settings_block",
      );
      await page1.close();
    });

    await test.step("Change tarif plan", async () => {
      await payments.openTab(paymentsTab.tariffPlan);
      await payments.downgradePlan();
      await payments.updatePlan();

      await payments.numberOfAdminsInput.fill("1");
      await payments.hideDateTariffPlan();
      await screenshot.expectHaveScreenshot("payment_change_tarif_plan_min");
      await payments.numberOfAdminsInput.fill("500");
      await payments.hideDateTariffPlan();
      await screenshot.expectHaveScreenshot("payment_change_tarif_plan_middle");
      await payments.numberOfAdminsInput.fill("99999");
      await payments.hideDateTariffPlan();
      await screenshot.expectHaveScreenshot("payment_change_tarif_plan_max");
    });

    await test.step("Send request", async () => {
      await payments.openSendRequestDialog();
      await payments.sendRequest();
      await screenshot.expectHaveScreenshot("send_request_failed");
      await payments.fillRequestData();
      await screenshot.expectHaveScreenshot("send_request_filled_fields");
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "POST" &&
            resp.url().includes("/api/2.0/portal/payment/request"),
        ),
        payments.sendRequest(),
      ]);
      expect(response.status()).toBe(200);
      await payments.removeToast(toastMessages.requestSent);
    });

    await test.step("Top up balance", async () => {
      await payments.openTab(paymentsTab.wallet);
      await payments.openTopUpBalanceDialog();

      await screenshot.expectHaveScreenshot("top_up_balance_dialog");

      await payments.fillAmountTopUp(1000);

      const page1Promise = page.waitForEvent("popup");
      await payments.goToStripeLink.click();
      const page1 = await page1Promise;
      await page1.waitForURL("https://billing.stripe.com/p/session/*");
      await page1.close();

      await payments.topUpButton.click();
      await payments.removeToast(toastMessages.walletToppedUp);
    });

    await test.step("Wallet refilled", async () => {
      await payments.checkWalletRefilledDialogExist();
      await payments.hideDatesWallet();
      await screenshot.expectHaveScreenshot("wallet_refilled_dialog");

      await payments.enableAutomaticPayments();
      await payments.fillAutomaticPaymentsData(99, 2000);
      await screenshot.expectHaveScreenshot(
        "wallet_refilled_dialog_automatic_payments",
      );

      await payments.saveAutomaticPayments();
      await expect(payments.editAutoTopUpLink).toBeVisible();
      await payments.editAutoTopUpLink.click();
      await payments.fillAutomaticPaymentsData(150, 1000);
      await payments.saveAutomaticPaymentsModal();
      await expect(payments.editAutoTopUpButton).toBeVisible();
      await screenshot.expectHaveScreenshot(
        "wallet_refilled_edited_automatic_payments",
      );
      await payments.editAutoTopUpButton.click();
      await payments.fillAutomaticPaymentsData(70, 600);
      await payments.saveAutomaticPaymentsModal();
      await expect(payments.editAutoTopUpButton).toBeVisible();

      await payments.fillAmountTopUp(3333);
      await payments.topUpButton.click();
      await payments.removeToast(toastMessages.walletToppedUp);

      await payments.dialog.close();
      await payments.hideDatesWallet();
      await screenshot.expectHaveScreenshot("top_up_balance_success");
    });

    await test.step("Transaction history", async () => {
      await payments.checkCalendar();
      await payments.openTransactionHistoryFilter();
      await screenshot.expectHaveScreenshot("transaction_history_filter");
      await payments.selectTransactionHistoryFilter(
        transactionHistoryFilter.credit,
      );

      await payments.openTransactionHistoryFilter();
      await payments.selectTransactionHistoryFilter(
        transactionHistoryFilter.debit,
      );

      await expect(payments.emptyViewText).toBeVisible();
      await screenshot.expectHaveScreenshot("transaction_history_filter_empty");

      await payments.openTransactionHistoryFilter();
      await payments.selectTransactionHistoryFilter(
        transactionHistoryFilter.allTransactions,
      );
    });

    await test.step("Download report", async () => {
      await payments.downloadReport();
    });
  });

  test("Top up wallet & change tariff plan", async ({ page }) => {
    await test.step("Top up wallet", async () => {
      await payments.openTab(paymentsTab.wallet);
      await payments.openTopUpBalanceDialog();
      await payments.addPaymentsMethod(page);
      await payments.fillPaymentDataFromAddPaymentMethodServices(page);
      await payments.fillAmountTopUpForServices();

      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "GET" &&
            resp.url().includes("/api/2.0/portal/payment/customer/balance"),
        ),
        payments.topUpButton.click(),
      ]);
      expect(response.status()).toBe(200);
      await payments.cancelAutomaticPaymentsButton.click();
    });

    await test.step("Change tariff plan", async () => {
      await payments.openTab(paymentsTab.tariffPlan);
      await expect(payments.thisStartUpPlan()).toBeVisible();
      await payments.changeTariffPlan();
      await payments.hideDateTariffPlan();  
      await screenshot.expectHaveScreenshot("payment_business_plan");
    });
  });
});

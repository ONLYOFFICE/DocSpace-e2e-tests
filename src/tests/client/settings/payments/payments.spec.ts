import { test } from "@/src/fixtures";
import { Payments } from "@/src/objects/settings/payments/Payments";
import {
  paymentsTab,
  toastMessages,
  transactionHistoryFilter,
} from "@/src/utils/constants/settings";
import { expect } from "@playwright/test";

test.describe("Payments", () => {
  let payments: Payments;

  test.beforeEach(async ({ page, login }) => {
    await login.loginToPortal();
    payments = new Payments(page);
    await payments.open();
  });

  test("Test flow", async ({ page }) => {
    await test.step("Payment", async () => {
      await payments.openTab(paymentsTab.wallet);
      await payments.openTopUpBalanceDialog();
      await payments.dialog.close();
      await payments.openTab(paymentsTab.tariffPlan);
      const stripePage = await payments.upgradePlan(10);
      await payments.fillPaymentData(stripePage);
      await page.pause();
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
      const helpcenterPagePromise = page.context().waitForEvent("page");
      await payments.configureDocSpaceLink.click({
        modifiers: ["ControlOrMeta"],
      });
      const helpcenterPage = await helpcenterPagePromise;
      await helpcenterPage.waitForURL(
        /https:\/\/helpcenter\.onlyoffice\.com\/docspace\/configuration\/.*\.aspx/,
      );
      await helpcenterPage.close();
    });

    await test.step("Change tarif plan", async () => {
      await payments.openTab(paymentsTab.tariffPlan);
      await payments.downgradePlan();
      await payments.updatePlan();

      await payments.numberOfAdminsInput.fill("1");
      await payments.hideDateTariffPlan();
      await payments.numberOfAdminsInput.fill("500");
      await payments.hideDateTariffPlan();
      await payments.numberOfAdminsInput.fill("99999");
      await payments.hideDateTariffPlan();
    });

    await test.step("Send request", async () => {
      await payments.openSendRequestDialog();
      await payments.sendRequest();
      await payments.fillRequestData();
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.request().method() === "POST" &&
            resp.url().includes("/api/2.0/portal/payment/request"),
        ),
        payments.sendRequest(),
      ]);
      expect(response.status()).toBe(200);
      await payments.dismissToastSafely(toastMessages.requestSent);
    });

    await test.step("Top up balance", async () => {
      await payments.openTab(paymentsTab.wallet);
      await payments.openTopUpBalanceDialog();

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

      await payments.enableAutomaticPayments();
      await payments.fillAutomaticPaymentsData(99, 2000);

      await payments.saveAutomaticPayments();
      await expect(payments.editAutoTopUpLink).toBeVisible();
      await payments.editAutoTopUpLink.click();
      await payments.fillAutomaticPaymentsData(150, 1000);
      await payments.saveAutomaticPaymentsModal();
      await expect(payments.editAutoTopUpButton).toBeVisible();
      await payments.editAutoTopUpButton.click();
      await payments.fillAutomaticPaymentsData(70, 600);
      await payments.saveAutomaticPaymentsModal();
      await expect(payments.editAutoTopUpButton).toBeVisible();

      await payments.fillAmountTopUp(3333);
      await payments.topUpButton.click();
      await payments.removeToast(toastMessages.walletToppedUp);

      await payments.dialog.close();
      await payments.hideDatesWallet();
    });

    await test.step("Transaction history", async () => {
      await payments.checkCalendar();
      await payments.openTransactionHistoryFilter();
      await payments.selectTransactionHistoryFilter(
        transactionHistoryFilter.credit,
      );

      await payments.openTransactionHistoryFilter();
      await payments.selectTransactionHistoryFilter(
        transactionHistoryFilter.debit,
      );

      await expect(payments.emptyViewText).toBeVisible();

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
    });
  });
});

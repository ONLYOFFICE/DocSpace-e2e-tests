import { test } from "@/src/fixtures";
import { Payments } from "@/src/objects/settings/payments/Payments";
import { PaymentApi } from "@/src/api/payment";
import {
  paymentsTab,
  toastMessages,
  transactionHistoryFilter,
} from "@/src/utils/constants/settings";
import { expect } from "@playwright/test";

test.describe("Payments", () => {
  let payments: Payments;
  let paymentApi: PaymentApi;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await login.loginToPortal();
    payments = new Payments(page);
    await payments.open();
  });

  test("Downgrade and upgrade tariff plan", async ({ page }) => {
    await test.step("Upgrade plan", async () => {
      const stripePage = await payments.upgradePlan(10);
      await payments.fillPaymentData(stripePage);
      await page.reload();
    });

    await test.step("Downgrade and upgrade plan", async () => {
      await payments.openTab(paymentsTab.tariffPlan);
      await payments.downgradePlan();
      await payments.updatePlan();
    });

    await test.step("Change number of admins", async () => {
      await payments.numberOfAdminsInput.fill("1");
      await payments.hideDateTariffPlan();
      await payments.numberOfAdminsInput.fill("500");
      await payments.hideDateTariffPlan();
      await payments.numberOfAdminsInput.fill("99999");
      await payments.hideDateTariffPlan();
    });
  });

  test("Send sales request", async ({ page }) => {
    await test.step("Prepare tariff plan for sales request", async () => {
      // Sales request button appears only after moving the tariff calculator to a custom sales flow.
      await payments.openTab(paymentsTab.tariffPlan);
      await payments.numberOfAdminsInput.fill("99999");
    });

    await test.step("Open sales request dialog and send", async () => {
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
  });

  test("Top up wallet via Stripe", async ({ page }) => {
    await test.step("First top-up via Top up credits modal", async () => {
      await payments.firstTopUpViaStripe(page, 1000);
    });

    await test.step("Second wallet top-up via existing card", async () => {
      await payments.closeWalletRefilledDialog();
      await payments.openTab(paymentsTab.wallet);
      await payments.openTopUpBalanceDialog();
      await payments.fillAmountTopUp(1000);

      // TODO: temporarily disabled
      // const page1Promise = page.waitForEvent("popup", { timeout: 90000 });
      // await payments.goToStripeLink.click();
      // const page1 = await page1Promise;
      // await page1.waitForURL(/https:\/\/billing\.stripe\.com\/p\/session\//, {
      //   timeout: 90000,
      // });
      // await page1.close();

      await payments.continueToStripeButton.click();
      await payments.removeToast(toastMessages.walletToppedUp);
    });
  });

  test("Set up and edit automatic payments", async ({ page }) => {
    await test.step("First top-up via Top up credits modal", async () => {
      await payments.firstTopUpViaStripe(page, 1000);
    });

    await test.step("Enable automatic payments", async () => {
      await payments.checkWalletRefilledDialogExist();
      await payments.enableAutomaticPayments();
      await payments.fillAutomaticPaymentsData(99, 2000);
      await payments.saveAutomaticPayments();
      await expect(payments.editAutoTopUpLink).toBeVisible();
    });

    await test.step("Edit automatic payments", async () => {
      await payments.editAutoTopUpLink.click();
      await expect(payments.editAutoTopUpButton).toBeVisible();
      await payments.editAutoTopUpButton.click();
      await payments.fillAutomaticPaymentsData(150, 1000);
      await payments.saveAutomaticPayments();

      await payments.editAutoTopUpLink.click();
      await expect(payments.editAutoTopUpButton).toBeVisible();
      await payments.editAutoTopUpButton.click();
      await payments.fillAutomaticPaymentsData(70, 600);
      await payments.saveAutomaticPayments();
    });

    await test.step("Top up again and close dialog", async () => {
      await payments.openTopUpBalanceDialog();
      await payments.fillAmountTopUp(3333);
      await payments.continueToStripeButton.click();
      await payments.removeToast(toastMessages.walletToppedUp);
    });
  });

  test("Filter transaction history", async ({ page }) => {
    await test.step("Top up wallet via API", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await page.reload();
      await payments.openTab(paymentsTab.wallet);
    });

    await test.step("Check calendar date pickers", async () => {
      await payments.checkCalendar();
    });

    await test.step("Filter by credit transactions", async () => {
      await payments.openTransactionHistoryFilter();
      await payments.selectTransactionHistoryFilter(
        transactionHistoryFilter.credit,
      );
    });

    await test.step("Filter by debit transactions", async () => {
      await payments.openTransactionHistoryFilter();
      await payments.selectTransactionHistoryFilter(
        transactionHistoryFilter.debit,
      );
    });

    await test.step("Verify debit filter persists after reload", async () => {
      await page.reload();
      await payments.openTab(paymentsTab.wallet);
      await payments.openTransactionHistoryFilter();
      await payments.selectTransactionHistoryFilter(
        transactionHistoryFilter.debit,
      );
      await expect(payments.emptyViewText).toBeVisible();
    });

    await test.step("Show all transactions", async () => {
      await payments.openTransactionHistoryFilter();
      await payments.selectTransactionHistoryFilter(
        transactionHistoryFilter.allTransactions,
      );
    });
  });

  test("Download transaction history report", async ({ page }) => {
    await test.step("Top up wallet via API", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await page.reload();
      await payments.openTab(paymentsTab.wallet);
    });

    await test.step("Download transaction history report", async () => {
      await payments.downloadReport();
    });
  });

  // TODO: Stripe customer portal link removed from UI
  // test("Stripe customer portal link", async ({ page }) => {
  //   const page1Promise = page.waitForEvent("popup", { timeout: 30000 });
  //   await payments.stripeCustomerPortalLink.click({ force: true });
  //   const page1 = await page1Promise;
  //   await expect(page1).toHaveURL(
  //     /https:\/\/billing\.stripe\.com\/p\/session\//,
  //     {
  //       timeout: 30000,
  //     },
  //   );
  //   await page1.close();

  //   await payments.openTab(paymentsTab.wallet);
  //   const page2Promise = page.waitForEvent("popup", { timeout: 30000 });
  //   await payments.stripeCustomerPortalLink.click({ force: true });
  //   const page2 = await page2Promise;
  //   await expect(page2).toHaveURL(
  //     /https:\/\/billing\.stripe\.com\/p\/session\//,
  //     {
  //       timeout: 30000,
  //     },
  //   );
  //   await page2.close();
  // });

  // TODO: Configure DocSpace settings link removed from UI
  // test("Configure DocSpace settings link", async ({ page }) => {
  //   const helpcenterPagePromise = page
  //     .context()
  //     .waitForEvent("page", { timeout: 30000 });
  //   await payments.configureDocSpaceLink.click({
  //     modifiers: ["ControlOrMeta"],
  //   });
  //   const helpcenterPage = await helpcenterPagePromise;
  //   await helpcenterPage.waitForURL(
  //     /https:\/\/helpcenter\.onlyoffice\.com\/docspace\/configuration\/.*\.aspx/,
  //   );
  //   await helpcenterPage.close();
  // });
});

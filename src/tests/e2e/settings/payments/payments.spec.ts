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

  test("Upgrade plan via Stripe", async ({ page }) => {
    await test.step("Open wallet tab and cancel top-up dialog", async () => {
      await payments.openTab(paymentsTab.wallet);
      await payments.openTopUpBalanceDialog();
      await payments.cancelButton.click();
    });

    await test.step("Upgrade plan via Stripe", async () => {
      await payments.openTab(paymentsTab.tariffPlan);
      const stripePage = await payments.upgradePlan(10);
      await payments.fillPaymentData(stripePage);
      await page.reload();
    });
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

  test.skip("Send sales request", async ({ page }) => {
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

  test.skip("Top up wallet via Stripe", async ({ page }) => {
    await test.step("Upgrade plan", async () => {
      const stripePage = await payments.upgradePlan(10);
      await payments.fillPaymentData(stripePage);
      await page.reload();
    });

    await test.step("Open wallet and top up via Stripe", async () => {
      await payments.openTab(paymentsTab.wallet);
      await payments.openTopUpBalanceDialog();
      await payments.fillAmountTopUp(1000);

      const page1Promise = page.waitForEvent("popup", { timeout: 30000 });
      await payments.goToStripeLink.click();
      const page1 = await page1Promise;
      await expect(page1).toHaveURL(
        /https:\/\/billing\.stripe\.com\/p\/session\//,
        {
          timeout: 30000,
        },
      );
      await page1.close();

      await payments.topUpButton.click();
      await payments.removeToast(toastMessages.walletToppedUp);
    });
  });

  test.skip("Set up and edit automatic payments", async ({ page }) => {
    await test.step("Upgrade plan", async () => {
      const stripePage = await payments.upgradePlan(10);
      await payments.fillPaymentData(stripePage);
      await page.reload();
    });

    await test.step("Top up wallet", async () => {
      await payments.openTab(paymentsTab.wallet);
      await payments.openTopUpBalanceDialog();
      await payments.amountTopUpInput.fill("1000");
      await payments.topUpButton.click();
      await payments.removeToast(toastMessages.walletToppedUp);
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
      await payments.fillAutomaticPaymentsData(150, 1000);
      await payments.saveAutomaticPaymentsModal();
      await expect(payments.editAutoTopUpButton).toBeVisible();

      await payments.editAutoTopUpButton.click();
      await payments.fillAutomaticPaymentsData(70, 600);
      await payments.saveAutomaticPaymentsModal();
      await expect(payments.editAutoTopUpButton).toBeVisible();
    });

    await test.step("Top up again and close dialog", async () => {
      await payments.fillAmountTopUp(3333);
      await payments.topUpButton.click();
      await payments.removeToast(toastMessages.walletToppedUp);
      await payments.dialog.close();
    });
  });

  test.skip("Filter transaction history", async ({ page }) => {
    await test.step("Upgrade plan", async () => {
      const stripePage = await payments.upgradePlan(10);
      await payments.fillPaymentData(stripePage);
      await page.reload();
    });

    await test.step("Top up wallet", async () => {
      await payments.openTab(paymentsTab.wallet);
      await payments.openTopUpBalanceDialog();
      await payments.amountTopUpInput.fill("1000");
      await payments.topUpButton.click();
      await payments.removeToast(toastMessages.walletToppedUp);
      await payments.cancelAutomaticPaymentsButton.click();
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

  test.skip("Download transaction history report", async ({ page }) => {
    await test.step("Upgrade plan", async () => {
      const stripePage = await payments.upgradePlan(10);
      await payments.fillPaymentData(stripePage);
      await page.reload();
    });

    await test.step("Top up wallet", async () => {
      await payments.openTab(paymentsTab.wallet);
      await payments.openTopUpBalanceDialog();
      await payments.amountTopUpInput.fill("1000");
      await payments.topUpButton.click();
      await payments.removeToast(toastMessages.walletToppedUp);
      await payments.cancelAutomaticPaymentsButton.click();
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

  test.skip("Add payment method and top up wallet", async ({ page }) => {
    await test.step("Add payment method and top up", async () => {
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
  });

  test.skip("Upgrade from Startup plan", async () => {
    await test.step("Verify startup plan and upgrade", async () => {
      await payments.openTab(paymentsTab.tariffPlan);
      await expect(payments.thisStartUpPlan()).toBeVisible();
      await payments.changeTariffPlan();
    });
  });
});

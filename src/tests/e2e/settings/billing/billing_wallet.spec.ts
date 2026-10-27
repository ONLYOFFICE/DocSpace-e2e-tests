import { test } from "@/src/fixtures";
import { Payments } from "@/src/objects/settings/payments/Payments";
import { PaymentApi } from "@/src/api/payment";
import Services from "@/src/objects/settings/services/services";
import Files from "@/src/objects/files/Files";
import {
  paymentsTab,
  toastMessages,
  transactionHistoryFilter,
} from "@/src/utils/constants/settings";
import { expect } from "@playwright/test";

test.describe("Billing: Wallet", () => {
  let payments: Payments;

  test.beforeEach(async ({ page, login }) => {
    await login.loginToPortal();
    payments = new Payments(page);
    await payments.open();
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
});

const TOP_UP = "Balance top-up";
const DISK_STORAGE = "Additional disk storage";

test.describe("Billing: Wallet with transactions", () => {
  let services: Services;
  let payments: Payments;

  // Wallet history gets a credit (top-up) and a debit (Disk storage charge)
  test.beforeEach(async ({ page, api, login }) => {
    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();
    await paymentApi.makeWalletTopUp();

    services = new Services(page);
    payments = services.payments;
    await login.loginToPortal();
    await services.linkCardAndSubscribeToDiskStorage();
  });

  test("Filter transaction history", async ({ page }) => {
    await test.step("Open Wallet", async () => {
      await payments.open();
      await payments.openTab(paymentsTab.wallet);
    });

    await test.step("Check calendar date pickers", async () => {
      await payments.checkCalendar();
    });

    await test.step("Credit filter shows only the top-up", async () => {
      await payments.openTransactionHistoryFilter();
      await payments.selectTransactionHistoryFilter(
        transactionHistoryFilter.credit,
      );
      await payments.expectTransactionVisible(TOP_UP);
      await payments.expectTransactionHidden(DISK_STORAGE);
    });

    await test.step("Debit filter shows only the Disk storage charge", async () => {
      await payments.openTransactionHistoryFilter();
      await payments.selectTransactionHistoryFilter(
        transactionHistoryFilter.debit,
      );
      await payments.expectTransactionVisible(DISK_STORAGE);
      await payments.expectTransactionHidden(TOP_UP);
    });

    await test.step("After reload the filter is reset to All transactions", async () => {
      await page.reload();
      await payments.openTab(paymentsTab.wallet);
      await expect(payments.transactionHistorySelectorButton).toHaveText(
        "All transactions",
      );
      await payments.expectTransactionVisible(TOP_UP);
      await payments.expectTransactionVisible(DISK_STORAGE);
    });
  });

  test("Download transaction history report", async ({ page, api }) => {
    await test.step("Open the report from Wallet", async () => {
      await payments.open();
      await payments.openTab(paymentsTab.wallet);
      await payments.downloadReport();
    });

    await test.step("Report is saved to My documents", async () => {
      const files = new Files(page, api.portalDomain);
      await files.open();
      await files.filesTable.expectItemVisible(/report/i);
    });
  });

  test("Upcoming payments list the Disk storage renewal", async ({ page }) => {
    await payments.openOverview();
    await payments.overviewUpcomingDetailsLink.click();
    await expect(page).toHaveURL(/\/billing\/wallet\?tab=upcoming-payments/);
    await expect(page.getByText(/disk storage/i).first()).toBeVisible();
  });
});

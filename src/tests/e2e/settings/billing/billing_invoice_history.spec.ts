import { test } from "@/src/fixtures";
import { Payments } from "@/src/objects/settings/payments/Payments";
import { paymentsTab, toastMessages } from "@/src/utils/constants/settings";

// Invoice dates are shown as dd/mm/yyyy, e.g. "10/11/2026"
const TODAY = new Date().toLocaleDateString("en-GB");

test.describe("Billing: Invoice history", () => {
  let payments: Payments;

  test.beforeEach(async ({ page, login }) => {
    await login.loginToPortal();
    payments = new Payments(page);
    await payments.open();
  });

  test("Wallet top-ups appear in Invoice history and open in Stripe", async ({
    page,
  }) => {
    // Fresh portal - no top-ups yet
    await test.step("Invoice history is empty before any top-up", async () => {
      await payments.openTab(paymentsTab.invoiceHistory);
      await payments.expectInvoiceCount(0);
    });

    await test.step("First top-up via Stripe", async () => {
      await payments.firstTopUpViaStripe(page, 20);
      await payments.closeWalletRefilledDialog();
    });

    await test.step("Invoice history shows the first top-up", async () => {
      await payments.openTab(paymentsTab.invoiceHistory);
      await payments.expectInvoiceCount(1);
      await payments.expectInvoiceAmount(0, "US$20.00");
    });

    await test.step("Second top-up via the linked card", async () => {
      await payments.openTab(paymentsTab.wallet);
      await payments.openTopUpBalanceDialog();
      await payments.fillAmountTopUp(10);
      await payments.continueToStripeButton.click();
      await payments.removeToast(toastMessages.walletToppedUp);
    });

    await test.step("Both top-ups are listed, newest first", async () => {
      await payments.openTab(paymentsTab.invoiceHistory);
      await payments.expectInvoiceCount(2);
      await payments.expectInvoiceAmount(0, "US$10.00");
      await payments.expectInvoiceAmount(1, "US$20.00");
      await payments.expectInvoiceDate(0, TODAY);
      await payments.expectInvoiceDate(1, TODAY);
    });

    await test.step("View invoice opens the paid Stripe invoice", async () => {
      await payments.openInvoice(0, "$10.00");
    });
  });
});

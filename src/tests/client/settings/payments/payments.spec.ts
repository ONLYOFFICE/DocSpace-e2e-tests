import { test } from "@/src/fixtures";
import { Payments } from "@/src/objects/settings/payments/Payments";
import Screenshot from "@/src/objects/common/Screenshot";
import { paymentsTab } from "@/src/utils/constants/settings";

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

      await payments.topUpBalanceButton.click();
      await payments.checkDialogTopUpWalletExist();
      await screenshot.expectHaveScreenshot("payment_free_top_up_wallet");
      await payments.dialog.close();

      await payments.openTab(paymentsTab.tariffPlan);
      const stripePage = await payments.upgradePlan();
      await payments.fillPaymentData(stripePage);
      await screenshot.expectHaveScreenshot("payment_business_plan");
    });

    await test.step("Stripe customer portal", async () => {
      // TODO: fix
      // const page1Promise = page.waitForEvent("popup");
      // await payments.stripeCustomerPortalLink.click({ force: true });
      // const page1 = await page1Promise;
      // await page1.waitForURL("https://billing.stripe.com/p/session");
      // await page1.close();
      // await payments.openTab(paymentsTab.wallet);
      // const page2Promise = page.waitForEvent("popup");
      // await payments.stripeCustomerPortalLink.click({ force: true });
      // const page2 = await page2Promise;
      // await page2.waitForURL("https://billing.stripe.com/p/session");
      // await page2.close();
    });

    await test.step("Change tarif plan", async () => {
      await payments.downgradePlan();
      await payments.updatePlan();

      await payments.numberOfAdminsInput.fill("1");
      await screenshot.expectHaveScreenshot("payment_change_tarif_plan_min");
      await payments.numberOfAdminsInput.fill("500");
      await screenshot.expectHaveScreenshot("payment_change_tarif_plan_middle");
      await payments.numberOfAdminsInput.fill("99999");
      await screenshot.expectHaveScreenshot("payment_change_tarif_plan_max");
    });

    await test.step("Send request", async () => {});

    await test.step(" Top up balance", async () => {
      await payments.openTab(paymentsTab.wallet);
    });
  });
});

import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import { Payments } from "@/src/objects/settings/payments/Payments";
import { paymentsTab, toastMessages } from "@/src/utils/constants/settings";

test.describe("Billing: Tariff plan", () => {
  let payments: Payments;

  test.beforeEach(async ({ page, login }) => {
    await login.loginToPortal();
    payments = new Payments(page);
    await payments.open();
  });

  test("Upgrade and downgrade tariff plan", async ({ page }) => {
    await test.step("Upgrade plan", async () => {
      const stripePage = await payments.upgradePlan(10);
      await payments.fillPaymentData(stripePage);
      await page.reload();
    });

    await test.step("Downgrade plan", async () => {
      await payments.openTab(paymentsTab.tariffPlan);
      await payments.downgradePlan();
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
});

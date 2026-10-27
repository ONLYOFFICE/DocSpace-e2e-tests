import { test } from "@/src/fixtures";
import Services from "@/src/objects/settings/services/services";
import { Payments } from "@/src/objects/settings/payments/Payments";
import { PaymentApi } from "@/src/api/payment";

test.describe("Billing: Payment method", () => {
  let services: Services;
  let payments: Payments;

  // Billing with data: a top-up, a linked card and a Disk storage subscription
  test.beforeEach(async ({ page, api, login }) => {
    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();
    await paymentApi.makeWalletTopUp();

    services = new Services(page);
    payments = services.payments;
    await login.loginToPortal();
    await services.linkCardAndSubscribeToDiskStorage();
  });

  test("Payment method is shown as linked", async () => {
    await test.step("Open Payment method from Overview", async () => {
      await payments.openOverview();
      await payments.overviewManagePaymentMethodLink.click();
    });

    await test.step("Payment method is shown as linked", async () => {
      await payments.expectPaymentMethodLinked();
    });
  });
});

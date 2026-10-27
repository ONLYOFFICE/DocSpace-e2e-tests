import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Services from "@/src/objects/settings/services/services";
import { Payments } from "@/src/objects/settings/payments/Payments";
import { PaymentApi } from "@/src/api/payment";
import Files from "@/src/objects/files/Files";

const DISK_STORAGE = "Additional disk storage";
// "By month" rows are titled like "October 2026"
const CURRENT_MONTH = new Date().toLocaleString("en-US", {
  month: "long",
  year: "numeric",
});

test.describe("Billing: Usage", () => {
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

  test("Usage period filter shows only spending within the period", async () => {
    await test.step("Open Usage from Overview", async () => {
      await payments.openOverview();
      await payments.overviewViewUsageLink.click();
    });

    await test.step("This month includes the Disk storage charge", async () => {
      await payments.expectUsageServiceVisible(DISK_STORAGE);
    });

    await test.step("Last year has no spending", async () => {
      await payments.selectUsagePeriod("lastYear");
      await payments.expectUsageEmpty();
      expect(await payments.getUsageTotal()).toBe("0.00");
    });

    await test.step("This year includes the Disk storage charge again", async () => {
      await payments.selectUsagePeriod("thisYear");
      await payments.expectUsageServiceVisible(DISK_STORAGE);
    });
  });

  test("Usage totals match by services and by month", async () => {
    let total: string;

    await test.step("Open Usage from Overview", async () => {
      await payments.openOverview();
      await payments.overviewViewUsageLink.click();
    });

    await test.step("Total spend equals the Disk storage row", async () => {
      total = await payments.getUsageTotal();
      expect(await payments.getUsageRowAmount(DISK_STORAGE)).toBe(total);
    });

    await test.step("By month shows the same amount for this month", async () => {
      await payments.switchUsageView("By month");
      expect(await payments.getUsageRowAmount(CURRENT_MONTH)).toBe(total);
    });
  });

  test("Usage reports open and are saved to My documents", async ({
    page,
    api,
  }) => {
    await test.step("Open Usage from Overview", async () => {
      await payments.openOverview();
      await payments.overviewViewUsageLink.click();
    });

    await test.step("Report for this month opens", async () => {
      await payments.switchUsageView("By month");
      await payments.downloadUsageRowReport(CURRENT_MONTH);
    });

    await test.step("Report for the Disk storage row opens", async () => {
      await payments.switchUsageView("By services");
      await payments.downloadUsageRowReport(DISK_STORAGE);
    });

    await test.step("Full usage report opens", async () => {
      await payments.downloadUsageReport();
    });

    await test.step("All 3 reports are saved to My documents", async () => {
      const files = new Files(page, api.portalDomain);
      await files.open();
      await files.filesTable.expectItemCount(/report/i, 3);
    });
  });
});

import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import { Payments } from "@/src/objects/settings/payments/Payments";

test.describe("Billing: Overview", () => {
  let payments: Payments;

  test.beforeEach(async ({ page, login }) => {
    payments = new Payments(page);
    await login.loginToPortal();
  });

  test("Overview links open the Billing pages", async ({ page }) => {
    const links = [
      {
        name: "Edit plan",
        locator: () => payments.overviewEditPlanButton,
        url: /\/billing\/tariff-plan/,
      },
      {
        name: "View usage",
        locator: () => payments.overviewViewUsageLink,
        url: /\/billing\/usage/,
      },
      {
        name: "Manage add-ons",
        locator: () => payments.overviewManageAddonsLink,
        url: /\/billing\/addons/,
      },
      {
        name: "Manage payment method",
        locator: () => payments.overviewManagePaymentMethodLink,
        url: /\/billing\/payment-method/,
      },
      {
        name: "Upcoming payment details",
        locator: () => payments.overviewUpcomingDetailsLink,
        url: /\/billing\/wallet\?tab=upcoming-payments/,
      },
    ];

    for (const link of links) {
      await test.step(`${link.name} opens its page`, async () => {
        await payments.openOverview();
        await link.locator().click();
        await expect(page).toHaveURL(link.url);
      });
    }
  });
});

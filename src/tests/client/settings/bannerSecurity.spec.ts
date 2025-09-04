import { expect } from "@playwright/test";

import { test } from "@/src/fixtures";

import { PaymentApi } from "@/src/api/payment";

import Screenshot from "@/src/objects/common/Screenshot";
import Security from "@/src/objects/settings/security/Security";

test.describe("Security Banner Functionality", () => {
  let paymentApi: PaymentApi;
  let screenshot: Screenshot;
  let security: Security;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    const portalInfo = await paymentApi.getPortalInfo(api.portalDomain);
    await paymentApi.makePortalPayment(portalInfo.tenantId, 10);
    await paymentApi.refreshPaymentInfo(api.portalDomain);

    screenshot = new Screenshot(page, {
      screenshotDir: "security",
      fullPage: true,
    });
    security = new Security(page);

    await login.loginToPortal();
    await security.open();
  });

  test("Should navigate to security access portal on banner click", async ({
    page,
  }) => {
    // Go to Login History tab
    await security.openTab("Login History");

    // Wait for the banner to appear
    const banner = page.getByTestId("campaigns-banner");
    await expect(banner).toBeVisible({ timeout: 10000 });

    // Click the banner
    await banner.click();

    // Verify navigation to the correct URL
    await expect(page).toHaveURL(/\/portal-settings\/security\/access-portal/);

    // Verify Two-factor authentication section
    const tfaHeader = page
      .getByTestId("text")
      .filter({ hasText: "Two-factor authentication" })
      .first();

    await expect(tfaHeader).toBeVisible();
  });
});

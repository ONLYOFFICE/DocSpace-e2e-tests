import { PaymentApi } from "@/src/api/payment";
import Screenshot from "@/src/objects/common/Screenshot";
import Security from "@/src/objects/settings/security/Security";
import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";

test.describe("Security tests", () => {
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

  test("All security scenarios", async ({ page }) => {
    await test.step("Password strength", async () => {
      await security.updatePasswordStrength(17);
      await security.updatePasswordStrength(8);
    });

    await test.step("Trusted mail domain", async () => {
      await security.anyDomainsActivation();
      await security.customDomainsActivation();
      await security.disableDomains();
    });

    await test.step("Ip security", async () => {
      await security.ipActivation();
      await security.ipDeactivation();
    });

    await test.step("Brute force", async () => {
      await security.bruteForceActivation();
      await security.restoreToDefaultButton.click();
      const input = page.getByPlaceholder("Enter number");
      await expect(input).toHaveValue("5");
    });

    await test.step("Administrator message", async () => {
      await security.adminMessageActivation();
      await security.adminMessageDeactivation();
    });

    await test.step("Security link", async () => {
      const page1Promise = page.waitForEvent("popup");
      await security.passwordStrengthGuideLink.click();
      const page1 = await page1Promise;
      await page1.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration#passwordstrength",
        { waitUntil: "load" },
      );
      await page1.close();
      const page2Promise = page.waitForEvent("popup");
      await security.twoFactorAuthenticationGuideLink.click();
      const page2 = await page2Promise;
      await page2.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration/docspace-two-factor-authentication.aspx",
        { waitUntil: "load" },
      );
      await page2.close();
      const page3Promise = page.waitForEvent("popup");
      await security.trustedDomainGuideLink.click();
      const page3 = await page3Promise;
      await page3.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration#TrustedDomain",
        { waitUntil: "load" },
      );
      await page3.close();

      const page4Promise = page.waitForEvent("popup");
      await security.ipSecurityGuideLink.click();
      const page4 = await page4Promise;
      await page4.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration/docspace-security-settings.aspx#limiteddevelopertoolsaccess_block",
        { waitUntil: "load" },
      );
      await page4.close();

      const page5Promise = page.waitForEvent("popup");
      await security.bruteForceGuideLink.click();
      const page5 = await page5Promise;
      await page5.waitForURL(
        "https://*.onlyoffice.com/workspace/administration/configuration.aspx#loginsettings",
        { waitUntil: "load" },
      );
      await page5.close();

      const page6Promise = page.waitForEvent("popup");
      await security.adminMessageGuideLink.click();
      const page6 = await page6Promise;
      await page6.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration#administratormessage",
        { waitUntil: "load" },
      );
      await page6.close();

      const page7Promise = page.waitForEvent("popup");
      await security.sessionLifetimeGuideLink.click();
      const page7 = await page7Promise;
      await page7.waitForURL(
        "https://*.onlyoffice.com/docspace/configuration#sessionlifetime",
        { waitUntil: "load" },
      );
      await page7.close();
    });

    await test.step("DocSpace access settings", async () => {
      await screenshot.expectHaveScreenshot("docspace_access_settings_view");
    });

    await test.step("Login history", async () => {
      await security.openTab("Login History");
      await security.hideDateCells();
      await expect(
        page.locator("text=Successful Login via API").first(),
      ).toHaveText("Successful Login via API", { timeout: 10000 });
      await screenshot.expectHaveScreenshot("login_history_view");
    });

    await test.step("Audit trail", async () => {
      await security.openTab("Audit Trail");
      await security.hideDateCells();
      await expect(page.locator("text=Language Updated").first()).toHaveText(
        "Language Updated",
        { timeout: 10000 },
      );
      await screenshot.expectHaveScreenshot("audit_trail_view");
    });
  });
});

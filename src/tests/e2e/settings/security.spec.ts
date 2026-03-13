import { PaymentApi } from "@/src/api/payment";
import Security from "@/src/objects/settings/security/Security";
import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";

test.describe("Security tests", () => {
  let paymentApi: PaymentApi;

  let security: Security;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();

    security = new Security(page);

    await login.loginToPortal();
    await security.open();
  });

  test("Password strength", async () => {
    await test.step("Update password strength to 17", async () => {
      await security.updatePasswordStrength(17);
      await expect(security.passwordStrengthInput).toHaveValue("17");
    });

    await test.step("Update password strength to 8", async () => {
      await security.updatePasswordStrength(8);
      await expect(security.passwordStrengthInput).toHaveValue("8");
    });
  });

  test("Trusted mail domain", async () => {
    await test.step("Any domains activation", async () => {
      await security.anyDomainsActivation();
      await expect(security.anyDomains.locator("input")).toBeChecked();
    });

    await test.step("Custom domains activation", async () => {
      await security.customDomainsActivation();
      await expect(security.customDomains.locator("input")).toBeChecked();
    });

    await test.step("Disable domains", async () => {
      await security.disableDomains();
      await expect(security.disabledDomains.locator("input")).toBeChecked();
    });
  });

  test.skip("Ip security", async () => {
    await test.step("Ip activation", async () => {
      await security.ipActivation();
      await expect(security.ipSecurityEnabled.locator("input")).toBeChecked();
    });
    await test.step("Ip deactivation", async () => {
      await security.ipDeactivation();
      await expect(security.ipSecurityDisabled.locator("input")).toBeChecked();
    });
  });

  test("Brute force", async () => {
    await test.step("Brute force activation", async () => {
      await security.bruteForceActivation();
      await expect(security.numberOfAttempts).toHaveValue("2");
      await expect(security.blickingTime).toHaveValue("30");
      await expect(security.checkPeriod).toHaveValue("30");
    });

    await test.step("Restore to default", async () => {
      await security.restoreToDefaultButton.click();
      await expect(security.numberOfAttempts).toHaveValue("5");
    });
  });

  test("Administrator message", async () => {
    await test.step("Admin message activation", async () => {
      await security.adminMessageActivation();
      await expect(security.adminMessageEnable.locator("input")).toBeChecked();
    });

    await test.step("Admin message deactivation", async () => {
      await security.adminMessageDeactivation();
      await expect(
        security.adminMessageDisabled.locator("input"),
      ).toBeChecked();
    });
  });

  test("Security guide links", async ({ page }) => {
    await test.step("Password strength guide link", async () => {
      const page1Promise = page.waitForEvent("popup");
      await security.passwordStrengthGuideLink.click();
      const page1 = await page1Promise;
      await page1.waitForURL(
        "https://helpcenter.onlyoffice.com/docspace/configuration/docspace-security-settings.aspx#passwordstrengthsettings_block",
      );
      await page1.close();
    });

    await test.step("Two factor authentication guide link", async () => {
      const page2Promise = page.waitForEvent("popup");
      await security.twoFactorAuthenticationGuideLink.click();
      const page2 = await page2Promise;
      await page2.waitForURL(
        "https://helpcenter.onlyoffice.com/docspace/configuration/docspace-two-factor-authentication.aspx",
      );
      await page2.close();
    });

    await test.step("Trusted domain guide link", async () => {
      const page3Promise = page.waitForEvent("popup");
      await security.trustedDomainGuideLink.click();
      const page3 = await page3Promise;
      await page3.waitForURL(
        "https://helpcenter.onlyoffice.com/docspace/configuration/docspace-security-settings.aspx#trustedmaildomainsettings_block",
      );
      await page3.close();
    });

    await test.step("IP security guide link", async () => {
      const page4Promise = page.waitForEvent("popup");
      await security.ipSecurityGuideLink.click();
      const page4 = await page4Promise;
      await page4.waitForURL(
        "https://helpcenter.onlyoffice.com/docspace/configuration/docspace-security-settings.aspx#limiteddevelopertoolsaccess_block",
      );
      await page4.close();
    });

    await test.step("Brute force guide link", async () => {
      const page5Promise = page.waitForEvent("popup");
      await security.bruteForceGuideLink.click();
      const page5 = await page5Promise;
      await page5.waitForURL(
        "https://helpcenter.onlyoffice.com/docspace/configuration/docspace-security-settings.aspx#bruteforceprotectionsettings_block",
      );
      await page5.close();
    });

    await test.step("Admin message guide link", async () => {
      const page6Promise = page.waitForEvent("popup");
      await security.adminMessageGuideLink.click();
      const page6 = await page6Promise;
      await page6.waitForURL(
        "https://helpcenter.onlyoffice.com/docspace/configuration/docspace-security-settings.aspx#administratormessagesettings_block",
      );
      await page6.close();
    });

    await test.step("Session lifetime guide link", async () => {
      const page7Promise = page.waitForEvent("popup");
      await security.sessionLifetimeGuideLink.click();
      const page7 = await page7Promise;
      await page7.waitForURL(
        "https://helpcenter.onlyoffice.com/docspace/configuration/docspace-security-settings.aspx#sessionlifetime_block",
      );
      await page7.close();
    });
  });

  test("Login history", async ({ page }) => {
    await test.step("Open Login History tab", async () => {
      await security.openTab("Login History");
      await expect(
        page.locator("text=Successful Login via API").first(),
      ).toHaveText("Successful Login via API", { timeout: 10000 });
    });
  });

  test("Audit trail", async ({ page }) => {
    await test.step("Open Audit Trail tab", async () => {
      await security.openTab("Audit Trail");
      await expect(page.locator("text=Language Updated").first()).toHaveText(
        "Language Updated",
        { timeout: 10000 },
      );
    });
  });
});

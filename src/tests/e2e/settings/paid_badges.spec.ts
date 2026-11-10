import { test } from "@/src/fixtures";
import { PaidBadges } from "@/src/objects/settings/paidBadges/PaidBadges";

// Fresh portal is on the free plan - paid features show a clickable "Paid" badge
// that leads to Billing > Tariff plan
test.describe("Settings: Paid badges lead to Tariff plan", () => {
  let paidBadges: PaidBadges;

  test.beforeEach(async ({ page, login }) => {
    paidBadges = new PaidBadges(page);
    await login.loginToPortal();
    await paidBadges.open();
  });

  test("Customization: DNS and Custom name badges", async () => {
    await test.step("DNS and Custom name badges open Tariff plan", async () => {
      await paidBadges.checkAllBadgesLeadToTariffPlan(
        "customizationGeneral",
        2,
      );
    });
  });

  test("Security: Login History and Audit Trail badges", async () => {
    await test.step("Login History badge opens Tariff plan", async () => {
      await paidBadges.checkAllBadgesLeadToTariffPlan("loginHistory", 1);
    });

    await test.step("Audit Trail badge opens Tariff plan", async () => {
      await paidBadges.checkAllBadgesLeadToTariffPlan("auditTrail", 1);
    });
  });

  test("Integration: LDAP and SSO badges", async () => {
    await test.step("LDAP and Auto sync badges open Tariff plan", async () => {
      await paidBadges.checkAllBadgesLeadToTariffPlan("ldap", 2);
    });

    await test.step("SSO badge opens Tariff plan", async () => {
      await paidBadges.checkAllBadgesLeadToTariffPlan("sso", 1);
    });
  });

  test("Backup and Restore badges", async () => {
    await test.step("Data backup badge opens Tariff plan", async () => {
      await paidBadges.checkAllBadgesLeadToTariffPlan("dataBackup", 1);
    });

    await test.step("Automatic backup badge opens Tariff plan", async () => {
      await paidBadges.checkAllBadgesLeadToTariffPlan("autoBackup", 1);
    });

    await test.step("Restore badge opens Tariff plan", async () => {
      await paidBadges.checkAllBadgesLeadToTariffPlan("restore", 1);
    });
  });

  // Branding badges sit inside `.settings_unavailable` (pointer-events: none),
  // so the click never reaches them
  test.fail("Customization: Branding badges [Bug 85021]", async () => {
    await test.step("Brand name and Logo badges open Tariff plan", async () => {
      await paidBadges.checkAllBadgesLeadToTariffPlan(
        "customizationBranding",
        2,
      );
    });
  });
});

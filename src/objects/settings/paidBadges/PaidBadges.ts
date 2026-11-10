import { expect, Page } from "@playwright/test";
import BasePage from "@/src/objects/common/BasePage";
import { Payments } from "@/src/objects/settings/payments/Payments";
import { navItems } from "@/src/utils/constants/settings";

// "Paid" badge next to a paid feature on a free portal.
// SSO access-rights dropdown renders hidden Paid badges too - keep visible only
const PAID_BADGE = '[data-testid="badge"][data-paid="true"]';
const TARIFF_PLAN_URL = /\/billing\/tariff-plan/;

// Settings section -> sidebar item, optional tab testid and section URL.
// URL is awaited so badges of the previous tab are not picked up
const paidSections = {
  customizationGeneral: {
    article: navItems.customization,
    tab: "general_tab",
    url: /\/portal-settings\/customization\/general/,
  },
  customizationBranding: {
    article: navItems.customization,
    tab: "branding_tab",
    url: /\/portal-settings\/customization\/branding/,
  },
  loginHistory: {
    article: navItems.security,
    tab: "login-history_tab",
    url: /\/portal-settings\/security\/login-history/,
  },
  auditTrail: {
    article: navItems.security,
    tab: "audit-trail_tab",
    url: /\/portal-settings\/security\/audit-trail/,
  },
  ldap: {
    article: navItems.integration,
    tab: "ldap_tab",
    url: /\/portal-settings\/integration\/ldap/,
  },
  sso: {
    article: navItems.integration,
    tab: "sso_tab",
    url: /\/portal-settings\/integration\/sso/,
  },
  dataBackup: {
    article: navItems.backup,
    tab: "data-backup_tab",
    url: /\/portal-settings\/backup\/data-backup/,
  },
  autoBackup: {
    article: navItems.backup,
    tab: "auto-backup_tab",
    url: /\/portal-settings\/backup\/auto-backup/,
  },
  restore: {
    article: navItems.restore,
    tab: null,
    url: /\/portal-settings\/restore\/restore-backup/,
  },
} as const;

export type TPaidSection = keyof typeof paidSections;

export class PaidBadges extends BasePage {
  payments: Payments;

  constructor(page: Page) {
    super(page);
    this.payments = new Payments(page);
  }

  get paidBadges() {
    return this.page.locator(PAID_BADGE).locator("visible=true");
  }

  async open() {
    await this.navigateToSettings();
  }

  async openSection(section: TPaidSection) {
    const { article, tab, url } = paidSections[section];
    await this.navigateToArticle(article);
    if (tab) {
      await this.page.getByTestId(tab).click();
    }
    await expect(this.page).toHaveURL(url);
    await expect(this.paidBadges.first()).toBeVisible();
  }

  async checkPaidBadgesCount(count: number) {
    await expect(this.paidBadges).toHaveCount(count);
  }

  async clickPaidBadge(index = 0) {
    const badge = this.paidBadges.nth(index);
    await badge.scrollIntoViewIfNeeded();
    // No global actionTimeout - an unclickable badge would hang until test timeout
    await badge.click({ timeout: 10000 });
  }

  async checkTariffPlanOpened() {
    await expect(this.page).toHaveURL(TARIFF_PLAN_URL);
    // Admins input is not always rendered (depends on wallet/admins state) -
    // the calculator container is
    await expect(this.payments.priceCalculationContainer).toBeVisible();
  }

  // Billing has its own sidebar without settings sections - go back instead
  async returnToSection(section: TPaidSection) {
    await this.page.goBack();
    await expect(this.page).toHaveURL(paidSections[section].url);
    await expect(this.paidBadges.first()).toBeVisible();
  }

  // Every badge of the section must lead to Tariff plan
  async checkAllBadgesLeadToTariffPlan(section: TPaidSection, count: number) {
    await this.openSection(section);
    await this.checkPaidBadgesCount(count);

    for (let i = 0; i < count; i++) {
      await this.clickPaidBadge(i);
      await this.checkTariffPlanOpened();
      await this.returnToSection(section);
      await this.checkPaidBadgesCount(count);
    }
  }
}

export default PaidBadges;

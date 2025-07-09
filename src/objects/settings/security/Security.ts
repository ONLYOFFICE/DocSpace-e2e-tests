import { Page } from "@playwright/test";
import BasePage from "@/src/objects/common/BasePage";
import { navItems } from "@/src/utils/constants/settings";
import BaseTable, { TBaseTableLocators } from "../../common/BaseTable";

class Security extends BasePage {
  table: BaseTable;
  constructor(page: Page) {
    super(page);
    this.table = new BaseTable(this.page, this.tableLocators);
  }

  get tableLocators(): TBaseTableLocators {
    return {
      tableRows: this.page.locator(".table-container_row"),
    };
  }

  get passwordStrengthInput() {
    return this.page.getByTestId("slider");
  }
  get useCapitalLetter() {
    return this.page
      .locator("label")
      .filter({ hasText: "Use capital letters" });
  }
  get useDigits() {
    return this.page.locator("label").filter({ hasText: "Use digits" });
  }
  get useSpecialCharacter() {
    return this.page
      .locator("label")
      .filter({ hasText: "Use special character" });
  }
  get saveButton() {
    return this.page.locator('[data-testid="save-button"]');
  }
  get anyDomains() {
    return this.page.locator("#any-domains");
  }
  get customDomains() {
    return this.page.locator("#custom-domains");
  }
  get disabledDomains() {
    return this.page.locator("#trusted-mail-disabled");
  }
  get cancelButton() {
    return this.page.locator('[data-testid="cancel-button"]');
  }
  get addDomainLink() {
    return this.page.getByText("Add trusted domain");
  }
  get trustDomainInput() {
    return this.page.locator("input.add-trusted-domain-input").last();
  }
  get deleteDomain() {
    return this.page.locator(".add-trusted-domain-delete-icon");
  }
  get deleteIp() {
    return this.page.locator(".add-allowed-ip-address-delete-icon");
  }
  get trustedDomainArea() {
    return this.page.getByText("SaveCancelYou have unsaved");
  }
  get apiEnable() {
    return this.page.locator("#ip-security-enable");
  }
  get addIpLink() {
    return this.page.getByText("Add allowed IP address");
  }
  get ipInput() {
    return this.page.getByTestId("text-input").nth(0);
  }
  get ipSecurityArea() {
    return this.page
      .locator("div")
      .filter({ hasText: /^Add allowed IP address$/ })
      .first();
  }
  get ipSecurityDisabled() {
    return this.page.locator("#ip-security-disabled path");
  }
  get addAtLeast1TrustedDomain() {
    return this.page.getByText("Add at least 1 trusted domain.");
  }
  get addAtLeast1AllowedIpAddress() {
    return this.page.getByText("Add at least 1 allowed IP address.");
  }
  get numberOfAttempts() {
    return this.page.getByPlaceholder("Enter number");
  }
  get blickingTime() {
    return this.page.getByTestId("text-input").nth(1);
  }
  get checkPeriod() {
    return this.page.getByTestId("text-input").nth(2);
  }
  get bruteForceArea() {
    return this.page.locator(".sc-hfYvEh");
  }
  get bruteForceSaveButton() {
    return this.page
      .locator(".sc-hfYvEh > .sc-hLwbiq > .buttons-flex > button")
      .first();
  }
  get restoreToDefaultButton() {
    return this.page.locator(".brute-force-protection-cancel");
  }
  get adminMessageEnable() {
    return this.page.locator("#admin-message-enable").nth(0);
  }
  get adminMessageDisabled() {
    return this.page.locator("#admin-message-disabled").nth(0);
  }
  get lifetimeEnable() {
    return this.page.locator("#session-lifetime-enable");
  }
  get lifetimeDisabled() {
    return this.page.locator("#session-lifetime-disabled");
  }
  get lifetimeInput() {
    return this.page.getByPlaceholder(" ", { exact: true });
  }
  get passwordStrengthGuideLink() {
    return this.page.locator(".category-item-description > a").first();
  }
  get twoFactorAuthenticationGuideLink() {
    return this.page.locator("div:nth-child(7) > a");
  }
  get trustedDomainGuideLink() {
    return this.page.locator("div:nth-child(11) > a");
  }
  get ipSecurityGuideLink() {
    return this.page.locator("div:nth-child(15) > a");
  }
  get bruteForceGuideLink() {
    return this.page.locator(".description > a");
  }
  get adminMessageGuideLink() {
    return this.page.locator("div:nth-child(32) > a");
  }
  get sessionLifetimeGuideLink() {
    return this.page.locator("div:nth-child(36) > a");
  }

  async open() {
    await this.navigateToSettings();
    await this.article.navigate(navItems.security);
  }

  async updatePasswordStrength(value: number) {
    await this.passwordStrengthInput.focus();

    const currentValue = await this.passwordStrengthInput.evaluate(
      (slider: HTMLInputElement) => Number(slider.value),
    );
    const diff = value - currentValue;
    const key = diff > 0 ? "ArrowRight" : "ArrowLeft";
    for (let i = 0; i < Math.abs(diff); i++) {
      await this.passwordStrengthInput.press(key);
    }

    await this.useCapitalLetter.click();
    await this.useDigits.click();
    await this.useSpecialCharacter.click();
    await this.saveButton.first().click();
  }

  async anyDomainsActivation() {
    await this.anyDomains.click();
    await this.cancelButton.nth(2).click();
    await this.customDomains.click();
    await this.cancelButton.nth(2).click();
    await this.anyDomains.click();
    await this.saveButton.nth(2).click();
  }

  async customDomainsActivation() {
    await this.customDomains.click();
    await this.addDomainLink.click();
    await this.trustDomainInput.fill("gmail.com");
    await this.saveButton.nth(2).click();
  }

  async disableDomains() {
    await this.deleteDomain.first().click();
    await this.trustedDomainArea.click();
    await this.saveButton.nth(2).click();
    await this.addAtLeast1TrustedDomain.click();
    await this.disabledDomains.click();
    await this.saveButton.nth(2).click();
  }

  async ipActivation() {
    await this.apiEnable.click();
    await this.cancelButton.nth(5).click();
    await this.apiEnable.click();
    await this.addIpLink.click();
    await this.ipInput.fill("155.155.155.155");
    await this.saveButton.nth(5).click();
  }

  async ipDeactivation() {
    await this.ipSecurityArea.click();
    await this.deleteIp.click();
    await this.saveButton.nth(5).click();
    await this.addAtLeast1AllowedIpAddress.click();
    await this.ipSecurityDisabled.click();
    await this.saveButton.nth(5).click();
  }

  async bruteForceActivation() {
    await this.numberOfAttempts.fill("2");
    await this.blickingTime.fill("30");
    await this.checkPeriod.fill("30");
    await this.saveButton.nth(6).click();
  }

  async adminMessageActivation() {
    await this.adminMessageEnable.click();
    await this.cancelButton.nth(7).click();
    await this.adminMessageEnable.click();
    await this.saveButton.nth(7).click();
  }

  async adminMessageDeactivation() {
    await this.adminMessageDisabled.click();
    await this.saveButton.nth(7).click();
  }

  async sessionLifetimeActivation() {
    await this.lifetimeEnable.click();
    await this.cancelButton.nth(8).click();
    await this.lifetimeEnable.click();
    await this.lifetimeInput.fill("45");
    await this.saveButton.nth(8).click();
  }

  async sessionLifetimeDeactivation() {
    await this.lifetimeDisabled.click();
    await this.saveButton.nth(8).click();
  }

  async saveChanges() {
    await this.saveButton.first().click();
  }

  async hideDateCells() {
    await this.table.checkTableExist();

    await this.table.mapTableRows(async (row) => {
      await row
        .locator(".table-container_cell")
        .nth(1)
        .evaluate((cell: HTMLDivElement) => {
          cell.textContent = "";
        }); // date cell;
    });
  }

  async openTab(tab: "DocSpace access" | "Login History" | "Audit Trail") {
    await this.page.getByText(tab, { exact: true }).click();
  }
}

export default Security;

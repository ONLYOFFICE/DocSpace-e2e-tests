import { Page } from "@playwright/test";
import BasePage from "@/src/objects/common/BasePage";
import { navItems, toastMessages } from "@/src/utils/constants/settings";
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
    return this.page.getByTestId("password_strength_slider");
  }
  get useCapitalLetter() {
    return this.page.getByTestId("password_strength_upper_case");
  }
  get useDigits() {
    return this.page.getByTestId("password_strength_digits");
  }
  get useSpecialCharacter() {
    return this.page.getByTestId("password_strength_special");
  }
  get saveButton() {
    return this.page.locator('[data-testid="password_strength_save"]');
  }
  get anyDomains() {
    return this.page.getByTestId("trusted_mail_any_domains");
  }
  get customDomains() {
    return this.page.getByTestId("trusted_mail_custom_domains");
  }
  get disabledDomains() {
    return this.page.getByTestId("trusted_mail_disabled");
  }
  get cancelButton() {
    return this.page.locator('[data-testid="trusted_mail_cancel_button"]');
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
  // get deleteIp() {
  //   return this.page.locator(".add-allowed-ip-address-delete-icon");
  // }
  get trustedDomainArea() {
    return this.page
      .getByTestId("radio-button-group")
      .filter({ has: this.page.getByTestId("trusted_mail_disabled") })
      .first();
  }
  get apiEnable() {
    return this.page.locator("#ip-security-enable");
  }
  get addIpLink() {
    return this.page.getByText("Add allowed IP address");
  }
  get ipInput() {
    return this.page.getByTestId("ip_security_ip_input");
  }
  get ipSecurityArea() {
    return this.page.getByTestId("ip_security_radio_button_group");
  }
  get ipSecurityDisabled() {
    return this.page.getByTestId("ip_security_disabled");
  }
  get ipSecurityEnabled() {
    return this.page.getByTestId("ip_security_enabled");
  }
  get deleteIp() {
    return this.page.getByTestId("ip_security_delete_ip_icon");
  }

  get numberOfAttempts() {
    return this.page.getByTestId(
      "brute_force_protection_number_attempts_input",
    );
  }
  get blickingTime() {
    return this.page.getByTestId("brute_force_protection_blocking_time_input");
  }
  get checkPeriod() {
    return this.page.getByTestId("brute_force_protection_check_period_input");
  }
  get restoreToDefaultButton() {
    return this.page.getByTestId("brute_force_protection_cancel_button");
  }
  get adminMessageEnable() {
    return this.page.getByTestId("administrator_message_enabled");
  }
  get adminMessageDisabled() {
    return this.page.getByTestId("administrator_message_disabled");
  }
  get lifetimeEnable() {
    return this.page.getByTestId("session_lifetime_enable");
  }
  get lifetimeDisabled() {
    return this.page.getByTestId("session_lifetime_disabled");
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
    await this.saveButton.click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async anyDomainsActivation() {
    await this.anyDomains.click();
    await this.cancelButton.click();
    await this.customDomains.click();
    await this.cancelButton.click();
    await this.anyDomains.click();
    await this.page.getByTestId("trusted_mail_save_button").click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async customDomainsActivation() {
    await this.customDomains.click();
    await this.addDomainLink.click();
    await this.trustDomainInput.fill("gmail.com");
    await this.page.getByTestId("trusted_mail_save_button").click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async disableDomains() {
    const deleteButtons = await this.deleteDomain.all();
    if (deleteButtons.length > 0) {
      await deleteButtons[0].click();
    }
    if (await this.trustedDomainArea.count()) {
      await this.trustedDomainArea.click();
    }
    await this.page.getByTestId("trusted_mail_save_button").click();
    await this.removeToast(toastMessages.settingsUpdated);
    await this.disabledDomains.click();
    await this.page.getByTestId("trusted_mail_save_button").click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async ipActivation() {
    await this.ipSecurityEnabled.click();
    await this.page.getByTestId("ip_security_cancel_button").click();
    await this.ipSecurityEnabled.click();
    await this.addIpLink.click();
    await this.ipInput.fill("155.155.155.155");
    await this.page.getByTestId("ip_security_save_button").click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async ipDeactivation() {
    await this.ipSecurityArea.click();
    await this.deleteIp.click();
    await this.page.getByTestId("ip_security_save_button").click();
    await this.removeToast(toastMessages.addAllowedIp);
    await this.ipSecurityDisabled.click();
    await this.page.getByTestId("ip_security_save_button").click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async bruteForceActivation() {
    await this.numberOfAttempts.fill("2");
    await this.blickingTime.fill("30");
    await this.checkPeriod.fill("30");
    await this.page.getByTestId("brute_force_protection_save_button").click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async adminMessageActivation() {
    await this.adminMessageEnable.click();
    await this.page.getByTestId("administrator_message_cancel_button").click();
    await this.adminMessageEnable.click();
    await this.page.getByTestId("administrator_message_save_button").click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async adminMessageDeactivation() {
    await this.adminMessageDisabled.click();
    await this.page.getByTestId("administrator_message_save_button").click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async sessionLifetimeActivation() {
    await this.lifetimeEnable.click();
    await this.page.getByTestId("session_lifetime_cancel_button").click();
    await this.lifetimeEnable.click();
    await this.lifetimeInput.fill("45");
    await this.page.getByTestId("session_lifetime_save_button").click();
  }

  async sessionLifetimeDeactivation() {
    await this.lifetimeDisabled.click();
    await this.page.getByTestId("session_lifetime_save_button").click();
  }

  async saveChanges() {
    await this.saveButton.first().click();
  }

  async openTab(tab: "DocSpace access" | "Login History" | "Audit Trail") {
    await this.page.getByText(tab, { exact: true }).click();
  }
}

export default Security;

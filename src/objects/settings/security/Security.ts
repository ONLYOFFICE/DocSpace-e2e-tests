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
    return this.page.getByTestId("save-button");
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
    return this.page.getByTestId("cancel-button");
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
  get ipSecurityEnabled() {
    return this.page.getByTestId("ip_security_enabled");
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
    return this.page.getByTestId("session_lifetime_enabled");
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
  get inviteMembersCheckbox() {
    return this.page.locator(
      '[data-testid="invitation_settings_contacts_checkbox"] input[type="checkbox"]',
    );
  }
  get allowGuestsCheckbox() {
    return this.page.locator(
      '[data-testid="invitation_settings_guests_checkbox"] input[type="checkbox"]',
    );
  }
  get saveInvitationSettingsButton() {
    return this.page.getByTestId("invitation_settings_save_button");
  }
  async isChecked(locator) {
    return await locator.isChecked();
  }
  async toggleInvitationSettings() {
    await this.disableInviteMembers();
    await this.disableAllowGuests();
  }
  async enableInviteMembers() {
    const checkbox = this.inviteMembersCheckbox;
    await checkbox.waitFor({ state: "visible" });
    if (!(await this.isChecked(checkbox))) {
      await checkbox.click({ force: true });
      await this.saveInvitationSettings();
    }
    return this;
  }
  async disableInviteMembers() {
    const checkbox = this.inviteMembersCheckbox;
    await checkbox.waitFor({ state: "visible" });
    if (await this.isChecked(checkbox)) {
      await checkbox.click({ force: true });
      await this.saveInvitationSettings();
    }
    return this;
  }
  async enableAllowGuests() {
    const checkbox = this.allowGuestsCheckbox;
    await checkbox.waitFor({ state: "visible" });
    if (!(await this.isChecked(checkbox))) {
      await checkbox.click({ force: true });
      await this.saveInvitationSettings();
    }
    return this;
  }

  async disableAllowGuests() {
    const checkbox = this.allowGuestsCheckbox;
    await checkbox.waitFor({ state: "visible" });
    if (await this.isChecked(checkbox)) {
      await checkbox.click({ force: true });
      await this.saveInvitationSettings();
    }
    return this;
  }

  private async saveInvitationSettings() {
    await this.saveInvitationSettingsButton.click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async open() {
    await this.navigateToSettings();
    await this.article.navigate(navItems.security);
  }

  async updatePasswordStrength(value: number) {
    await this.page.getByTestId("password_strength_slider").focus();

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
    await this.page.getByTestId("password_strength_save").click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  get saveTrustedMailButton() {
    return this.page.getByTestId("trusted_mail_save_button");
  }

  get cancelTrustedMailButton() {
    return this.page.getByTestId("trusted_mail_cancel_button");
  }

  async anyDomainsActivation() {
    await this.anyDomains.click();
    await this.cancelTrustedMailButton.click();
    await this.customDomains.click();
    await this.cancelTrustedMailButton.click();
    await this.anyDomains.click();
    await this.saveTrustedMailButton.click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async customDomainsActivation() {
    await this.customDomains.click();
    await this.addDomainLink.click();
    await this.trustDomainInput.fill("gmail.com");
    await this.saveTrustedMailButton.click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async disableDomains() {
    await this.deleteDomain.first().click();
    await this.trustedDomainArea.click();
    await this.saveTrustedMailButton.click();
    await this.removeToast(toastMessages.addTrustedDomain);
    await this.disabledDomains.click();
    await this.saveTrustedMailButton.click();
    await this.removeToast(toastMessages.settingsUpdated);
  }
  async ipActivation() {
    await this.ipSecurityEnabled.click();
    await this.page.getByTestId("ip_security_save_button").click();

    await this.page.waitForSelector("#toast-container .Toastify__toast-body", {
      state: "visible",
    });
    await this.page.click("#toast-container .Toastify__toast-body");

    await this.ipSecurityEnabled.click();
    await this.addIpLink.click();
    await this.page.getByTestId("ip_security_ip_input").fill("155.155.155.155");
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
    await this.page
      .getByTestId("brute_force_protection_number_attempts_input")
      .fill("2");
    await this.page
      .getByTestId("brute_force_protection_blocking_time_input")
      .fill("30");
    await this.page
      .getByTestId("brute_force_protection_check_period_input")
      .fill("30");
    await this.page.getByTestId("brute_force_protection_save_button").click();
    await this.removeToast(toastMessages.settingsUpdated);
  }

  async adminMessageActivation() {
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

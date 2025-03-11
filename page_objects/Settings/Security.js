import MainPage from "../mainPage";

export class Security extends MainPage {
  constructor(page) {
    super(page);
    this.navigateToSecurity = page.getByRole("link", { name: "Security" });
    this.passwordStrengthInput = page.getByTestId("slider");
    this.passwordStrengthInput2 = page.getByTestId("slider");
    this.useCapitalLetter = page
      .locator("label")
      .filter({ hasText: "Use capital letters" });
    this.useDigits = page.locator("label").filter({ hasText: "Use digits" });
    this.useSpecialCharacter = page
      .locator("label")
      .filter({ hasText: "Use special character" });
    this.saveButton = page.locator('[data-testid="save-button"]');
    this.anyDomains = page.locator("#any-domains");
    this.customDomains = page.locator("#custom-domains");
    this.disabledDomains = page.locator("#trusted-mail-disabled");
    this.cancelButton = page.locator('[data-testid="cancel-button"]');
    this.addDomainLink = page.getByText("Add trusted domain");
    this.trustDomainInput = page
      .locator("input.add-trusted-domain-input")
      .last();
    this.deleteDomain = page.locator(".add-trusted-domain-delete-icon");
    this.deleteIp = page.locator(".add-allowed-ip-address-delete-icon");
    this.trustedDomainArea = page.getByText("SaveCancelYou have unsaved");
    this.apiEnable = page.locator("#ip-security-enable");
    this.addIpLink = page.getByText("Add allowed IP address");
    this.ipInput = page.getByTestId("text-input").nth(0);
    this.ipSecurityArea = page
      .locator("div")
      .filter({ hasText: /^Add allowed IP address$/ })
      .first();
    this.ipSecurityDisabled = page.locator("#ip-security-disabled path");
    this.addAtLeast1TrustedDomain = page.getByText(
      "Add at least 1 trusted domain.",
    );
    this.addAtLeast1AllowedIpAddress = page.getByText(
      "Add at least 1 allowed IP address.",
    );
    this.numberOfAttempts = page.getByPlaceholder("Enter number");
    this.blickingTime = page.getByTestId("text-input").nth(1);
    this.checkPeriod = page.getByTestId("text-input").nth(2);
    this.bruteForceArea = page.locator(".sc-hfYvEh");
    this.bruteForceSaveButton = page
      .locator(".sc-hfYvEh > .sc-hLwbiq > .buttons-flex > button")
      .first();
    this.restoreToDefaultButton = page.locator(
      ".brute-force-protection-cancel",
    );
    this.removeToast = page.getByText(
      "Settings have been successfully updated",
    );
    this.adminMessageEnable = page.locator("#admin-message-enable").nth(0);
    this.adminMessageDisabled = page.locator("#admin-message-disabled").nth(0);
    this.lifetimeEnable = page.locator("#session-lifetime-enable");
    this.lifetimeDisabled = page.locator("#session-lifetime-disabled");
    this.lifetimeInput = page.getByPlaceholder(" ", { exact: true });
    this.passwordStrengthGuideLink = page
      .locator(".category-item-description > a")
      .first();
    this.twoFactorAuthenticationGuideLink = page.locator(
      "div:nth-child(7) > a",
    );
    this.trustedDomainGuideLink = page.locator("div:nth-child(11) > a");
    this.ipSecurityGuideLink = page.locator("div:nth-child(15) > a");
    this.bruteForceGuideLink = page.locator(".description > a");
    this.adminMessageGuideLink = page.locator("div:nth-child(22) > a");
    this.sessionLifetimeGuideLink = page.locator("div:nth-child(26) > a");
    this.LoginHistoryPage = page.getByText("Login History");
    this.AuditTrailPage = page.getByText("Audit Trail");
  }

  async updatePasswordStrength(value) {
    await this.passwordStrengthInput.evaluate((slider, value) => {
      slider.value = 17;
      slider.dispatchEvent(new Event("input", { bubbles: true }));
    }, value);
    await this.useCapitalLetter.click();
    await this.useDigits.click();
    await this.useSpecialCharacter.click();
    await this.saveButton.first().click();
  }

  async updatePasswordStrength2(value) {
    await this.passwordStrengthInput.evaluate((slider, value) => {
      slider.value = 8;
      slider.dispatchEvent(new Event("input", { bubbles: true }));
    }, value);
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
    await this.cancelButton.nth(3).click();
    await this.apiEnable.click();
    await this.addIpLink.click();
    await this.ipInput.fill("155.155.155.155");
    await this.saveButton.nth(3).click();
  }

  async ipDeactivation() {
    await this.ipSecurityArea.click();
    await this.deleteIp.click();
    await this.saveButton.nth(3).click();
    await this.addAtLeast1AllowedIpAddress.click();
    await this.ipSecurityDisabled.click();
    await this.saveButton.nth(3).click();
  }

  async bruteForceActivation() {
    await this.numberOfAttempts.fill("2");
    await this.blickingTime.fill("30");
    await this.checkPeriod.fill("30");
    await this.saveButton.nth(4).click();
  }

  async adminMessageActivation() {
    await this.adminMessageEnable.click();
    await this.cancelButton.nth(5).click();
    await this.adminMessageEnable.click();
    await this.saveButton.nth(5).click();
  }

  async adminMessageDeactivation() {
    await this.adminMessageDisabled.click();
    await this.saveButton.nth(5).click();
  }

  async sessionLifetimeActivation() {
    await this.lifetimeEnable.click();
    await this.cancelButton.nth(6).click();
    await this.lifetimeEnable.click();
    await this.lifetimeInput.fill("45");
    await this.saveButton.nth(6).click();
  }

  async sessionLifetimeDeactivation() {
    await this.lifetimeDisabled.click();
    await this.saveButton.nth(6).click();
  }

  async saveChanges() {
    await this.saveButton.first().click();
  }

  async navigateToLoginHistory() {
    await this.navigateToSecurity.click();
    await this.LoginHistoryPage.click();
  }

  async navigateToAuditTrail() {
    await this.navigateToSecurity.click();
    await this.AuditTrailPage.click();
  }
}

export default Security;

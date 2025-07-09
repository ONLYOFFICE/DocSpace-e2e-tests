import { type Locator, type Page } from "@playwright/test";
import BasePage from "../../common/BasePage";
import config from "@/config";

export class Integration extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get navigateToIntegration(): Locator {
    return this.page.getByRole("link", { name: "Integration" });
  }

  get ldapSettingsShow(): Locator {
    return this.page.getByText("Show");
  }

  get ldapSettingsHide(): Locator {
    return this.page.getByText("Hide", { exact: true });
  }

  get enableLdap(): Locator {
    return this.page.locator("circle").first();
  }

  get ldapNameServerInput(): Locator {
    return this.page.locator('input[name="server"]');
  }

  get ldapUserDininput(): Locator {
    return this.page.locator('input[name="userDN"][data-testid="text-input"]');
  }

  get ldapUserFilterInput(): Locator {
    return this.page.getByText("(uid=*)");
  }

  get ldapLoginInput(): Locator {
    return this.page.locator('input[name="login"]');
  }

  get ldapPasswordInput(): Locator {
    return this.page.getByTestId("input-block").getByTestId("text-input");
  }

  get SaveButton(): Locator {
    return this.page.getByRole("button", { name: "Save" });
  }

  get DefaultButton(): Locator {
    return this.page.getByRole("button", { name: "Default settings" });
  }

  get ldapOKButton(): Locator {
    return this.page.getByRole("button", { name: "OK" });
  }

  get ldapLink(): Locator {
    return this.page.getByRole("link", { name: "Learn more" });
  }

  get navigateToSMTP(): Locator {
    return this.page.getByText("SMTP Settings");
  }

  get smtpHost(): Locator {
    return this.page.getByPlaceholder("Enter domain");
  }

  get smtpPort(): Locator {
    return this.page.getByPlaceholder("Enter port");
  }

  get smtpAuthEnable(): Locator {
    return this.page.locator("circle");
  }

  get smtpHostlogin(): Locator {
    return this.page.getByPlaceholder("Enter login");
  }

  get smtpHostPassword(): Locator {
    return this.page.getByPlaceholder("Enter password");
  }

  get smtpSenderDisplayName(): Locator {
    return this.page.getByPlaceholder("Enter name");
  }

  get smtpSenderEmail(): Locator {
    return this.page.getByTestId("email-input");
  }

  get smtpSSLEnable(): Locator {
    return this.page
      .locator("label")
      .filter({ hasText: "Enable SSL" })
      .locator("rect");
  }

  get smtpSendTestMail(): Locator {
    return this.page.getByRole("button", {
      name: "Send Test Mail",
    });
  }

  get smtpLink(): Locator {
    return this.page.getByTestId("link");
  }

  get navigateToThirdParty(): Locator {
    return this.page.getByText("Third-party services");
  }

  get thirdPartyLink(): Locator {
    return this.page.getByTestId("link");
  }

  get ldapUserType(): Locator {
    return this.page.getByTestId("combobox").locator("path");
  }

  get ldapUserTypeDocSpaceadmin(): Locator {
    return this.page.getByText("DocSpace adminPaid");
  }

  get ldapUserTypeRoomAdmin(): Locator {
    return this.page.getByText("Room adminPaid");
  }

  get ldapUserTypeUser(): Locator {
    return this.page.getByText("User", { exact: true });
  }

  get facebookSwitch(): Locator {
    return this.page.locator('[data-consumer="facebook"][data-testid="box"]');
  }

  get facebookID(): Locator {
    return this.page.getByRole("textbox", { name: "Facebook ID" });
  }

  get facebookKey(): Locator {
    return this.page.getByRole("textbox", { name: "Facebook Key" });
  }

  get saveButtonServices(): Locator {
    return this.page.getByRole("button", { name: "Enable" });
  }

  get s3Switch(): Locator {
    return this.page.locator('[data-consumer="s3"]');
  }

  get s3AccessKey(): Locator {
    return this.page.getByRole("textbox", { name: "S3 accesskey" });
  }

  get s3SecretKey(): Locator {
    return this.page.getByRole("textbox", {
      name: "S3 secret access key",
    });
  }

  get manualSyncLDAPButton(): Locator {
    return this.page.getByTestId("button").filter({ hasText: "Sync users" });
  }

  get enableAutoSyncLDAP(): Locator {
    return this.page.locator("circle").nth(1);
  }

  get selectMinute(): Locator {
    return this.page
      .getByTestId("drop-down-item")
      .filter({ hasText: /^05$/ })
      .first();
  }

  get periodBox(): Locator {
    return this.page.getByTestId("cron").locator("path").first();
  }

  get selectEveryDayPeriod(): Locator {
    return this.page
      .getByTestId("drop-down-item")
      .filter({ hasText: /^Every day$/ });
  }

  get hourCombobox(): Locator {
    return this.page.getByTestId("cron").locator("path").nth(3);
  }

  get hourCombobox2(): Locator {
    return this.page
      .getByTestId("cron")
      .locator("div")
      .filter({ hasText: "Every hour" })
      .nth(3);
  }

  get selectEveryHour(): Locator {
    return this.page
      .getByTestId("drop-down-item")
      .filter({ hasText: /^06$/ })
      .nth(1);
  }

  get selectEveryHour2(): Locator {
    return this.page
      .getByTestId("drop-down-item")
      .filter({ hasText: /^06$/ })
      .nth(2);
  }

  get selectWeekPeriod(): Locator {
    return this.page
      .getByTestId("drop-down-item")
      .filter({ hasText: /^Every week$/ });
  }

  get selectMonthPeriod(): Locator {
    return this.page
      .getByTestId("drop-down-item")
      .filter({ hasText: /^Every month$/ });
  }

  get dayCombobox(): Locator {
    return this.page
      .getByTestId("cron")
      .locator("div")
      .filter({ hasText: "Every day of the week" })
      .nth(2);
  }

  get dayOfWeekCombobox(): Locator {
    return this.page
      .getByTestId("cron")
      .locator("div")
      .filter({ hasText: "Day of the week" })
      .nth(2);
  }

  get minuteCombobox(): Locator {
    return this.page
      .getByTestId("cron")
      .locator("div")
      .filter({ hasText: "Every minute" })
      .nth(3);
  }

  get selectDay(): Locator {
    return this.page.locator("div").filter({ hasText: /^Thursday$/ });
  }

  get dayOfTheMounthCombobox(): Locator {
    return this.page
      .getByTestId("cron")
      .locator("div")
      .filter({ hasText: "Day of the month" })
      .nth(2);
  }

  get selectdayOfTheMounth(): Locator {
    return this.page.locator("div").filter({ hasText: /^01$/ }).nth(1);
  }

  get selectEveryEear(): Locator {
    return this.page.locator("div").filter({ hasText: /^Every year$/ });
  }

  get monthBox(): Locator {
    return this.page
      .getByTestId("cron")
      .locator("div")
      .filter({ hasText: "Every month" })
      .nth(2);
  }

  get selectMonth(): Locator {
    return this.page.locator("div").filter({ hasText: /^May$/ });
  }

  async activateLdap() {
    if (
      !config.LDAP_SERVER ||
      !config.LDAP_USER_DN ||
      !config.LDAP_USER_FILTER ||
      !config.LDAP_LOGIN ||
      !config.LDAP_PASSWORD
    ) {
      throw new Error("LDAP configuration is not provided");
    }

    await this.ldapSettingsShow.click();
    await this.ldapSettingsHide.click();
    await this.enableLdap.click();
    await this.ldapNameServerInput.fill(config.LDAP_SERVER);
    await this.ldapUserDininput.fill(config.LDAP_USER_DN);
    await this.ldapUserFilterInput.fill(config.LDAP_USER_FILTER);
    await this.ldapUserType.click();
    await this.ldapUserTypeDocSpaceadmin.click();
    await this.ldapUserType.click();
    await this.ldapUserTypeRoomAdmin.click();
    await this.ldapUserType.click();
    await this.ldapUserTypeUser.click();
    await this.ldapLoginInput.fill(config.LDAP_LOGIN);
    await this.ldapPasswordInput.fill(config.LDAP_PASSWORD);
    await this.SaveButton.click();
  }

  async disableLdap() {
    await this.ldapSettingsShow.click();
    await this.DefaultButton.click();
    await this.ldapOKButton.click();
  }

  async navigateToSMTPSettings() {
    await this.navigateToIntegration.click();
    await this.navigateToSMTP.click();
  }

  async activateSMTP() {
    if (!config.SMTP_HOST_LOGIN || !config.SMTP_HOST_PASSWORD) {
      throw new Error("SMTP configuration is not provided");
    }

    await this.smtpHost.fill("smtp.yandex.com");
    await this.smtpPort.fill("587");
    await this.smtpAuthEnable.click();
    await this.smtpHostlogin.fill(config.SMTP_HOST_LOGIN);
    await this.smtpHostPassword.fill(config.SMTP_HOST_PASSWORD);
    await this.smtpSenderDisplayName.fill("Autotest");
    await this.smtpSenderEmail.fill(config.SMTP_HOST_LOGIN);
    await this.smtpSSLEnable.click();
    await this.SaveButton.click();
  }

  async navigateToThirdPartyServices() {
    await this.navigateToIntegration.click();
    await this.navigateToThirdParty.click();
  }

  async activateFacebook() {
    if (!config.FACEBOOK_ID || !config.FACEBOOK_KEY) {
      throw new Error("Facebook configuration is not provided");
    }

    await this.facebookSwitch.click();
    await this.facebookID.fill(config.FACEBOOK_ID);
    await this.facebookKey.fill(config.FACEBOOK_KEY);
    await this.saveButtonServices.click();
  }

  async activateAWSS3() {
    if (!config.S3_ACCESS_KEY || !config.S3_SECRET_KEY) {
      throw new Error("AWS S3 configuration is not provided");
    }

    await this.s3Switch.click();
    await this.s3AccessKey.fill(config.S3_ACCESS_KEY);
    await this.s3SecretKey.fill(config.S3_SECRET_KEY);
    await this.saveButtonServices.click();
  }

  async manualSyncLdap() {
    await this.navigateToIntegration.click();
    await this.page.waitForTimeout(1000);
    await this.manualSyncLDAPButton.click();
  }

  async everyHour() {
    await this.navigateToIntegration.click();
    await this.page.waitForTimeout(1000);
    await this.enableAutoSyncLDAP.click();
    await this.minuteCombobox.click();
    await this.selectMinute.click();
    await this.SaveButton.click();
  }

  async everyDay() {
    await this.navigateToIntegration.click();
    await this.page.waitForTimeout(1000);
    await this.enableAutoSyncLDAP.click();
    await this.periodBox.click();
    await this.selectEveryDayPeriod.click();
    await this.hourCombobox2.click();
    await this.selectEveryHour.click();
    await this.minuteCombobox.click();
    await this.selectMinute.click();
    await this.SaveButton.click();
  }

  async everyWeek() {
    await this.navigateToIntegration.click();
    await this.page.waitForTimeout(1000);
    await this.enableAutoSyncLDAP.click();
    await this.periodBox.click();
    await this.selectWeekPeriod.click();
    await this.dayCombobox.click();
    await this.selectDay.click();
    await this.hourCombobox2.click();
    await this.selectEveryHour.click();
    await this.minuteCombobox.click();
    await this.selectMinute.click();
    await this.SaveButton.click();
  }

  async everyMonth() {
    await this.navigateToIntegration.click();
    await this.page.waitForTimeout(1000);
    await this.enableAutoSyncLDAP.click();
    await this.periodBox.click();
    await this.selectMonthPeriod.click();
    await this.dayOfTheMounthCombobox.click();
    await this.selectdayOfTheMounth.click();
    await this.dayOfWeekCombobox.click();
    await this.selectDay.click();
    await this.hourCombobox2.click();
    await this.selectEveryHour2.click();
    await this.minuteCombobox.click();
    await this.selectMinute.click();
    await this.SaveButton.click();
  }

  async everyYear() {
    await this.navigateToIntegration.click();
    await this.page.waitForTimeout(1000);
    await this.enableAutoSyncLDAP.click();
    await this.periodBox.click();
    await this.selectEveryEear.click();
    await this.monthBox.click();
    await this.selectMonth.click();
    await this.dayOfTheMounthCombobox.click();
    await this.selectdayOfTheMounth.click();
    await this.dayOfWeekCombobox.click();
    await this.selectDay.click();
    await this.hourCombobox2.click();
    await this.selectEveryHour2.click();
    await this.minuteCombobox.click();
    await this.selectMinute.click();
    await this.SaveButton.click();
  }
}

import { expect, type Locator, type Page } from "@playwright/test";
import BasePage from "../../common/BasePage";
import config from "@/config";
import {
  integrationTabs,
  navItems,
  TIntegrationTabs,
  toastMessages,
} from "@/src/utils/constants/settings";

import BaseDialog from "../../common/BaseDialog";
import {
  waitForGetAuthServiceResponse,
  waitForGetSmptResponse,
  waitForSystemWebPluginsIconsResponse,
} from "./api";

export class Integration extends BasePage {
  dialog: BaseDialog;

  constructor(page: Page) {
    super(page);

    this.dialog = new BaseDialog(page);
  }

  get navigateToIntegration() {
    return this.page.getByRole("link", { name: "Integration" });
  }

  // ldap locators

  get ldapSettingsShow() {
    return this.page.getByText("Show");
  }

  get ldapSettingsHide() {
    return this.page.getByText("Hide", { exact: true });
  }

  get ldapNameServerInput() {
    return this.page.getByTestId("server_field_input");
  }

  get ldapUserDininput() {
    return this.page.getByTestId("user_dn_field_input");
  }

  get ldapUserFilterInput() {
    return this.page.getByTestId("user_filter_field_textarea");
  }

  get ldapLoginInput() {
    return this.page.locator('input[name="login"]');
  }

  get ldapPasswordInput() {
    return this.page.locator('input[name="password"]');
  }

  get ldapDefaultButton() {
    return this.page.getByRole("button", { name: "Default settings" });
  }

  get smtpDefaultButton() {
    return this.page.getByTestId("smtp_default_settings_button");
  }

  get ldapOKButton() {
    return this.page.getByRole("button", { name: "OK" });
  }

  get ldapLink() {
    return this.page.getByRole("link", { name: "Learn more" });
  }

  get userType() {
    return this.page.getByTestId("combobox").locator("path");
  }

  get userTypeDocSpaceadmin() {
    return this.page.getByText("DocSpace adminPaid");
  }

  get userTypeRoomAdmin() {
    return this.page.getByText("Room adminPaid");
  }

  get userTypeUser() {
    return this.page.getByText("User", { exact: true });
  }

  get periodBox() {
    return this.page
      .getByTestId("ldap_cron_period")
      .getByRole("button", { name: /Every/ });
  }

  get selectEveryDayPeriod() {
    return this.page
      .getByTestId(/^drop_down_item_/)
      .filter({ hasText: /^Every day$/ });
  }

  get hourCombobox() {
    return this.page.getByTestId("ldap_cron_hours").getByRole("button");
  }

  get selectEveryHour() {
    return this.page
      .getByTestId(/^drop_down_item_/)
      .filter({ hasText: /^06$/ })
      .nth(1);
  }

  get selectEveryHour2() {
    return this.page
      .getByTestId(/^drop_down_item_/)
      .filter({ hasText: /^06$/ })
      .nth(2);
  }

  get selectWeekPeriod() {
    return this.page
      .getByTestId(/^drop_down_item_/)
      .filter({ hasText: /^Every week$/ });
  }

  get selectMonthPeriod() {
    return this.page
      .getByTestId(/^drop_down_item_/)
      .filter({ hasText: /^Every month$/ });
  }

  get dayCombobox() {
    return this.page.getByTestId("ldap_cron_week_days").getByRole("button");
  }

  get dayOfWeekCombobox() {
    return this.page.getByTestId("ldap_cron_week_days").getByRole("button");
  }

  get minuteCombobox() {
    return this.page.getByTestId("ldap_cron_minutes").getByRole("button");
  }

  get minuteDropdown() {
    return this.page.getByTestId("ldap_cron_minutes_dropdown");
  }

  get selectDay() {
    return this.page.locator("div").filter({ hasText: /^Thursday$/ });
  }

  get dayOfTheMounthCombobox() {
    return this.page.getByTestId("ldap_cron_month_days").getByRole("button");
  }

  get selectDayOfTheMounth() {
    return this.page.locator("div").filter({ hasText: /^01$/ }).nth(1);
  }

  get selectEveryYear(): Locator {
    return this.page
      .getByTestId(/^drop_down_item_/)
      .filter({ hasText: /^Every year$/ });
  }

  get monthBox(): Locator {
    return this.page.getByTestId("ldap_cron_months").getByRole("button");
  }

  get selectMonth(): Locator {
    return this.page.locator("div").filter({ hasText: /^May$/ });
  }

  get selectMinute() {
    return this.page
      .getByTestId(/^drop_down_item_/)
      .filter({ hasText: /^05$/ })
      .first();
  }

  get ldapSettingsHeader() {
    return this.page.getByRole("heading", { name: "LDAP Settings", level: 2 });
  }

  get spSettingsHeader() {
    return this.page.getByRole("heading", { name: "ONLYOFFICE SP Settings" });
  }

  get ldapSaveButton() {
    return this.page.locator(".ldap-save");
  }

  get autoLdapSaveButton() {
    return this.page.locator(".auto-sync-button");
  }
  // TODO: unique locator
  get ldapSwitch() {
    return this.page.getByTestId("toggle-button-container").nth(0);
  }

  // TODO: unique locator
  get autoLdapSwitch() {
    return this.page.getByTestId("toggle-button-container").nth(3);
  }

  get ldapSyncContainer() {
    return this.page.locator(".ldap_sync-container");
  }

  get ldapCronContainer() {
    return this.page.locator(".ldap_cron-container");
  }

  // smpt locators

  get navigateToSMTP() {
    return this.page.getByText("SMTP Settings");
  }

  get smtpHost() {
    return this.page.getByPlaceholder("Enter domain");
  }

  get smtpPort() {
    return this.page.getByPlaceholder("Enter port");
  }

  get smtpAuthEnable() {
    return this.page.locator("circle");
  }

  get smtpHostlogin() {
    return this.page.getByPlaceholder("Enter login");
  }

  get smtpHostPassword() {
    return this.page.getByPlaceholder("Enter password");
  }

  get smtpSenderDisplayName() {
    return this.page.getByPlaceholder("Enter name");
  }

  get smtpSenderEmail() {
    return this.page.getByTestId("smtp_sender_email_input");
  }

  get smtpSSLEnable() {
    return this.page
      .locator("label")
      .filter({ hasText: "Enable SSL" })
      .locator("rect");
  }

  get smtpSendTestMail() {
    return this.page.getByTestId("send_test_mail_button");
  }

  get smtpLink() {
    return this.page.locator(
      '[data-testid="integration_settings_link"][href*="smtpsettings_block"]',
    );
  }

  // third party locators

  get navigateToThirdParty() {
    return this.page.getByText("Third-party services");
  }

  get thirdPartyLink() {
    return this.page.locator(
      '[data-testid="integration_settings_link"][href*="thirdpartyserviceintegration_block"]',
    );
  }

  get facebookSwitch() {
    return this.page.locator(
      '[data-consumer="facebook"] [data-testid="toggle-button-container"]',
    );
  }

  get googleCloudSwitch() {
    return this.page.locator(
      '[data-consumer="googlecloud"] [data-testid="toggle-button-container"]',
    );
  }

  get rackspaceSwitch() {
    return this.page.locator(
      '[data-consumer="rackspace"] [data-testid="toggle-button-container"]',
    );
  }

  get facebookID() {
    return this.page.getByRole("textbox", { name: "Facebook ID" });
  }

  get facebookKey() {
    return this.page.getByRole("textbox", { name: "Facebook Key" });
  }

  get saveButtonServices() {
    return this.page.getByTestId("consumer_dialog_enable_button");
  }

  get s3Switch() {
    return this.page
      .getByTestId("consumer_s3_item")
      .getByTestId("toggle-button-container");
  }

  get s3AccessKey() {
    return this.page.getByTestId("acesskey_input");
  }

  get s3SecretKey() {
    return this.page.getByTestId("secretaccesskey_input");
  }

  get googleCloudJsonInput() {
    return this.page.getByPlaceholder("json");
  }

  get rackspaceKeyInput() {
    return this.page.getByRole("textbox", { name: "Rackspace apiKey" });
  }

  get manualSyncLDAPButton() {
    return this.page.getByTestId("manual_sync_button");
  }

  get saveButton() {
    return this.page.getByTestId("smtp_settings_save_button");
  }

  // sso locators

  get ssoSwitch() {
    return this.page.locator("label.enable-sso");
  }

  get ssoXmlUrlInput() {
    return this.page.locator("#uploadXmlUrl");
  }

  // plugins locators

  get speecToTextPluginSettingsButton() {
    return this.page.locator(".plugin-controls").nth(0);
  }
  get speecToTextPluginSwitch() {
    return this.page.locator(".plugin-controls").nth(1);
  }

  //

  async checkLdapSettingsExist() {
    await expect(this.ldapSettingsHeader).toBeVisible();
  }

  async checkSsoSettingsExist() {
    await expect(this.spSettingsHeader).toBeVisible();
  }

  async open() {
    await this.navigateToSettings();
    await this.navigateToArticle(navItems.integration);
    await this.checkLdapSettingsExist();
  }

  async enableLdap() {
    const checkbox = this.ldapSwitch.locator("input");
    const isChecked = await checkbox.isChecked();

    if (!isChecked) {
      await this.ldapSwitch.click();
      await expect(this.ldapNameServerInput).not.toBeDisabled();
    }
  }

  async hideNextSyncDate() {
    const nextSyncDate = this.ldapSyncContainer.getByRole("paragraph").filter({
      hasText: "Next synchronization:",
    });

    await nextSyncDate.evaluate((el) => (el.style.display = "none"));
  }

  async enableAutoSyncLDAP() {
    const checkbox = this.autoLdapSwitch.locator("input");
    const isChecked = await checkbox.isChecked();

    if (!isChecked) {
      await this.autoLdapSwitch.click();
      await expect(this.ldapCronContainer).toBeVisible();
      await this.hideNextSyncDate();
    }
  }

  async disableAutoSyncLDAP() {
    const checkbox = this.autoLdapSwitch.locator("input");
    const isChecked = await checkbox.isChecked();

    if (isChecked) {
      await this.autoLdapSwitch.click();
      await this.removeToast(toastMessages.settingsUpdated);
    }
  }

  async openTab(tab: TIntegrationTabs) {
    switch (tab) {
      case integrationTabs.ldap:
        await this.page.getByTestId(tab).click();
        await this.checkLdapSettingsExist();
        break;

      case integrationTabs.sso: {
        await this.page.getByTestId(tab).click();
        await this.checkSsoSettingsExist();
        break;
      }

      case integrationTabs.plugins: {
        await this.page.getByTestId(tab).click();
        await waitForSystemWebPluginsIconsResponse(this.page);
        break;
      }

      case integrationTabs.smtp: {
        const promise = waitForGetSmptResponse(this.page);
        await this.page.getByTestId(tab).click();
        await promise;
        break;
      }

      case integrationTabs.thirdPartyServices: {
        const promise = waitForGetAuthServiceResponse(this.page);
        await this.page.getByTestId(tab).click();
        await promise;
        break;
      }

      default:
        throw new Error("Invalid tab");
    }
  }

  async disableLdap() {
    await this.ldapDefaultButton.click();
    await this.ldapOKButton.click();
    await this.checkOperationCompleted();
  }
  async checkOperationCompleted() {
    await this.removeToast(toastMessages.operationCompleted);
    const textLocator = this.page.locator(
      "text=100% Operation has been successfully completed.",
    );
    await expect(textLocator).toBeVisible();
    await expect(textLocator).toBeHidden();
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
    await this.enableLdap();
    await this.ldapNameServerInput.fill(config.LDAP_SERVER);
    await this.ldapUserDininput.fill(config.LDAP_USER_DN);
    await this.ldapUserFilterInput.fill(config.LDAP_USER_FILTER);
    await this.userType.click();
    await expect(this.page.locator('[data-key="roomAdmin"]')).toBeVisible();
    await this.userTypeDocSpaceadmin.click();
    await this.userType.click();
    await this.userTypeRoomAdmin.click();
    await this.userType.click();
    await this.userTypeUser.click();
    await this.ldapLoginInput.fill(config.LDAP_LOGIN);
    await this.ldapPasswordInput.fill(config.LDAP_PASSWORD);
    await this.ldapSaveButton.click();
    await this.checkOperationCompleted();
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
    const promise = waitForGetSmptResponse(this.page);
    await this.saveButton.click();
    await promise;
    await this.removeToast(toastMessages.settingsUpdated);
  }
  async activateFacebook() {
    if (!config.FACEBOOK_ID || !config.FACEBOOK_KEY) {
      throw new Error("Facebook configuration is not provided");
    }

    await this.facebookSwitch.click();
    await expect(this.facebookID).toBeVisible();
    await this.facebookID.fill(config.FACEBOOK_ID);
    await this.facebookKey.fill(config.FACEBOOK_KEY);
    await this.saveButtonServices.click();
    await this.removeToast(toastMessages.updatedSuccessfully);
  }

  async deactivateFacebook() {
    await this.facebookSwitch.click();
    await this.removeToast(toastMessages.deactivatedSuccessfully);
  }

  async s3SwitchClick() {
    await expect(this.s3Switch).toBeVisible();
    await expect(async () => {
      await this.s3Switch.click();
      await expect(this.s3AccessKey).toBeVisible();
    }).toPass();
  }

  async activateAWSS3() {
    if (!config.S3_ACCESS_KEY || !config.S3_SECRET_KEY) {
      throw new Error("AWS S3 configuration is not provided");
    }
    await this.s3SwitchClick();
    await expect(this.s3AccessKey).toBeVisible();
    await this.s3AccessKey.fill(config.S3_ACCESS_KEY);
    await this.s3SecretKey.fill(config.S3_SECRET_KEY);
    await this.saveButtonServices.click();
    await this.removeToast(toastMessages.updatedSuccessfully);
  }

  async deactivateAWSS3() {
    await this.s3Switch.click();
    await this.removeToast(toastMessages.deactivatedSuccessfully);
  }

  async activateGoogleCloud() {
    await this.googleCloudSwitch.click();
    await expect(this.googleCloudJsonInput).toBeVisible();
    // TODO: ACTIVATION
    await this.page.mouse.click(1, 1);
  }

  async activateRackspace() {
    await this.rackspaceSwitch.click();
    await expect(this.rackspaceKeyInput).toBeVisible();
    // TODO: ACTIVATION
    await this.page.mouse.click(1, 1);
  }

  async manualSyncLdap() {
    await this.manualSyncLDAPButton.click();
    await this.checkOperationCompleted();
  }

  async everyHour() {
    await this.openTab(integrationTabs.ldap);
    await this.enableAutoSyncLDAP();
    await this.minuteCombobox.click();
    await expect(this.minuteDropdown).toBeVisible();
    await this.selectMinute.click();
    await this.autoLdapSaveButton.click();
    await this.removeToast(toastMessages.settingsUpdated);
    await this.disableAutoSyncLDAP();
  }

  async everyDay() {
    await this.openTab(integrationTabs.ldap);
    await this.enableAutoSyncLDAP();
    await this.periodBox.click();
    await this.selectEveryDayPeriod.click();
    await this.hourCombobox.click();
    await this.selectEveryHour.click();
    await this.minuteCombobox.click();
    await expect(this.minuteDropdown).toBeVisible();
    await this.selectMinute.click();
    await this.autoLdapSaveButton.click();
    await this.removeToast(toastMessages.settingsUpdated);
    await this.disableAutoSyncLDAP();
  }

  async everyWeek() {
    await this.openTab(integrationTabs.ldap);
    await this.enableAutoSyncLDAP();
    await this.periodBox.click();
    await this.selectWeekPeriod.click();
    await this.dayCombobox.click();
    await this.selectDay.click();
    await this.hourCombobox.click();
    await this.selectEveryHour.click();
    await this.minuteCombobox.click();
    await expect(this.minuteDropdown).toBeVisible();
    await this.selectMinute.click();
    await this.autoLdapSaveButton.click();
    await this.removeToast(toastMessages.settingsUpdated);
    await this.disableAutoSyncLDAP();
  }

  async everyMonth() {
    await this.openTab(integrationTabs.ldap);
    await this.enableAutoSyncLDAP();
    await this.periodBox.click();
    await this.selectMonthPeriod.click();
    await this.dayOfTheMounthCombobox.click();
    await this.selectDayOfTheMounth.click();
    await this.dayOfWeekCombobox.click();
    await this.selectDay.click();
    await this.hourCombobox.click();
    await this.selectEveryHour2.click();
    await this.minuteCombobox.click();
    await expect(this.minuteDropdown).toBeVisible();
    await this.selectMinute.click();
    await this.autoLdapSaveButton.click();
    await this.removeToast(toastMessages.settingsUpdated);
    await this.disableAutoSyncLDAP();
  }

  async everyYear() {
    await this.openTab(integrationTabs.ldap);
    await this.enableAutoSyncLDAP();
    await this.periodBox.click();
    await this.selectEveryYear.click();
    await this.monthBox.click();
    await this.selectMonth.click();
    await this.dayOfTheMounthCombobox.click();
    await this.selectDayOfTheMounth.click();
    await this.dayOfWeekCombobox.click();
    await this.selectDay.click();
    await this.hourCombobox.click();
    await this.selectEveryHour2.click();
    await this.minuteCombobox.click();
    await expect(this.minuteDropdown).toBeVisible();
    await this.selectMinute.click();
    await this.autoLdapSaveButton.click();
    await this.removeToast(toastMessages.settingsUpdated);
    await this.disableAutoSyncLDAP();
  }
}

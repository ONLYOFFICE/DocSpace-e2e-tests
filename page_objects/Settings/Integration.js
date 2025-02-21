import MainPage from "../mainPage.js";
import config from "../../config/config.js";

export class Integration extends MainPage {
    constructor(page) {
        super(page);
        this.page = page;
        this.navigateToIntegration = page.getByRole('link', { name: 'Integration' });
        this.ldapSettingsShow = page.getByText('Show');
        this.ldapSettingsHide = page.getByText('Hide', { exact: true });
        this.enableLdap = page.locator('circle').first();
        this.ldapNameServerInput = page.locator('input[name="server"]');
        this.ldapUserDininput = page.locator('input[name="userDN"][data-testid="text-input"]');
        this.ldapUserFilterInput = page.getByText('(uid=*)');
        this.ldapLoginInput = page.locator('input[name="login"]');
        this.ldapPasswordInput = page.getByTestId('input-block').getByTestId('text-input');
        this.SaveButton = page.getByRole('button', { name: 'Save' });
        this.DefaultButton = page.getByRole('button', { name: 'Default settings' });
        this.ldapOKButton = page.getByRole('button', { name: 'OK' });
        this.ldapLink = page.getByRole('link', { name: 'Learn more' });
        this.navigateToSMTP = page.getByText('SMTP Settings');
        this.smtpHost = page.getByPlaceholder('Enter domain');
        this.smtpPort = page.getByPlaceholder('Enter port');
        this.smtpAuthEnable = page.locator('circle');
        this.smtpHostlogin = page.getByPlaceholder('Enter login');
        this.smtpHostPassword = page.getByPlaceholder('Enter password');
        this.smtpSenderDisplayName = page.getByPlaceholder('Enter name');
        this.smtpSenderEmail = page.getByTestId('email-input');
        this.smtpSSLEnable = page.locator('label').filter({ hasText: 'Enable SSL' }).locator('rect');
        this.removeToast = page.getByText('Settings have been successfully updated');
        this.smtpSendTestMail = page.getByRole('button', { name: 'Send Test Mail' });
        this.removeToast2 = page.getByText('Operation has been successfully completed.');
        this.smtpLink = page.getByTestId('link');
        this.navigateToThirdParty = page.getByText('Third-party services');
        this.thirdPartyLink = page.getByTestId('link');
        this.ldapUserType = page.getByTestId('combobox').locator('path');
        this.ldapUserTypeDocSpaceadmin = page.getByText('DocSpace adminPaid');
        this.ldapUserTypeRoomAdmin = page.getByText('Room adminPaid');
        this.ldapUserTypeUser = page.getByText('User', { exact: true });
        this.facebookSwitch = page.locator('[data-consumer="facebook"][data-testid="box"]');
        this.facebookID = page.getByRole('textbox', { name: 'Facebook ID' });
        this.facebookKey = page.getByRole('textbox', { name: 'Facebook Key' });
        this.saveButtonServices = page.getByRole('button', { name: 'Enable' });
        this.s3Switch = page.locator('[data-consumer="s3"][data-testid="box"]');
        this.s3AccessKey = page.getByRole('textbox', { name: 'S3 accesskey' });
        this.s3SecretKey = page.getByRole('textbox', { name: 'S3 secret access key' });
        this.manualSyncLDAPButton = page.getByTestId('button', { name: 'Sync users' });
        this.enableAutoSyncLDAP = page.locator('circle').nth(1);
        this.selectMinute = page.getByTestId('drop-down-item').filter({ hasText: /^05$/ }).first();
        this.periodBox = page.getByTestId('cron').locator('path').first();
        this.selectEveryDayPeriod = page.getByTestId('drop-down-item').filter({ hasText: /^Every day$/ });
        this.hourCombobox = page.getByTestId('cron').locator('path').nth(3);
        this.hourCombobox2 = page.getByTestId('cron').locator('div').filter({ hasText: 'Every hour' }).nth(3);
        this.selectEveryHour = page.getByTestId('drop-down-item').filter({ hasText: /^06$/ }).nth(1);
        this.selectEveryHour2 = page.getByTestId('drop-down-item').filter({ hasText: /^06$/ }).nth(2);
        this.selectWeekPeriod = page.getByTestId('drop-down-item').filter({ hasText: /^Every week$/ });
        this.selectMonthPeriod = page.getByTestId('drop-down-item').filter({ hasText: /^Every month$/ });
        this.dayCombobox = page.getByTestId('cron').locator('div').filter({ hasText: 'Every day of the week' }).nth(2);
        this.dayOfWeekCombobox = page.getByTestId('cron').locator('div').filter({ hasText: 'Day of the week' }).nth(2);
        this.minuteCombobox = page.getByTestId('cron').locator('div').filter({ hasText: 'Every minute' }).nth(3);       
        this.selectDay = page.locator('div').filter({ hasText: /^Thursday$/ });
        this.dayOfTheMounthCombobox = page.getByTestId('cron').locator('div').filter({ hasText: 'Day of the month' }).nth(2);
        this.selectdayOfTheMounth = page.locator('div').filter({ hasText: /^01$/ }).nth(1);
        this.selectEveryEear = page.locator('div').filter({ hasText: /^Every year$/ });
        this.monthBox = page.getByTestId('cron').locator('div').filter({ hasText: 'Every month' }).nth(2);
        this.selectMonth = page.locator('div').filter({ hasText: /^May$/ });
    }

    async activateLdap() {
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
        await this.smtpHost.fill('smtp.yandex.com');
        await this.smtpPort.fill('587');
        await this.smtpAuthEnable.click();
        await this.smtpHostlogin.fill(config.SMTP_HOST_LOGIN);
        await this.smtpHostPassword.fill(config.SMTP_HOST_PASSWORD);
        await this.smtpSenderDisplayName.fill('Autotest');
        await this.smtpSenderEmail.fill(config.SMTP_HOST_LOGIN);
        await this.smtpSSLEnable.click();
        await this.SaveButton.click();        
    }

    async navigateToThirdPartyServices() {
        await this.navigateToIntegration.click();
        await this.navigateToThirdParty.click();
    }

    async activateFacebook() {
        await this.facebookSwitch.click();
        await this.facebookID.fill(config.FACEBOOK_ID);
        await this.facebookKey.fill(config.FACEBOOK_KEY);
        await this.saveButtonServices.click();
    }

    async activateAWSS3() {
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
import MainPage from "../MainPage";
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

    async defaultLdap() {
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
}



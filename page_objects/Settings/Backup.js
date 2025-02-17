import MainPage from "../MainPage";
import { Integration } from "./Integration";
import config from "../../config/config.js";

export class Backup extends MainPage {
    constructor(page) {
        super(page);
        this.page = page;
        this.integration = new Integration(page);
        this.navigateTobackup = page.getByRole('link', { name: 'Backup' });
        this.backupGuideLink = page.getByTestId('link');
        this.autoBackupTub = page.getByText('Automatic backup');
        this.enableAutoBAckupSwitch = page.locator('circle');
        this.selectRoom = page.getByTestId('file-input');
        this.forwardDocSpace = page.getByTestId('selector').getByText('DocSpace');
        this.forwardDocuments = page.getByTestId('selector').getByRole('paragraph').filter({ hasText: 'Documents' });
        this.selectButton = page.getByRole('button', { name: 'Select' });
        this.timeCombobox = page.getByTestId('combobox').and(page.locator('.schedule-backup_combobox.time_options'));
        this.selectTime = page.getByText('6:00');
        this.numberCopyBox = page.getByTestId('combobox').and(page.locator('.schedule-backup_combobox.max_copies'));
        this.selectCopies = page.locator('div:nth-child(16) > .ScrollbarsCustom > .ScrollbarsCustom-Wrapper > .scroller > .ScrollbarsCustom-Content > div > div:nth-child(5)');
        this.saveButton = page.locator('#save[data-testid="button"]');
        this.saveButton2 = page.getByRole('button', { name: 'Save' });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
        this.periodBox = page.getByTestId('combobox').and(page.locator('.schedule-backup_combobox.days_option'));
        this.selectPeriod = page.getByText('Every week');
        this.dayBox = page.getByTestId('combobox').and(page.locator('.schedule-backup_combobox.weekly_option'));
        this.selectDay = page.getByText('Friday');
        this.monthBox = page.getByTestId('combobox').and(page.locator('.schedule-backup_combobox.monthly_option'));
        this.selectEveryMonth = page.getByTestId('drop-down-item').filter({ hasText: 'Every month' });
        this.monthSelectorBox = page.getByTestId('combobox').and(page.locator('.schedule-backup_combobox.month_options'));
        this.selectMonth = page.getByTestId('drop-down-item').filter({ hasText: /^6$/ }).nth(0);
        this.removeToast = page.getByText('Settings have been successfully updated');
        this.createBackupButton = page.getByTestId('button').filter({ hasText: 'Create' });
        this.createCopyButton = page.getByTestId('button').filter({ hasText: 'Create copy' });
        this.selectBackupRoom = page.locator('#backup-room path');
        this.selectThirdPartyStorage = page.locator('#third-party-storage path');
        this.bucketInput = page.getByTestId('text-input').and(page.locator('[name="bucket"]'));
        this.regionCombobox = page.getByTestId('combobox').and(page.locator('.region-combo-box'));
        this.regionSelect = page.getByTestId('drop-down-item').and(page.locator('.drop-down-item')).filter({ hasText: 'US East (N. Virginia) (us-east-1)' });
        this.scrollContainer = page.locator('.ScrollbarsCustom-Content');
        this.selectThirdPartyResource = page.locator('#third-party-resource path');
        this.resourceBox = page.getByTestId('combobox');
        this.selectNextcloud = page.getByTestId('drop-down-item').and(page.locator('[data-third-party-key="Nextcloud"]'));
        this.connectButton = page.getByTestId('button').filter({ hasText: 'Connect' });
        this.connectionUrlInput = page.locator('#connection-url-input');
        this.loginInput = page.locator('#login-input');
        this.passwordInput = page.getByTestId('input-block').getByTestId('text-input');
        this.selectNextCloudRepo = page.getByTestId('selector').getByRole('paragraph').filter({ hasText: 'Documents' });
        this.seveHerButton = page.getByTestId('button').filter({ hasText: 'Save here' });
        this.saveButtonAutoBackup = page.getByRole('button', { name: 'Save', exact: true });
        this.actionMenuResource = page.getByTestId('context-menu-button').getByRole('img');
        this.disconnectButton = page.getByText('Disconnect');
        this.okButton = page.getByRole('button', { name: 'OK' }).nth(1);
    }

    async navigateToAutoBackup() {
        await this.navigateTobackup.click();
        await this.autoBackupTub.click();
    }

    async BackupGuidePopup() {
        const page1Promise = this.page.waitForEvent('popup');
        await this.backupGuideLink.click();
        const page1 = await page1Promise;
        return page1;
    }

    async backupRoom() {
        await this.enableAutoBAckupSwitch.click();
        await this.selectRoom.click();
        await this.forwardDocSpace.click();
        await this.forwardDocuments.click();
        await this.selectButton.click();
    }

    async autoSavePeriodForEveryDay() {
        await this.timeCombobox.click();
        await this.selectTime.click();
        await this.numberCopyBox.click();
        await this.selectCopies.click();
        await this.saveButton2.click();
    }

    async disableAutoBackup() {
        await this.enableAutoBAckupSwitch.click();
        await this.cancelButton.click();
        await this.enableAutoBAckupSwitch.click();
        await this.saveButton2.click();
    }

    async autoSavePeriodForEveryWeek() {
        await this.periodBox.click();
        await this.selectPeriod.click();
        await this.dayBox.click();
        await this.selectDay.click();
        await this.timeCombobox.click();
        await this.selectTime.click();
        await this.numberCopyBox.click();
        await this.selectCopies.click();
        await this.saveButton2.click();
    }

    async autoSavePeriodForEveryMonth() {
        await this.periodBox.click();
        await this.selectEveryMonth.click();
        await this.monthSelectorBox.click();
        await this.selectMonth.click();
        await this.timeCombobox.click();
        await this.selectTime.click();
        await this.numberCopyBox.click();
        await this.selectCopies.click();
        await this.saveButton2.click();
    }

    async createBackupInRoom() {
        await this.selectBackupRoom.click();
        await this.selectRoom.click();
        await this.forwardDocSpace.click();
        await this.forwardDocuments.click();
        await this.selectButton.click();
        await this.createCopyButton.click();
    }

    async activateAWSS3() {
        await this.integration.navigateToThirdPartyServices();
        await this.integration.activateAWSS3();
    }

    async s3Backup() {
        await this.navigateTobackup.click();
        await this.selectThirdPartyStorage.click();
        await this.bucketInput.fill('portals-manual');
        await this.regionCombobox.click();
        await this.page.waitForTimeout(500);
        await this.page.evaluate(() => {
            // We try to find the container in different ways
            const containers = [
                document.querySelector('.ScrollbarsCustom-Content'),
                document.querySelector('.combo-button_opened .ScrollbarsCustom-Content'),
                document.querySelector('[role="listbox"] .ScrollbarsCustom-Content'),
                ...Array.from(document.querySelectorAll('.ScrollbarsCustom-Content'))
            ].filter(Boolean);
            // We try to scroll through each container found
            containers.forEach(container => {
                container.scrollTop = 1000;
                container.parentElement.scrollTop = 1000;
            });
        });
        await this.page.waitForTimeout(1000);
        const usEastOption = this.page.getByText('US East (N. Virginia) (us-east-1)', { exact: true });
        await usEastOption.click();
        await this.createCopyButton.click();
    }

    async s3AutoBackup() {
        await this.enableAutoBAckupSwitch.click();
        await this.selectThirdPartyStorage.click();
        await this.bucketInput.fill('portals-manual');
        await this.regionCombobox.click();
        await this.page.waitForTimeout(500);
        await this.page.evaluate(() => {
            // We try to find the container in different ways
            const containers = [
                document.querySelector('.ScrollbarsCustom-Content'),
                document.querySelector('.combo-button_opened .ScrollbarsCustom-Content'),
                document.querySelector('[role="listbox"] .ScrollbarsCustom-Content'),
                ...Array.from(document.querySelectorAll('.ScrollbarsCustom-Content'))
            ].filter(Boolean);
            // We try to scroll through each container found
            containers.forEach(container => {
                container.scrollTop = 1000;
                container.parentElement.scrollTop = 1000;
            });
        });
        await this.page.waitForTimeout(1000);
        const usEastOption = this.page.getByText('US East (N. Virginia) (us-east-1)', { exact: true });
        await usEastOption.click();
        await this.saveButton2.click();
    }

    async nextcloudBackup() {
        await this.selectThirdPartyResource.click();
        await this.page.waitForTimeout(500);
        await this.resourceBox.click();
        await this.page.waitForTimeout(500);
        await this.selectNextcloud.click();
        await this.connectButton.click();
        await this.connectionUrlInput.fill(config.NEXTCLOUD_URL);
        await this.loginInput.fill(config.NEXTCLOUD_LOGIN);
        await this.passwordInput.fill(config.NEXTCLOUD_PASSWORD);
        await this.saveButton.click();
        await this.selectRoom.click();
        await this.page.waitForTimeout(2000);
        await this.selectNextCloudRepo.click();
        await this.selectButton.click();
        await this.createCopyButton.click();
    }

    async disconnectNextcloud() {
        await this.actionMenuResource.click();
        await this.disconnectButton.click();
        await this.okButton.click();
    }

    async nextcloudAutoBackup() {
        await this.enableAutoBAckupSwitch.click();
        await this.selectThirdPartyResource.click();
        await this.page.waitForTimeout(500); // Ждем после первого клика
        await this.resourceBox.first().click();
        await this.page.waitForTimeout(500); // Ждем после открытия комбобокса
        await this.selectNextcloud.click();
        await this.connectButton.click();
        await this.connectionUrlInput.fill(config.NEXTCLOUD_URL);
        await this.loginInput.fill(config.NEXTCLOUD_LOGIN);
        await this.passwordInput.fill(config.NEXTCLOUD_PASSWORD);
        await this.saveButton.click();
        await this.selectRoom.click();
        await this.page.waitForTimeout(2000);
        await this.selectNextCloudRepo.click();
        await this.seveHerButton.click();
        await this.saveButtonAutoBackup.click();
    }
}

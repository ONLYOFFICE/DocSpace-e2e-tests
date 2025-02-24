import MainPage from "../mainPage";

export class StorageManagement extends MainPage {
    constructor(page) {
        super(page);
        this.page = page;
        this.navigateToStorageManagement = page.getByRole('link', { name: 'Storage management' });
        this.storageManagementGuideLink = page.getByRole('link', { name: 'Help Center.' });
        this.onOffQuotaRoom = page.locator('label').filter({ hasText: 'Define quota per room' }).locator('circle');
        this.onOffQuotaUser = page.locator('label').filter({ hasText: 'Define quota per user' }).locator('circle');
        this.combobox = page.getByTestId('combobox').locator('div').first();
        this.combobox2 = page.getByTestId('combobox').getByTestId('text');
        this.selectKB = page.getByText('KB');
        this.selectGB = page.getByText('GB');
        this.selectTB = page.getByText('TB', { exact: true });
        this.cancelButton = page.getByRole('button', { name: 'Cancel' });
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.textInput = page.getByTestId('text-input');
        this.removeToast = page.getByText('Room quota has been successfully enabled.');
        this.removeToast2 = page.getByText('User quota has been successfully enabled.');
    }

    async QuotaRoomActivate() {
        await this.onOffQuotaRoom.click();
        await this.combobox.click();
        await this.selectKB.click();
        await this.combobox2.click();
        await this.selectGB.click();
        await this.combobox2.click();
        await this.selectTB.click();
        await this.cancelButton.click();
        await this.onOffQuotaRoom.click();
        await this.textInput.fill('500');
        await this.saveButton.click();
    }

    async QuotaUserActivate() {
        await this.onOffQuotaUser.click();
        await this.combobox.click();
        await this.selectKB.click();
        await this.combobox2.click();
        await this.selectGB.click();
        await this.combobox2.click();
        await this.selectTB.click();
        await this.cancelButton.click();
        await this.onOffQuotaUser.click();
        await this.textInput.fill('500');
        await this.saveButton.click();
    }

}
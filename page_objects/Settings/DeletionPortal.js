import MainPage from "../mainPage";

export class DeletionPortal extends MainPage {
    constructor(page) {
        super(page);
        this.page = page;
        this.navigateToDeletionPortal = page.getByRole('link', { name: 'DocSpace Deletion' });
        this.deleteAreaButton = page.locator('div').filter({ hasText: /^Delete$/ }).first();
        this.deleteButton = page.locator('#sectionScroll').getByTestId('button');
        this.modalDialog = page.locator('#modal-dialog');
        this.approveDeleteButton = this.modalDialog.getByRole('button', { name: 'Delete' });
        this.navigateToDeactivation = page.getByText('Deactivate DocSpace');
        this.deactivateAreaButton = page.locator('div').filter({ hasText: /^Deactivate$/ }).first();
        this.deactivateButton = page.getByTestId('button');
    }

    async deletionPortal() {
        await this.deleteAreaButton.click();
        await this.deleteButton.click();
        await this.modalDialog.waitFor({ state: 'visible', timeout: 5000 });
        await this.approveDeleteButton.click();
    }

    async deactivationPortal() {
        await this.navigateToDeactivation.click();
        await this.deactivateAreaButton.click();
        await this.deactivateButton.click();
    }
};
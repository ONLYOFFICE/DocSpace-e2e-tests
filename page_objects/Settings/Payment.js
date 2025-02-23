import MainPage from "../mainPage";

export class Payment extends MainPage {
    constructor(page, context) {
        super(page);
        this.page = page;
        this.context = context;
        this.numberOfadmins = page.getByTestId('text-input');
        this.upgradeNowButton = page.getByTestId('button');
        this.portalUrl = null; 
        this.page3 = null; 
        this.minusButton = page.locator('.circle').first();
        this.approveButton = page.getByTestId('button');
        this.removeToast = page.getByText('Business plan updated');
        this.plusButton = page.locator('.payment-users > div:nth-child(3)');
    }

    async upgradePlan() {
        this.portalUrl = this.page.url();
        await this.numberOfadmins.fill('10');
        await this.page.waitForTimeout(2000);
        const page3Promise = this.context.waitForEvent('page');
        await this.upgradeNowButton.click();
        this.page3 = await page3Promise;
        await this.page3.waitForLoadState();
    }

    async fillPaymentData() {
        await this.page3.getByRole('button', { name: 'Enter address manually' }).click();
        await this.page3.waitForTimeout(2000);
        await this.page3.getByPlaceholder('Full name').fill('Admin-zero');
        await this.page3.waitForTimeout(2000);
        await this.page3.getByLabel('Country or region').selectOption('US');
        await this.page3.waitForTimeout(2000);
        await this.page3.getByPlaceholder('Address line 1').fill('1 World Way');
        await this.page3.waitForTimeout(2000);
        await this.page3.getByPlaceholder('Address line 2').fill('1 World Way');
        await this.page3.waitForTimeout(2000);
        await this.page3.getByPlaceholder('City').fill('Los Angeles');
        await this.page3.waitForTimeout(2000);
        await this.page3.getByPlaceholder('Zip').fill('90045');
        await this.page3.waitForTimeout(2000);
        await this.page3.getByLabel('State').selectOption('CA');
        await this.page3.waitForTimeout(2000);
        await this.page3.getByPlaceholder('(800) 555-').fill('(800) 555-4545');
        await this.page3.waitForTimeout(2000);
        await this.page3.getByPlaceholder('1234 1234 1234').fill('4242 4242 4242 4242');
        await this.page3.waitForTimeout(2000);
        await this.page3.getByPlaceholder('MM / YY').fill('01 / 30');
        await this.page3.waitForTimeout(2000);
        await this.page3.getByPlaceholder('CVC').fill('123');
        await this.page3.waitForTimeout(2000);
        await this.page3.locator('[data-testid="submit-button-processing-label"]').click();
    }

    async returnToPortal() {
        const returnUrl = new URL('/portal-settings/payments/portal-payments?complete=true', this.portalUrl).href;
        await this.page3.goto(returnUrl);
    }

    async downgradePlan() {
        await this.minusButton.click();
        await this.approveButton.click();
    }

    async updatePlan() {
        await this.page.waitForTimeout(1000);
        await this.plusButton.click();
        await this.approveButton.click();
    }
}
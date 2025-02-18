export default class MainPage {
  constructor(page) {
    this.page = page;
    this.optionsButton = page.locator('[data-testid="icon-button"].option-button-icon');
    this.settingsMenuItem = page.getByRole('menuitem', { name: 'Settings' });
    this.paymentsMenuItem = page.getByRole('menuitem', { name: 'Payments' });
  }

  async navigateToSettings() {
    await this.optionsButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.optionsButton.click();
    await this.settingsMenuItem.click();
  }

  async navigateToPayments() {
    await this.optionsButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.optionsButton.click();
    await this.paymentsMenuItem.click();
  }
}

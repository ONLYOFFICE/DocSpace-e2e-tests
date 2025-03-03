export default class MainPage {
  constructor(page) {
    this.page = page;
    this.optionsButton = page.locator(
      '[data-testid="icon-button"].option-button-icon',
    );
    this.settingsMenuItem = page
      .locator("li.p-menuitem a.p-menuitem-link")
      .filter({ hasText: "Settings" });
    this.paymentsMenuItem = page
      .locator("li.p-menuitem a.p-menuitem-link")
      .filter({ hasText: "Payments" });
  }

  async navigateToSettings() {
    await this.optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await this.optionsButton.click();
    await this.page.waitForLoadState("domcontentloaded");
    await this.settingsMenuItem.click();
  }

  async navigateToPayments() {
    await this.optionsButton.waitFor({ state: "visible", timeout: 10000 });
    await this.optionsButton.click();
    await this.page.waitForLoadState("domcontentloaded");
    await this.paymentsMenuItem.click();
  }
}

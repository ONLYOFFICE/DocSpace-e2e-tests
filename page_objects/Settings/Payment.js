import MainPage from "../mainPage";

export class Payment extends MainPage {
  constructor(page, context) {
    super(page);
    this.page = page;
    this.context = context;
    this.numberOfadmins = page.getByTestId("text-input");
    this.upgradeNowButton = page.getByTestId("button");
    this.portalUrl = null;
    this.page1 = null;
    this.minusButton = page.locator(".circle").first();
    this.approveButton = page.getByTestId("button");
    this.removeToast = page.getByText("Business plan updated");
    this.plusButton = page.locator(".payment-users > div:nth-child(3)");
  }

  async upgradePlan() {
    this.portalUrl = this.page.url();
    await this.numberOfadmins.fill("10");
    await this.page.waitForTimeout(2000);
    const page1Promise = this.context.waitForEvent("page");
    await this.upgradeNowButton.click();
    this.page1 = await page1Promise;
    await this.page1.waitForLoadState();
  }

  async fillPaymentData() {
    await this.page1
      .getByRole("button", { name: "Enter address manually" })
      .click();
    await this.page1.waitForTimeout(2000);
    await this.page1.getByPlaceholder("Full name").fill("Admin-zero");
    await this.page1.getByLabel("Country or region").selectOption("US");
    await this.page1.getByPlaceholder("Address line 1").fill("1 World Way");
    await this.page1.getByPlaceholder("Address line 2").fill("1 World Way");
    await this.page1.getByPlaceholder("City").fill("Los Angeles");
    await this.page1.getByPlaceholder("Zip").fill("90045");
    await this.page1.getByLabel("State").selectOption("CA");
    await this.page1.getByPlaceholder("(800) 555-").fill("(800) 555-4545");

    // Check if accordion header exists before clicking
    const accordionHeader = this.page1
      .locator(".AccordionItemHeader--clickable")
      .first();
    const isAccordionVisible = await accordionHeader
      .isVisible()
      .catch(() => false);
    if (isAccordionVisible) {
      await accordionHeader.click();
    }

    await this.page1
      .getByPlaceholder("1234 1234 1234")
      .fill("4242 4242 4242 4242");
    await this.page1.getByPlaceholder("MM / YY").fill("01 / 30");
    await this.page1.getByPlaceholder("CVC").fill("123");
    await this.page1.waitForTimeout(2000);
    await this.page1
      .locator('[data-testid="submit-button-processing-label"]')
      .click();
  }

  async returnToPortal() {
    const returnUrl = new URL(
      "/portal-settings/payments/portal-payments?complete=true",
      this.portalUrl,
    ).href;
    await this.page1.goto(returnUrl);
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

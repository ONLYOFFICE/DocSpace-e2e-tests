import { expect, Locator, Page } from "@playwright/test";

const DATE_PICKER = "date-picker";
const DATE_SELECTOR = "date-selector";

// Base Page Object for calendar / date picker component
export default class BaseCalendar {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get datePicker() {
    return this.page.getByTestId(DATE_PICKER);
  }

  async removeDatePicker() {
    await this.datePicker.locator('[class*="selected-tag-removed"]').click();
  }

  get dateSelector() {
    return this.page.getByTestId(DATE_SELECTOR);
  }

  async openDateSelector() {
    await expect(this.dateSelector).toBeVisible();
    await this.dateSelector.click();
  }

  async selectTomorrow() {
    await this.openDateSelector();
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const day = tomorrow.getDate().toString();

    // If tomorrow is in the next month, it appears as a secondary date in the
    // current month's calendar - skip the isSecondary filter in that case
    const crossesMonth = tomorrow.getMonth() !== today.getMonth();
    const filter = crossesMonth
      ? "button:not([disabled])"
      : "button:not([disabled]):not([class*='isSecondary'])";

    await this.page
      .getByRole("button", { name: day, exact: true })
      .and(this.page.locator(filter))
      .click();
  }

  protected async clickElement(element: Locator) {
    await expect(element).toBeVisible();
    await element.click();
  }
}

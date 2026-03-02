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
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = tomorrow.getDate().toString();
    await this.page
      .getByRole("button", { name: day, exact: true })
      // Exclude disabled buttons and secondary dates (days from adjacent months)
      .and(
        this.page.locator("button:not([disabled]):not([class*='isSecondary'])"),
      )
      .click();
  }

  protected async clickElement(element: Locator) {
    await expect(element).toBeVisible();
    await element.click();
  }
}

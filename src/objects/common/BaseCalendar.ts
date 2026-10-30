import { expect, Locator, Page } from "@playwright/test";

const DATE_PICKER = "date-picker";
const DATE_SELECTOR = "date-selector";

export const calendarDayLabel = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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

    await this.page
      .getByRole("button", { name: calendarDayLabel(tomorrow), exact: true })
      .click();
  }

  protected async clickElement(element: Locator) {
    await expect(element).toBeVisible();
    await element.click();
  }
}

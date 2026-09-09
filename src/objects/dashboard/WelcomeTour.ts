import { expect, Locator, Page } from "@playwright/test";

const TAKE_TOUR_BUTTON = "dashboard-welcome-take-tour";
const MAYBE_LATER_BUTTON = "dashboard-welcome-later";
const TOUR_TOOLTIP = '[class*="TourTooltip-module__tooltip"]';
const TOUR_TITLE = '[class*="__title"]';
const TOUR_CONTENT = '[class*="__content"]';
const TOUR_PROGRESS = '[class*="__progress"]';

// Page Object for the "Welcome to ONLYOFFICE" dashboard modal and the
// react-joyride product tour it can launch ("Take a tour")
export class WelcomeTour {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get takeTourButton(): Locator {
    return this.page.getByTestId(TAKE_TOUR_BUTTON);
  }

  get maybeLaterButton(): Locator {
    return this.page.getByTestId(MAYBE_LATER_BUTTON);
  }

  get tooltip(): Locator {
    return this.page.locator(TOUR_TOOLTIP);
  }

  get tooltipTitle(): Locator {
    return this.tooltip.locator(TOUR_TITLE);
  }

  get tooltipContent(): Locator {
    return this.tooltip.locator(TOUR_CONTENT);
  }

  get tooltipProgress(): Locator {
    return this.tooltip.locator(TOUR_PROGRESS);
  }

  get nextButton(): Locator {
    return this.tooltip.getByRole("button", { name: "Next" });
  }

  get backButton(): Locator {
    return this.tooltip.getByRole("button", { name: "Back" });
  }

  get doneButton(): Locator {
    return this.tooltip.getByRole("button", { name: "Done" });
  }

  get closeButton(): Locator {
    return this.tooltip.getByRole("button", { name: "Close" });
  }

  async startTour() {
    await this.takeTourButton.click();
    await expect(this.tooltip).toBeVisible();
  }

  async dismiss() {
    await this.maybeLaterButton.click();
  }

  async clickNext() {
    await this.nextButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async clickDone() {
    await this.doneButton.click();
  }

  async clickClose() {
    await this.closeButton.click();
  }

  async expectStep(title: string, progress: string) {
    await expect(this.tooltipTitle).toHaveText(title);
    await expect(this.tooltipProgress).toHaveAttribute("aria-label", progress);
  }

  async expectClosed() {
    await expect(this.tooltip).not.toBeVisible();
  }
}

export default WelcomeTour;

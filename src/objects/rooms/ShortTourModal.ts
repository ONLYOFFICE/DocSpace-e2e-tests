import { expect, Page } from "@playwright/test";
import { tourSteps } from "@/src/utils/constants/rooms";
const TAKE_A_TOUR_BUTTON = "#form-filling_tips_start";
const SKIP_BUTTON = "#form-filling_tips_skip";
const NEXT_BUTTON = "#form-filling_tips_next";
const BACK_BUTTON = "#form-filling_tips_back";
const MODAL_CLOSE_BUTTON = "aside_header_close_icon_button";
const TOUR_BUTTON_SELECTOR = '[id^="form-filling_tips"]';

export class ShortTour {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get startTourButton() {
    return this.page.locator(TAKE_A_TOUR_BUTTON);
  }

  private get nextStepButton() {
    return this.page.locator(NEXT_BUTTON);
  }

  private get skipButton() {
    return this.page.locator(SKIP_BUTTON);
  }

  private get backButton() {
    return this.page.locator(BACK_BUTTON);
  }

  private get tourDialog() {
    return this.page
      .getByRole("dialog")
      .filter({ has: this.page.locator(TOUR_BUTTON_SELECTOR) });
  }

  async clickStartTour() {
    await expect(this.startTourButton).toBeVisible();
    await expect(this.startTourButton).toBeEnabled();
    await this.startTourButton.click();
  }

  async clickNextStep() {
    await expect(this.nextStepButton).toBeVisible();
    await expect(this.nextStepButton).toBeEnabled();
    await this.nextStepButton.click();
  }

  async clickSkipTour() {
    await expect(this.skipButton).toBeVisible();
    await expect(this.skipButton).toBeEnabled();
    await this.skipButton.click();
  }

  async clickBackStep() {
    await expect(this.backButton).toBeVisible();
    await expect(this.backButton).toBeEnabled();
    await this.backButton.click();
  }

  async checkStep(stepName: keyof typeof tourSteps) {
    const stepText = tourSteps[stepName];
    const stepElement = this.page.getByText(stepText);
    await expect(stepElement).toBeVisible({ timeout: 5000 });
  }

  async clickModalCloseButton() {
    const closeButton = this.tourDialog.getByTestId(MODAL_CLOSE_BUTTON);
    await expect(closeButton).toBeVisible();
    await closeButton.evaluate((el) => (el as HTMLElement).click());
    await expect(this.tourDialog).toBeHidden();
  }
  async isTourVisible(timeout = 3000): Promise<boolean> {
    try {
      const button = this.page.locator(TAKE_A_TOUR_BUTTON);
      await button.waitFor({ state: "visible", timeout });
      await expect(button).toBeVisible({ timeout });
      return true;
    } catch {
      return false;
    }
  }
}

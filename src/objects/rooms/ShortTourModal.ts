import { expect, Page } from "@playwright/test";
import { tourSteps } from "@/src/utils/constants/rooms";
const TAKE_A_TOUR_BUTTON = '#form-filling_tips_start';
const SKIP_BUTTON = '#form-filling_tips_skip';
const NEXT_BUTTON = '#form-filling_tips_next';
const BACK_BUTTON = '#form-filling_tips_back';
const MODAL_CLOSE_BUTTON = '#modal-dialog [data-testid="icon-button-svg"]';

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

  private get modalCloseButton() {
    return this.page.locator(MODAL_CLOSE_BUTTON);
  }
    
  async clickStartTour() {
    await this.page.waitForSelector(TAKE_A_TOUR_BUTTON);
    await this.startTourButton.click();
  }

  async clickNextStep() {
    await this.page.waitForSelector(NEXT_BUTTON);
    await this.nextStepButton.click();
  }

  async clickSkipTour() {
    await this.page.waitForSelector(SKIP_BUTTON);
    await this.skipButton.click();
  }

  async clickBackStep() {
    await this.page.waitForSelector(BACK_BUTTON);
    await this.backButton.click();
  }

  async checkStep(stepName: keyof typeof tourSteps) {
    const stepText = tourSteps[stepName];
    const stepElement = this.page.getByText(stepText);
    await expect(stepElement).toBeVisible({ timeout: 3000 });
  }

  async skipWelcomeIfPresent() {
    try {
      await this.page.waitForSelector(SKIP_BUTTON, { timeout: 2000 });
      await this.clickSkipTour();
    } catch (error) {
      // If skip button is not found or timeout, continue without skipping
      console.log('Welcome modal not found, continuing with test');
    }
  }

  async clickModalCloseButton() {
    await this.page.waitForSelector(MODAL_CLOSE_BUTTON);
    await this.modalCloseButton.click();
  }
}
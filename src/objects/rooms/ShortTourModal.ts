import { expect, Page } from "@playwright/test";
import { tourSteps } from "@/src/utils/constants/rooms";
const TAKE_A_TOUR_BUTTON = "#form-filling_tips_start";
const SKIP_BUTTON = "#form-filling_tips_skip";
const NEXT_BUTTON = "#form-filling_tips_next";
const BACK_BUTTON = "#form-filling_tips_back";
const MODAL_CLOSE_BUTTON = "#modal-header-swipe svg";
const MODAL_WINDOW_COPY_PUBLIC_LINK =
  '#modal-dialog [data-testid="created_pdf_form_dialog_copy_public_link"]';

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
  private get modalWindowCopyPublicLink() {
    return this.page.locator(MODAL_WINDOW_COPY_PUBLIC_LINK);
  }

  async clickCopyPublicLink() {
    await expect(this.modalWindowCopyPublicLink).toBeVisible();
    await this.modalWindowCopyPublicLink.click();
  }

  async clickStartTour() {
    const button = this.page.locator(TAKE_A_TOUR_BUTTON);
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await this.startTourButton.click();
  }

  async clickNextStep() {
    const button = this.page.locator(NEXT_BUTTON);
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await this.nextStepButton.click();
  }

  async clickSkipTour() {
    const button = this.page.locator(SKIP_BUTTON);
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await this.skipButton.click();
  }

  async clickBackStep() {
    const button = this.page.locator(BACK_BUTTON);
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await this.backButton.click();
  }

  async checkStep(stepName: keyof typeof tourSteps) {
    const stepText = tourSteps[stepName];
    const stepElement = this.page.getByText(stepText);
    await expect(stepElement).toBeVisible({ timeout: 5000 });
  }

  async clickModalCloseButton() {
    await expect(this.modalCloseButton).toBeVisible();
    await this.modalCloseButton.click();
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

import { Page, expect } from "@playwright/test";
const CHECK_READY_FORM = "goto_complete_folder_button";
const BACK_TO_ROOM = "back_to_room_button";
const FILL_IT_OUT_AGAIN = "fill_again_link";
const SUCCESS_MESSAGE =
  'h1[data-testid="heading"]:has-text("Form completed successfully")';
// shown when filling was stopped before the user's submission was processed
const SIMPLE_COMPLETION_MESSAGE = "The form is completed";
const DOWNLOAD_BUTTON = "download_form_button";

class RoomPDFCompleted {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  private get backToRoomButton() {
    return this.page.locator(`[data-testid="${BACK_TO_ROOM}"]:visible`);
  }

  async chooseBackToRoom() {
    await this.backToRoomButton.click();
  }

  private get fillItOutAgainButton() {
    return this.page.locator(`[data-testid="${FILL_IT_OUT_AGAIN}"]:visible`);
  }
  async chooseFillItOutAgain() {
    await this.fillItOutAgainButton.click();
  }

  private get downloadButton() {
    return this.page.locator(`[data-testid="${DOWNLOAD_BUTTON}"]:visible`);
  }

  async checkBackToRoomButtonHidden() {
    await expect(this.backToRoomButton).toBeHidden();
  }

  async checkFillItOutAgainButtonVisible() {
    await expect(this.fillItOutAgainButton).toBeVisible();
  }

  async checkFillItOutAgainButtonHidden() {
    await expect(this.fillItOutAgainButton).toBeHidden();
  }

  async checkDownloadButtonVisible() {
    await expect(this.downloadButton).toBeVisible();
  }

  private get successMessage() {
    if (!this.page) {
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page.locator(SUCCESS_MESSAGE).first(); // get the first matching element
  }
  async waitForPageLoad(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
  }

  async waitForSimpleCompletionPage(): Promise<void> {
    await expect(
      this.page
        .getByTestId("heading")
        .filter({ hasText: SIMPLE_COMPLETION_MESSAGE }),
    ).toBeVisible();
  }
  async isReadyFormButtonVisible() {
    return this.checkReadyFormButton.isVisible();
  }

  private get checkReadyFormButton() {
    return this.page.getByTestId(CHECK_READY_FORM);
  }

  async checkReadyForm() {
    await this.checkReadyFormButton.click();
  }
  async clickDownloadButton() {
    await this.checkDownloadButtonVisible();
    await this.downloadButton.click();
  }
  async checkDocumentTitleIsVisible(documentName: string) {
    const titleLocator = this.page
      .getByRole("main")
      .locator("div")
      .filter({ hasText: `${documentName}` });
    await expect(titleLocator).toBeVisible();
  }
}

export default RoomPDFCompleted;

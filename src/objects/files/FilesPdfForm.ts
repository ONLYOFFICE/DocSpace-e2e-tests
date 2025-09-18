import { expect, Page } from "@playwright/test";
import RoomPDFCompleted from "../rooms/RoomPDFCompleted";

const SUBMIT_BUTTON = "#id-submit-group";

class FilesPdfForm {
  private page: Page | null;

  constructor(page?: Page) {
    this.page = page ?? null;
  }

  setPdfPage(page: Page) {
    this.page = page;
  } 
  
  get submitButton() {
    if (!this.page) {
      throw new Error('PDF form page not set. Please call setPdfPage() first');
    }
    return this.page
    .frameLocator('iframe[name="frameEditor"]')
    .locator(SUBMIT_BUTTON);
  }
  
  async clickSubmitButton() {
    await this.submitButton.click();
    // Create an instance of RoomPDFCompleted and check the button
    const completedForm = new RoomPDFCompleted(this.page!);
    await expect(completedForm.isReadyFormButtonVisible()).toBeTruthy();
    return completedForm;
  }

  async checkSubmitButtonExist() {
    await expect(this.submitButton).toBeVisible();
  }
}

export default FilesPdfForm;
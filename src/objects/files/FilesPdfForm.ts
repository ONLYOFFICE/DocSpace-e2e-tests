import { expect, Page } from "@playwright/test";
import RoomPDFCompleted from "../rooms/RoomPDFCompleted";

const SUBMIT_BUTTON = "#id-submit-group";
const CLOSE_BUTTON = "#id-btn-close-editor";

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
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page
      .frameLocator('iframe[name="frameEditor"]')
      .locator(SUBMIT_BUTTON);
  }

  async clickSubmitButton(): Promise<RoomPDFCompleted> {
    await this.checkSubmitButtonExist();
    await this.submitButton.click();
    await this.page!.waitForURL(/.*completed-form.*/);
    return new RoomPDFCompleted(this.page!);
  }

  async checkSubmitButtonExist() {
    await expect(this.submitButton).toBeVisible();
  }
  get closeButton() {
    if (!this.page) {
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page
      .frameLocator('iframe[name="frameEditor"]')
      .locator(CLOSE_BUTTON);
  }

  async clickCloseButton() {
    await this.closeButton.click();
  }
}

export default FilesPdfForm;

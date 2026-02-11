import { expect, Page } from "@playwright/test";
import RoomPDFCompleted from "../rooms/RoomPDFCompleted";

const SUBMIT_BUTTON = "#id-submit-group";
const CLOSE_BUTTON = "#id-btn-close-editor";
const MENU_BUTTON = "#box-tools";
const DOWNLOAD_AS_PDF = "Download as PDF";
const DOWNLOAD_AS_DOCX = "Download as Docx";
const PRINT = "Print";

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

  get menuButton() {
    if (!this.page) {
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page
      .frameLocator('iframe[name="frameEditor"]')
      .locator(MENU_BUTTON);
  }

  async openMenu() {
    await expect(this.menuButton).toBeVisible();
    await this.menuButton.click();
  }

  private getEditorFrame() {
    if (!this.page) {
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page.frameLocator('iframe[name="frameEditor"]');
  }

  get downloadAsPdfButton() {
    return this.getEditorFrame().getByText(DOWNLOAD_AS_PDF);
  }

  get downloadAsDocxButton() {
    return this.getEditorFrame().getByText(DOWNLOAD_AS_DOCX);
  }

  get printButton() {
    return this.getEditorFrame().getByText(PRINT);
  }

  async clickDownloadAsPdf() {
    await expect(this.downloadAsPdfButton).toBeVisible();
    await this.downloadAsPdfButton.click();
  }

  async clickDownloadAsDocx() {
    await expect(this.downloadAsDocxButton).toBeVisible();
    await this.downloadAsDocxButton.click();
  }

  async clickPrint() {
    await expect(this.printButton).toBeVisible();
    await this.printButton.click();
  }

  async verifyDownloadAndPrintButtonsHidden() {
    await expect(this.downloadAsPdfButton).not.toBeVisible();
    await expect(this.downloadAsDocxButton).not.toBeVisible();
    await expect(this.printButton).not.toBeVisible();
  }

  async verifyDownloadAndPrintButtonsVisible() {
    await expect(this.downloadAsPdfButton).toBeVisible();
    await expect(this.downloadAsDocxButton).toBeVisible();
    await expect(this.printButton).toBeVisible();
  }
}

export default FilesPdfForm;

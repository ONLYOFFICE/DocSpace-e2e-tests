import { expect, Page } from "@playwright/test";
import RoomPDFCompleted from "../rooms/RoomPDFCompleted";
import VdrStartFillingPage from "./VdrStartFillingPage";

const EDITOR_IFRAME = 'iframe[name="frameEditor"]';
const SUBMIT_BUTTON = "#id-submit-group";
const CLOSE_BUTTON = "#id-btn-close-editor";
const MENU_BUTTON = "#box-tools";
const START_FILL_BUTTON = "#slot-btn-start-fill";
const FORM_FIELD_BUTTON = "#slot-btn-form-field";
const EDIT_MODE_BUTTON = "#slot-btn-edit-mode";
const EDIT_MODE_CHECKED_ITEM = ".menu-item.checkable.checked";
const FORM_PREV_BUTTON = "#slot-btn-form-prev";
const FORM_NEXT_BUTTON = "#slot-btn-form-next";
const DOWNLOAD_AS_PDF = "Download as PDF";
const DOWNLOAD_AS_DOCX = "Download as Docx";
const PRINT = "Print";

const INFO_BOX = ".info-box";
const NO_FIELDS_DIALOG_CONTAINER = ".asc-window.modal.alert";
const NO_FIELDS_DIALOG_TEXT = "No fields for filling added.";

// Fill viewer (public fill link) locators
const FILL_VIEWER_TITLE = "#title-doc-name";
const FILL_VIEWER_LOGO = "#header-logo";
const FILL_VIEWER_NEXT_FIELD = "#id-btn-next-field";
const FILL_VIEWER_PREV_FIELD = "#id-btn-prev-field";
const FILL_VIEWER_CLEAR_FIELDS = "#id-btn-clear-fields";

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
    return this.page.frameLocator(EDITOR_IFRAME).locator(SUBMIT_BUTTON);
  }

  async clickSubmitButton(): Promise<RoomPDFCompleted> {
    await this.checkSubmitButtonExist();
    await this.submitButton.click();
    await this.page!.waitForURL(/.*completed-form.*/);
    const completed = new RoomPDFCompleted(this.page!);
    await completed.waitForPageLoad();
    return completed;
  }

  // Use for VDR multi-role fills: after submit the page shows "Form Section Completed"
  // or "Form Finalized" (VDR-specific layout), not "Form completed successfully".
  async submitVdrRole(): Promise<VdrStartFillingPage> {
    await this.checkSubmitButtonExist();
    await this.submitButton.click();
    await this.page!.waitForURL(/.*completed-form.*/);
    return new VdrStartFillingPage(this.page!);
  }

  async checkSubmitButtonExist() {
    await expect(this.submitButton).toBeVisible();
  }

  async checkSubmitButtonNotVisible() {
    await expect(this.submitButton).not.toBeVisible();
  }

  get infoBox() {
    if (!this.page) {
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page.frameLocator(EDITOR_IFRAME).locator(INFO_BOX);
  }

  async checkInfoBoxVisible() {
    await expect(this.infoBox).toBeVisible();
  }

  get startFillButton() {
    if (!this.page) {
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page.frameLocator(EDITOR_IFRAME).locator(START_FILL_BUTTON);
  }

  async checkStartFillButtonVisible() {
    await expect(this.startFillButton).toBeVisible();
  }

  async clickStartFillButton() {
    await expect(this.startFillButton).toBeVisible();
    await this.startFillButton.click();
  }

  get formFieldButton() {
    if (!this.page) {
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page.frameLocator(EDITOR_IFRAME).locator(FORM_FIELD_BUTTON);
  }

  async addFormField() {
    await expect(this.formFieldButton).toBeVisible();
    await this.formFieldButton.click();
  }

  get noFieldsDialog() {
    if (!this.page) {
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page.frameLocator(EDITOR_IFRAME).locator(NO_FIELDS_DIALOG_CONTAINER);
  }

  get noFieldsDialogOkButton() {
    return this.noFieldsDialog.getByRole("button", { name: "OK" });
  }

  async checkNoFieldsDialogVisible() {
    await expect(this.noFieldsDialog).toContainText(NO_FIELDS_DIALOG_TEXT);
  }

  async checkNoFieldsDialogClosed() {
    await expect(this.noFieldsDialog).not.toBeVisible();
  }

  async clickNoFieldsDialogOk() {
    await expect(this.noFieldsDialogOkButton).toBeVisible();
    await this.noFieldsDialogOkButton.click();
  }

  get formPrevButton() {
    if (!this.page) {
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page.frameLocator(EDITOR_IFRAME).locator(FORM_PREV_BUTTON);
  }

  get formNextButton() {
    if (!this.page) {
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page.frameLocator(EDITOR_IFRAME).locator(FORM_NEXT_BUTTON);
  }

  async clickFormPrevButton() {
    await expect(this.formPrevButton).toBeVisible();
    await this.formPrevButton.click();
  }

  async clickFormNextButton() {
    await expect(this.formNextButton).toBeVisible();
    await this.formNextButton.click();
  }

  get editModeButton() {
    if (!this.page) {
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page.frameLocator(EDITOR_IFRAME).locator(EDIT_MODE_BUTTON);
  }

  async checkEditorMode() {
    const frame = this.page!.frameLocator(EDITOR_IFRAME);
    await this.editModeButton.click();
    await expect(
      frame.locator(EDIT_MODE_CHECKED_ITEM).filter({ hasText: /^Editing/ }),
    ).toBeVisible();
    await this.page!.keyboard.press("Escape");
  }

  get closeButton() {
    if (!this.page) {
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page.frameLocator(EDITOR_IFRAME).locator(CLOSE_BUTTON);
  }

  async clickCloseButton() {
    await this.closeButton.click();
  }

  get menuButton() {
    if (!this.page) {
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page.frameLocator(EDITOR_IFRAME).locator(MENU_BUTTON);
  }

  async openMenu() {
    await expect(this.menuButton).toBeVisible();
    await this.menuButton.click();
  }

  async waitForEditorFrame() {
    await this.page!.waitForSelector(EDITOR_IFRAME, {
      state: "attached",
      timeout: 60000,
    });
  }

  private getEditorFrame() {
    if (!this.page) {
      throw new Error("PDF form page not set. Please call setPdfPage() first");
    }
    return this.page.frameLocator(EDITOR_IFRAME);
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

  // Fill viewer getters (public fill link page, elements inside frameEditor iframe)
  get fillViewerTitle() {
    return this.getEditorFrame().locator(FILL_VIEWER_TITLE);
  }

  get fillViewerLogo() {
    return this.getEditorFrame().locator(FILL_VIEWER_LOGO);
  }

  get fillViewerNextFieldButton() {
    return this.getEditorFrame().locator(FILL_VIEWER_NEXT_FIELD);
  }

  get fillViewerPrevFieldButton() {
    return this.getEditorFrame().locator(FILL_VIEWER_PREV_FIELD);
  }

  get fillViewerClearFieldsButton() {
    return this.getEditorFrame().locator(FILL_VIEWER_CLEAR_FIELDS);
  }

  async verifyFillViewerVisible() {
    await expect(this.fillViewerTitle).toBeVisible({ timeout: 60000 });
    await expect(this.fillViewerLogo).toBeVisible();
    await expect(this.fillViewerNextFieldButton).toBeVisible();
    await expect(this.fillViewerPrevFieldButton).toBeVisible();
    await expect(this.fillViewerClearFieldsButton).toBeVisible();
    await this.checkSubmitButtonNotVisible();
  }

  async verifyFillViewerMenuItems() {
    await this.openMenu();
    await expect(this.downloadAsPdfButton).toBeVisible();
    await expect(this.downloadAsDocxButton).toBeVisible();
    await expect(this.printButton).toBeVisible();
  }
}

export default FilesPdfForm;

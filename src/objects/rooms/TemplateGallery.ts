import { expect, Locator, Page } from "@playwright/test";

const SEARCH_INPUT_PLACEHOLDER = "Search";
const EMPTY_SCREEN_CONTAINER = "empty-screen-container";
const CLEAR_FILTER = "Clear filter";
const NEW_PDF_FORM_CREATE_BUTTON = "new_pdf_form_save_button";
const NEW_PDF_FORM_CANCEL_BUTTON = "new_pdf_form_cancel_button";

class TemplateGallery {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ==================== Template Selection ====================

  get searchInput() {
    return this.page.getByPlaceholder(SEARCH_INPUT_PLACEHOLDER);
  }

  get emptyScreenContainer() {
    return this.page.getByTestId(EMPTY_SCREEN_CONTAINER);
  }

  get clearFilterButton() {
    return this.page.getByLabel(CLEAR_FILTER);
  }

  async search(text: string) {
    await this.searchInput.fill(text);
  }

  /**
   * Get a template card by its title
   * @param title - template title, e.g. "30-day eviction notice form"
   */
  getTemplateByTitle(title: string): Locator {
    return this.page.getByTitle(title);
  }

  /**
   * Click on a template by title to open the "New PDF form" modal
   * @param title - template title
   */
  async selectTemplate(title: string) {
    const template = this.getTemplateByTitle(title);
    await expect(template).toBeVisible({ timeout: 30000 });
    await template.click();
  }

  // ==================== New PDF Form Modal ====================

  get createButton() {
    return this.page.getByTestId(NEW_PDF_FORM_CREATE_BUTTON);
  }

  get cancelButton() {
    return this.page.getByTestId(NEW_PDF_FORM_CANCEL_BUTTON);
  }

  /**
   * Verify the "New PDF form" modal is visible
   */
  async verifyNewPdfFormModalVisible() {
    await expect(this.createButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
  }

  /**
   * Click Create button in "New PDF form" modal
   */
  async clickCreate() {
    await expect(this.createButton).toBeVisible();
    await this.createButton.click();
  }

  /**
   * Click Cancel button in "New PDF form" modal
   */
  async clickCancel() {
    await expect(this.cancelButton).toBeVisible();
    await this.cancelButton.click();
  }

  // ==================== High-Level Actions ====================

  /**
   * Select a template and create a new PDF form
   * @param title - template title
   */
  async selectTemplateAndCreate(title: string) {
    await this.selectTemplate(title);
    await this.verifyNewPdfFormModalVisible();
    await this.clickCreate();
  }
}

export default TemplateGallery;

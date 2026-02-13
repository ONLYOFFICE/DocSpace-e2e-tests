import { expect, Locator, Page } from "@playwright/test";

const SEARCH_INPUT_PLACEHOLDER = "Search";
const EMPTY_SCREEN_CONTAINER = "empty-screen-container";
const CLEAR_FILTER = "Clear filter";
const SUBMIT_TO_TEMPLATE_GALLERY = "Submit to Template Gallery";
const SUBMIT_MODAL_HEADER = "modal-header-swipe";
const SUBMIT_SELECT_TEMPLATE_BUTTON = "submit_to_gallery_select_form_button";
const SUBMIT_CANCEL_BUTTON = "submit_to_gallery_cancel_button";
const SUBMIT_APPLY_BUTTON = "submit_to_gallery_apply_button";
const LANGUAGE_COMBOBOX = "language-combobox";
const COMBO_BUTTON = "combo-button";
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

  get submitToTemplateGalleryButton() {
    return this.page.getByLabel(SUBMIT_TO_TEMPLATE_GALLERY);
  }

  get languageCombobox() {
    return this.page
      .getByTestId(LANGUAGE_COMBOBOX)
      .locator(`[data-test-id="${COMBO_BUTTON}"]`);
  }

  async selectLanguage(
    lang: "de" | "fr" | "it" | "zh-cn" | "en-us" | "ja-jp" | "es" | "pt-br",
  ) {
    await this.languageCombobox.click();
    await this.page.getByTestId(`drop_down_item_${lang}`).click();
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

  // ==================== Submit to Template Gallery Modal ====================

  get submitModalHeader() {
    return this.page.locator(`#${SUBMIT_MODAL_HEADER}`);
  }

  get submitSelectTemplateButton() {
    return this.page.getByTestId(SUBMIT_SELECT_TEMPLATE_BUTTON);
  }

  get submitCancelButton() {
    return this.page.getByTestId(SUBMIT_CANCEL_BUTTON);
  }

  async verifySubmitModalVisible() {
    await expect(this.submitModalHeader).toBeVisible();
    await expect(this.submitSelectTemplateButton).toBeVisible();
    await expect(this.submitCancelButton).toBeVisible();
  }

  async clickSelectTemplate() {
    await expect(this.submitSelectTemplateButton).toBeVisible();
    await this.submitSelectTemplateButton.click();
  }

  async clickSubmitCancel() {
    await expect(this.submitCancelButton).toBeVisible();
    await this.submitCancelButton.click();
  }

  get submitApplyButton() {
    return this.page.getByTestId(SUBMIT_APPLY_BUTTON);
  }

  async clickSubmitApply() {
    await expect(this.submitApplyButton).toBeVisible();
    await this.submitApplyButton.click();
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

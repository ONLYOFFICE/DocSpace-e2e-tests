import { expect, Page } from "@playwright/test";

const SUBMIT_BUTTON = "#id-submit-group";

class FilesPdfForm {
  private page: Page | null;

  constructor(page?: Page) {
    this.page = page ?? null;
  }

  async submit() {
    await this.page?.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      console.warn('networkidle did not happen in 5 seconds, continue testing');
    });
    await this.submitButton.click();
  }

  setPdfPage(page: Page) {
    this.page = page;
  }

  get submitButton() {
    if (!this.page) {
      throw new Error('PDF form page not set. Please call setPdfPage() first');
    }
    return this.page.locator('iframe[name="frameEditor"]').contentFrame().getByRole('button', { name: 'Complete & Submit' });
  }

  async checkSubmitButtonExist() {
    await expect(this.submitButton).toBeVisible();
  }
  async clickSubmitButton() {
    await this.submitButton.click();
  }
}

export default FilesPdfForm;
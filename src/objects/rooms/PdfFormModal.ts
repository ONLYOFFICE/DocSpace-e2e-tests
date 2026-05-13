import { expect, Page } from "@playwright/test";

const COPY_PUBLIC_LINK_BUTTON = "created_pdf_form_dialog_copy_public_link";
const CLOSE_BUTTON = "aside_header_close_icon_button";

class PdfFormModal {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get dialog() {
    return this.page
      .getByRole("dialog")
      .filter({ has: this.page.getByTestId(COPY_PUBLIC_LINK_BUTTON) });
  }

  private get closeButton() {
    return this.dialog.getByTestId(CLOSE_BUTTON);
  }

  private get copyPublicLinkButton() {
    return this.dialog.getByTestId(COPY_PUBLIC_LINK_BUTTON);
  }

  async waitForVisible() {
    await expect(this.dialog).toBeVisible({ timeout: 10000 });
  }

  async close() {
    await expect(this.closeButton).toBeVisible();
    await this.closeButton.evaluate((el) => (el as HTMLElement).click());
    await expect(this.dialog).toBeHidden();
  }

  async copyPublicLink() {
    await expect(this.copyPublicLinkButton).toBeVisible();
    await this.copyPublicLinkButton.click();
  }
}

export default PdfFormModal;

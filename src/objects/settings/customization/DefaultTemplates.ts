import { expect, Page } from "@playwright/test";
import path from "path";
import BaseSelector from "@/src/objects/common/BaseSelector";

export type TTemplateFormat = "docx" | "xlsx" | "pptx" | "pdf";

const DEFAULT_TEMPLATE_ROW = "default-template-row";
const BADGE_TEXT = "badge-text";
const ROW_NAME = "text";
const CONTEXT_MENU_BUTTON = "context-menu-button";
const UPLOAD_FROM_DOCSPACE_ITEM = "upload-from-docspace_item";
const UPLOAD_FROM_DEVICE_ITEM = "upload-from-device_item";
const PREVIEW_ITEM = "preview_item";
const DOWNLOAD_ITEM = "download_item";
const RESET_ITEM = "reset_item";
const RESET_CONFIRM_BUTTON = "reset-button";
const MODIFIED_INFO = '[class*="modifiedText"]';

const FORMAT_ROW_INDEX: Record<TTemplateFormat, number> = {
  docx: 0,
  xlsx: 1,
  pptx: 2,
  pdf: 3,
};

export const DEFAULT_TEMPLATE_NAMES: Record<TTemplateFormat, string> = {
  docx: "Blank Document",
  xlsx: "Blank Spreadsheet",
  pptx: "Blank Presentation",
  pdf: "Blank Form",
};

class DefaultTemplates {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private getRow(format: TTemplateFormat) {
    return this.page.getByTestId(
      `${DEFAULT_TEMPLATE_ROW}-${FORMAT_ROW_INDEX[format]}`,
    );
  }

  async checkAllRowsVisible() {
    for (const index of Object.values(FORMAT_ROW_INDEX)) {
      await expect(
        this.page.getByTestId(`${DEFAULT_TEMPLATE_ROW}-${index}`),
      ).toBeVisible();
    }
  }

  async checkRowName(format: TTemplateFormat) {
    await expect(this.getRow(format).getByTestId(ROW_NAME).first()).toHaveText(
      DEFAULT_TEMPLATE_NAMES[format],
    );
  }

  async checkBadge(format: TTemplateFormat, text: string) {
    await expect(this.getRow(format).getByTestId(BADGE_TEXT)).toContainText(
      text,
    );
  }

  async checkModifiedInfo(format: TTemplateFormat) {
    // Customized row shows date and file size - contains digits; "Not modified" has none
    await expect(this.getRow(format).locator(MODIFIED_INFO)).toContainText(
      /\d/,
    );
  }

  async checkNotModifiedInfo(format: TTemplateFormat) {
    await expect(this.getRow(format).locator(MODIFIED_INFO)).toContainText(
      "Not modified",
    );
  }

  async getTemplateSizeInBytes(format: TTemplateFormat): Promise<number> {
    const text = await this.getRow(format).locator(MODIFIED_INFO).textContent();
    if (!text) throw new Error(`Modified info text not found for ${format}`);
    const match = text.match(/([\d.]+)\s*(KB|MB|B)\b/i);
    if (!match) throw new Error(`Size not found in modified info: "${text}"`);
    let size = parseFloat(match[1]);
    if (/MB/i.test(match[2])) size *= 1024 * 1024;
    else if (/KB/i.test(match[2])) size *= 1024;
    return size;
  }

  async uploadFromDevice(format: TTemplateFormat, filePath: string) {
    await this.getRow(format).getByTestId(CONTEXT_MENU_BUTTON).click();
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.page.getByTestId(UPLOAD_FROM_DEVICE_ITEM).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.resolve(process.cwd(), filePath));
  }

  async resetToDefault(format: TTemplateFormat) {
    await this.getRow(format).getByTestId(CONTEXT_MENU_BUTTON).click();
    await this.page.getByTestId(RESET_ITEM).click();
    await this.page
      .locator('[data-testid="modal-dialog"][class*="visible"]')
      .getByTestId(RESET_CONFIRM_BUTTON)
      .click();
  }

  async clickPreview(format: TTemplateFormat) {
    await this.getRow(format).getByTestId(CONTEXT_MENU_BUTTON).click();
    await this.page.getByTestId(PREVIEW_ITEM).click();
  }

  async clickDownload(format: TTemplateFormat) {
    await this.getRow(format).getByTestId(CONTEXT_MENU_BUTTON).click();
    await this.page.getByTestId(DOWNLOAD_ITEM).click();
  }

  async clickUploadFromDocSpace(format: TTemplateFormat) {
    await this.getRow(format).getByTestId(CONTEXT_MENU_BUTTON).click();
    await this.page.getByTestId(UPLOAD_FROM_DOCSPACE_ITEM).click();
  }

  async uploadFromDocSpace(format: TTemplateFormat, fileName: string) {
    await this.clickUploadFromDocSpace(format);
    const selector = new BaseSelector(this.page);
    await selector.checkSelectorExist();
    await selector.select("documents");
    await selector.selectItemByText(fileName);
    await selector.submitSelection();
  }
}

export default DefaultTemplates;

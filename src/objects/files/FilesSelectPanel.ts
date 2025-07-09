import { expect, Page } from "@playwright/test";
import BaseSelector from "../common/BaseSelector";

class FilesSelectPanel extends BaseSelector {
  constructor(page: Page) {
    super(page);
  }

  private get confirmButton() {
    return this.selector.locator("#select-file-modal-submit");
  }

  async confirmSelection() {
    await this.confirmButton.click();
  }

  async checkFileSelectPanelExist() {
    await expect(this.selector.getByTestId("selector-item-1")).toBeVisible();
  }
}

export default FilesSelectPanel;

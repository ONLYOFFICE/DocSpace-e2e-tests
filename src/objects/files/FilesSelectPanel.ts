import { expect, Page, test } from "@playwright/test";
import BaseSelector from "../common/BaseSelector";

class FilesSelectPanel extends BaseSelector {
  constructor(page: Page) {
    super(page);
  }

  private get confirmButton() {
    return this.selector.locator("#select-file-modal-submit");
  }

  async confirmSelection() {
    return test.step("Confirm selection", async () => {
      await this.confirmButton.click();
    });
  }

  async checkFileSelectPanelExist() {
    return test.step("Check file select panel exist", async () => {
      await expect(this.selector.getByTestId("selector-item-1")).toBeVisible();
    });
  }
}

export default FilesSelectPanel;

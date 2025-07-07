import { Page } from "@playwright/test";
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
}

export default FilesSelectPanel;

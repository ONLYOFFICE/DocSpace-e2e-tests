import { expect, Page } from "@playwright/test";
import BaseSelector from "../common/BaseSelector";

class FilesSelectPanel extends BaseSelector {
  constructor(page: Page) {
    super(page);
  }

  private get confirmButton() {
    return this.selector.locator("#select-file-modal-submit");
  }

  private get rootDocSpaceFolder() {
    return this.selector.getByTestId("selector_bread_crumb_item_0");
  }

  async confirmSelection() {
    await this.confirmButton.click();
  }

  async gotoDocSpaceRoot() {
    await expect(this.rootDocSpaceFolder).toBeVisible();
    await this.rootDocSpaceFolder.click();
  }

  async checkFileSelectPanelExist() {
    await expect(this.selector.getByTestId("selector-item-1")).toBeVisible();
  }

  async selectRoomTypeFromDropdown(roomType: string) {
    await this.selector.getByText(new RegExp(roomType, "i")).click();
  }
}

export default FilesSelectPanel;

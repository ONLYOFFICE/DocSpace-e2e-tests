import { expect, Page } from "@playwright/test";
import BaseSelector from "../common/BaseSelector";

const INCOMPATIBLE_FILE_ALERT_TEXT =
  "The file cannot be moved to this space. Please try to move the ONLYOFFICE PDF form.";

class FilesSelectPanel extends BaseSelector {
  constructor(page: Page) {
    super(page);
  }

  private get confirmButton() {
    return this.selector.locator("#select-file-modal-submit");
  }

  private get incompatibleFileAlert() {
    return this.page.getByText(INCOMPATIBLE_FILE_ALERT_TEXT);
  }

  private get rootDocSpaceFolder() {
    return this.selector.getByTestId("selector_bread_crumb_item_0");
  }

  async confirmSelection() {
    await this.confirmButton.click();
  }

  async checkConfirmButtonDisabled() {
    await expect(this.confirmButton).toBeDisabled();
  }

  async checkIncompatibleFileAlertVisible() {
    await expect(this.incompatibleFileAlert).toBeVisible();
  }

  async gotoDocSpaceRoot() {
    await expect(this.rootDocSpaceFolder).toBeVisible();
    await this.rootDocSpaceFolder.click();
  }

  async checkFileSelectPanelExist() {
    await expect(this.selector.getByTestId("selector-item-1")).toBeVisible();
  }

  // Overrides BaseSelector.select: after gotoDocSpaceRoot the panel re-renders
  // its item list, and clicking the target index too soon can hit a stale
  // item from the previous (pre-navigation) render. Waiting for the expected
  // label at that index makes the click land on the settled root list.
  async select(type: "documents" | "rooms" | "forms") {
    if (type === "forms") {
      // "Forms" is not at a fixed index in this panel, so match by text instead.
      await this.selectItemByText("Forms");
      return;
    }
    const index = type === "documents" ? 1 : 2;
    const label = type === "documents" ? "Files" : "Rooms";
    const item = this.selector.getByTestId(`selector-item-${index}`);
    await expect(item).toContainText(label);
    await item.click();
  }

  async selectRoomTypeFromDropdown(roomType: string) {
    await this.selector.getByText(new RegExp(roomType, "i")).click();
  }
}

export default FilesSelectPanel;

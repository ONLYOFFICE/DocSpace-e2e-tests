import { expect, Page } from "@playwright/test";
import BaseSelector from "../common/BaseSelector";

const INCOMPATIBLE_FILE_ALERT_TEXT =
  "The file cannot be moved to this space. Please try to move the ONLYOFFICE PDF form.";
const INCOMPATIBLE_COPY_ALERT_TEXT =
  "The file cannot be copied to this space. Please try to copy the ONLYOFFICE PDF form.";

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

  private get incompatibleCopyAlert() {
    return this.page.getByText(INCOMPATIBLE_COPY_ALERT_TEXT);
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

  async checkIncompatibleCopyAlertVisible(timeout?: number) {
    await expect(this.incompatibleCopyAlert).toBeVisible({ timeout });
  }

  // Form Filling rooms are link-accessible by design, so copying into one
  // pops an extra "the room's contents are available to anyone with the
  // link, continue?" confirmation. Only appears when the destination room
  // actually allows the copy, so it's a no-op for the incompatible-file case.
  async confirmPublicRoomWarningIfShown(timeout = 5000) {
    const dialog = this.page
      .locator("#modal-dialog, [data-testid='modal-dialog']")
      .filter({ hasText: "Move to Public room" });
    const shown = await dialog
      .first()
      .isVisible({ timeout })
      .catch(() => false);
    if (shown) {
      await dialog.first().getByRole("button", { name: "OK", exact: true }).click();
    }
  }

  async gotoDocSpaceRoot() {
    await expect(this.rootDocSpaceFolder).toBeVisible();
    await this.rootDocSpaceFolder.click();
  }

  async checkFileSelectPanelExist() {
    await expect(this.selector.getByTestId("selector-item-1")).toBeVisible();
  }

  // Unlike checkFileSelectPanelExist, doesn't assume the panel opened on the
  // DocSpace root tabs - Favorites/Recent open it scoped to their own view.
  async checkSelectPanelOpen() {
    await expect(this.selector.getByText("Select", { exact: true })).toBeVisible();
  }

  // Overrides BaseSelector.select: after gotoDocSpaceRoot the panel re-renders
  // its item list, and clicking the target index too soon can hit a stale
  // item from the previous (pre-navigation) render. Waiting for the expected
  // label at that index makes the click land on the settled root list.
  async select(type: "documents" | "rooms" | "forms" | "ai") {
    const index = { documents: 0, rooms: 1, forms: 2, ai: 3 }[type];
    const label = {
      documents: "Files",
      rooms: "Rooms",
      forms: "Forms",
      ai: "AI agents",
    }[type];
    const item = this.selector.getByTestId(`selector-item-${index}`);
    await expect(item).toContainText(label);
    await item.click();
  }

  async selectRoomTypeFromDropdown(roomType: string) {
    await this.selector.getByText(new RegExp(roomType, "i")).click();
  }
}

export default FilesSelectPanel;

import { expect, Page } from "@playwright/test";
import BaseSelector from "../common/BaseSelector";

class ChatAttachmentPanel extends BaseSelector {
  constructor(page: Page) {
    super(page);
  }

  // "Recent files" / "Favorite files" quick-nav rows share the same
  // [data-testid^="selector-item-"] as real files/folders, so item locators
  // and counts must exclude them by their fixed labels.
  private get realItems() {
    return this.selector
      .locator('[data-testid^="selector-item-"]')
      .filter({ hasNotText: /^(Recent files|Favorite files)$/ });
  }

  async openFolder(name: string) {
    await this.selectItemByText(name);
  }

  async selectFile(name: string) {
    await this.selectItemByText(name);
  }

  async add() {
    await this.submitSelection();
  }

  async search(query: string) {
    await this.selector
      .getByTestId("selector_search_input")
      .locator("input")
      .fill(query);
  }

  async expectNoResults() {
    await expect(this.selector.locator(".empty-header")).toBeVisible();
    await expect(
      this.selector.locator('[data-testid^="selector-item-"]'),
    ).toHaveCount(0);
  }

  async expectFileNotVisible(name: string) {
    await expect(this.realItems.filter({ hasText: name })).toHaveCount(0);
  }

  async expectItemCount(count: number) {
    await expect(this.realItems).toHaveCount(count);
  }
}

export default ChatAttachmentPanel;

import { expect, Page } from "@playwright/test";
import BaseSelector from "../common/BaseSelector";

class ChatAttachmentPanel extends BaseSelector {
  constructor(page: Page) {
    super(page);
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
}

export default ChatAttachmentPanel;

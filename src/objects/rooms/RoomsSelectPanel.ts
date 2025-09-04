import { expect, Page } from "@playwright/test";
import BaseSelector from "../common/BaseSelector";

class RoomsSelectPanel extends BaseSelector {
  constructor(page: Page) {
    super(page);
  }

  async selectFile(fileName: string) {
    await this.selector.getByText(fileName).click();
    await this.confirmSelection();
  }

  async confirmSelection() {
    await expect(this.page.getByLabel("Select")).toBeVisible();
    await this.page.getByLabel('Select').click();
  }
  
  async select(type: "resent" | "documents" | "rooms") {
    const selectors = {
        "documents": 'selector-item-0',
        "favorite": 'selector-item-1',
        "resent": 'selector-item-2',
        "rooms": 'selector-item-3'
    };

    const selector = selectors[type];
    if (!selector) {
        throw new Error(`Unknown selector type: ${type}`);
    }

    await this.selector.getByTestId(selector).click();
}
}
export default RoomsSelectPanel;
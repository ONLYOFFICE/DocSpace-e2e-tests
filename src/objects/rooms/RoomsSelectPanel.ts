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
}
export default RoomsSelectPanel;
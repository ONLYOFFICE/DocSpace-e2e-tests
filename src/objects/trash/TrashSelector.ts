import { Page } from "@playwright/test";
import BaseSelector from "../common/BaseSelector";

class TrashSelector extends BaseSelector {
  constructor(page: Page) {
    super(page);
  }

  private get restoreHereButton() {
    return this.page.getByTestId("selector_submit_button");
  }

  async restore() {
    await this.restoreHereButton.click();
  }
}

export default TrashSelector;

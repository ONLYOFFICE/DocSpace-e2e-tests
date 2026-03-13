import { expect } from "@playwright/test";
import FilesEditor from "./FilesEditor";

class SpreadsheetEditor extends FilesEditor {
  get canvasOverlay() {
    return this.frame.locator("#ws-canvas-graphic-overlay");
  }

  async waitForLoad() {
    await super.waitForLoad();
    await expect(this.canvasOverlay).toBeVisible({ timeout: 30000 });
    await expect(this.favicon).toHaveAttribute("href", /cell\.ico/, {
      timeout: 15000,
    });
  }
}

export default SpreadsheetEditor;

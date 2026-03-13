import { expect } from "@playwright/test";
import FilesEditor from "./FilesEditor";

class PresentationEditor extends FilesEditor {
  async waitForLoad() {
    await super.waitForLoad();
    await expect(this.favicon).toHaveAttribute("href", /slide\.ico/, {
      timeout: 15000,
    });
  }
}

export default PresentationEditor;

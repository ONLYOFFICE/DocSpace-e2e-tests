import { expect } from "@playwright/test";
import FilesEditor from "./FilesEditor";

class DocumentEditor extends FilesEditor {
  async waitForLoad() {
    await super.waitForLoad();
    await expect(this.favicon).toHaveAttribute("href", /word\.ico/, {
      timeout: 15000,
    });
  }
}

export default DocumentEditor;

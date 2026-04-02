import { expect, Page } from "@playwright/test";
import FilesEditor from "./FilesEditor";

class PdfFormEditor extends FilesEditor {
  get editorPage(): Page {
    return this.page;
  }

  async waitForLoad() {
    await super.waitForLoad();
    await expect(this.favicon).toHaveAttribute("href", /pdf\.ico/, {
      timeout: 15000,
    });
  }
}

export default PdfFormEditor;

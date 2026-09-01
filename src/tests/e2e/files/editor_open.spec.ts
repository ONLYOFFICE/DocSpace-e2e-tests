import Files from "@/src/objects/files/Files";
import DocumentEditor from "@/src/objects/files/DocumentEditor";
import SpreadsheetEditor from "@/src/objects/files/SpreadsheetEditor";
import PresentationEditor from "@/src/objects/files/PresentationEditor";
import PdfFormEditor from "@/src/objects/files/PdfFormEditor";
import { test } from "@/src/fixtures";

test.describe("My Documents: open files in editor", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
    await files.open();
  });

  test("New document opens in editor", async () => {
    const editor: DocumentEditor =
      await files.createDocumentAndOpenEditor("Document");
    await editor.waitForLoad();
    await editor.close();
  });

  test("New spreadsheet opens in editor", async () => {
    const editor: SpreadsheetEditor =
      await files.createSpreadsheetAndOpenEditor("Spreadsheet");
    await editor.waitForLoad();
    await editor.close();
  });

  test("New presentation opens in editor", async () => {
    const editor: PresentationEditor =
      await files.createPresentationAndOpenEditor("Presentation");
    await editor.waitForLoad();
    await editor.close();
  });

  test("New PDF form opens in editor", async () => {
    const editor: PdfFormEditor =
      await files.createPdfFormAndOpenEditor("PDF Form");
    await editor.waitForLoad();
    await editor.close();
  });
});

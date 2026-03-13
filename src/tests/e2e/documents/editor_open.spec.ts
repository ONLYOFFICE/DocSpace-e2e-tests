import MyDocuments from "@/src/objects/files/MyDocuments";
import DocumentEditor from "@/src/objects/files/DocumentEditor";
import SpreadsheetEditor from "@/src/objects/files/SpreadsheetEditor";
import PresentationEditor from "@/src/objects/files/PresentationEditor";
import PdfFormEditor from "@/src/objects/files/PdfFormEditor";
import { test } from "@/src/fixtures";

test.describe("My Documents: open files in editor", () => {
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
    await myDocuments.open();
  });

  test("New document opens in editor", async () => {
    const editor: DocumentEditor =
      await myDocuments.createDocumentAndOpenEditor("Document");
    await editor.waitForLoad();
    await editor.close();
  });

  test("New spreadsheet opens in editor", async () => {
    const editor: SpreadsheetEditor =
      await myDocuments.createSpreadsheetAndOpenEditor("Spreadsheet");
    await editor.waitForLoad();
    await editor.close();
  });

  test("New presentation opens in editor", async () => {
    const editor: PresentationEditor =
      await myDocuments.createPresentationAndOpenEditor("Presentation");
    await editor.waitForLoad();
    await editor.close();
  });

  test("New PDF form opens in editor", async () => {
    const editor: PdfFormEditor =
      await myDocuments.createPdfFormAndOpenEditor("PDF Form");
    await editor.waitForLoad();
    await editor.close();
  });
});

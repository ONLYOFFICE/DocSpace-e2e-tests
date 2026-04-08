import MyDocuments from "@/src/objects/files/MyDocuments";
import Recent from "@/src/objects/files/Recent";
import { test } from "@/src/fixtures";

const documentName = "Document";
const spreadsheetName = "Spreadsheet";
const presentationName = "Presentation";
const pdfFormName = "PDF Form";

test.describe("My documents: Recent", () => {
  let myDocuments: MyDocuments;
  let recent: Recent;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    recent = new Recent(page, api.portalDomain);

    await login.loginToPortal();
    await myDocuments.open();
  });

  test("Recent section shows empty view", async () => {
    await recent.openFromNavigation();
    await recent.checkNoRecentFilesTextExist();
  });

  test("Files appear in Recent after opening", async () => {
    await test.step("Create and open files in editor", async () => {
      const docEditor =
        await myDocuments.createDocumentAndOpenEditor(documentName);
      await docEditor.waitForLoad();
      await docEditor.close();

      const sheetEditor =
        await myDocuments.createSpreadsheetAndOpenEditor(spreadsheetName);
      await sheetEditor.waitForLoad();
      await sheetEditor.close();
    });

    await test.step("Verify files appear in Recent", async () => {
      await recent.openFromNavigation();
      await recent.filesTable.checkRowExist(documentName);
      await recent.filesTable.checkRowExist(spreadsheetName);
    });
  });

  test("Filter recent files by type", async () => {
    await test.step("Create and edit files in editor", async () => {
      const docEditor =
        await myDocuments.createDocumentAndOpenEditor(documentName);
      await docEditor.editAndClose("doc text");

      const sheetEditor =
        await myDocuments.createSpreadsheetAndOpenEditor(spreadsheetName);
      await sheetEditor.editAndClose("sheet text");

      const presEditor =
        await myDocuments.createPresentationAndOpenEditor(presentationName);
      await presEditor.editAndClose("pres text");

      const pdfEditor =
        await myDocuments.createPdfFormAndOpenEditor(pdfFormName);
      await pdfEditor.editAndClose("pdf text");
    });

    await recent.openFromNavigation();
    await recent.filesTable.checkRowExist(spreadsheetName);

    await test.step("Filter by documents", async () => {
      await recent.filesFilter.openFilterDialog();
      await recent.filesFilter.selectFilterByDocuments();
      await recent.filesFilter.applyFilterNoWait();
      await recent.filesTable.checkRowExist(documentName);
      await recent.filesTable.checkRowNotExist(spreadsheetName);
    });

    await test.step("Filter by spreadsheets", async () => {
      await recent.filesFilter.openFilterDialog();
      await recent.filesFilter.selectFilterBySpreadsheets();
      await recent.filesFilter.applyFilterNoWait();
      await recent.filesTable.checkRowExist(spreadsheetName);
      await recent.filesTable.checkRowNotExist(documentName);
    });

    await test.step("Filter by presentations", async () => {
      await recent.filesFilter.openFilterDialog();
      await recent.filesFilter.selectFilterByPresentations();
      await recent.filesFilter.applyFilterNoWait();
      await recent.filesTable.checkRowExist(presentationName);
      await recent.filesTable.checkRowNotExist(spreadsheetName);
    });

    await test.step("Filter by PDF forms", async () => {
      await recent.filesFilter.openFilterDialog();
      await recent.filesFilter.selectFilterByPdfForms();
      await recent.filesFilter.applyFilterNoWait();
      await recent.filesTable.checkRowExist(pdfFormName);
      await recent.filesTable.checkRowNotExist(presentationName);
    });

    await test.step("Filter by media (empty result)", async () => {
      await recent.filesFilter.openFilterDialog();
      await recent.filesFilter.selectFilterByMedia();
      await recent.filesFilter.applyFilterNoWait();
      await recent.filesFilter.checkFilesEmptyViewExist();
      await recent.filesFilter.clearFilterFromEmptyView();
    });
  });

  test("Search in Recent", async () => {
    await test.step("Create and open files in editor", async () => {
      const docEditor =
        await myDocuments.createDocumentAndOpenEditor(documentName);
      await docEditor.waitForLoad();
      await docEditor.close();

      const sheetEditor =
        await myDocuments.createSpreadsheetAndOpenEditor(spreadsheetName);
      await sheetEditor.waitForLoad();
      await sheetEditor.close();

      const presEditor =
        await myDocuments.createPresentationAndOpenEditor(presentationName);
      await presEditor.waitForLoad();
      await presEditor.close();

      const pdfEditor =
        await myDocuments.createPdfFormAndOpenEditor(pdfFormName);
      await pdfEditor.waitForLoad();
      await pdfEditor.close();
    });

    await recent.openFromNavigation();
    await recent.filesTable.checkRowExist(spreadsheetName);

    await test.step("Search by file name", async () => {
      await recent.filesFilter.fillFilesSearchInputAndCheckRequest(
        spreadsheetName,
      );
      await recent.filesTable.checkRowExist(spreadsheetName);
      await recent.filesTable.checkRowNotExist(documentName);
    });

    await test.step("Clear search", async () => {
      await recent.filesFilter.clearSearchText();
      await recent.filesTable.checkRowExist(spreadsheetName);
    });

    await test.step("Search with no results", async () => {
      await recent.filesFilter.fillFilesSearchInputAndCheckRequest(
        "nonexistent file",
      );
      await recent.filesFilter.checkFilesEmptyViewExist();
    });
  });
});

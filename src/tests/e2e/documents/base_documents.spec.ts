import Files from "@/src/objects/files/Files";
import { test } from "@/src/fixtures";

test.describe("My documents: Base", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);

    await login.loginToPortal();
    await files.open();
  });

  test("Empty state", async () => {
    await files.deleteAllDocs();
    await files.filesEmptyView.checkNoDocsTextExist();
  });

  test("Create files", async () => {
    await files.filesNavigation.openCreateDropdown();
    await files.filesNavigation.closeContextMenu();
    await files.filesNavigation.openAndValidateFileCreateModals();
    await files.createFiles();
  });

  test("Info panel", async () => {
    await test.step("Precondition: create files", async () => {
      await files.deleteAllDocs();
      await files.createFiles();
    });

    await test.step("Empty selection", async () => {
      await files.infoPanel.open();
      await files.infoPanel.checkNoItemTextExist();
    });

    await test.step("File properties and history", async () => {
      await files.filesTable.selectDocxFile();
      await files.infoPanel.checkDocxFileProperties();
      await files.infoPanel.openTab("History");
      await files.infoPanel.checkHistoryExist("File created.");
    });

    await test.step("File share", async () => {
      await files.infoPanel.openTab("Share");
      await files.infoPanel.checkShareExist();
      await files.infoPanel.createFirstSharedLink();
      await files.infoPanel.createMoreSharedLink();
    });
  });

  test("View and sort", async () => {
    await test.step("Precondition: create files", async () => {
      await files.deleteAllDocs();
      await files.createFiles();
    });

    await test.step("Switch views", async () => {
      await files.filesFilter.switchToDocumentsThumbnailView();
      await files.filesFilter.switchToDocumentsCompactView();
    });

    await test.step("Sort by name", async () => {
      await files.filesFilter.openDropdownSortBy();
      await files.filesFilter.selectSortByName();
    });
  });

  test("Filter", async () => {
    await test.step("Precondition: create files", async () => {
      await files.deleteAllDocs();
      await files.createFiles();
    });

    await test.step("Filter by folders", async () => {
      await files.filesFilter.openFilterDialog();
      await files.filesFilter.selectFilterByFolders();
      await files.filesFilter.applyFilterNoWait();
      await files.filesTable.checkRowExist("Folder");
    });

    await test.step("Filter by media (empty)", async () => {
      await files.filesFilter.openFilterDialog();
      await files.filesFilter.selectFilterByMedia();
      await files.filesFilter.applyFilterNoWait();
      await files.filesFilter.checkFilesEmptyViewExist();

      await files.filesFilter.clearFilter();
      await files.filesTable.checkRowExist("Folder");
    });

    await test.step("Filter by files", async () => {
      await files.filesFilter.openFilterDialog();
      await files.filesFilter.selectFilterByFiles();
      await files.filesFilter.applyFilterNoWait();
      await files.filesTable.checkRowExist("Document");
    });

    await test.step("Filter by documents", async () => {
      await files.filesFilter.openFilterDialog();
      await files.filesFilter.selectFilterByDocuments();
      await files.filesFilter.applyFilterNoWait();
      await files.filesTable.checkRowExist("Document");
      await files.filesTable.checkRowNotExist("Spreadsheet");
    });

    await test.step("Filter by spreadsheets", async () => {
      await files.filesFilter.openFilterDialog();
      await files.filesFilter.selectFilterBySpreadsheets();
      await files.filesFilter.applyFilterNoWait();
      await files.filesTable.checkRowExist("Spreadsheet");
      await files.filesTable.checkRowNotExist("Presentation");
    });

    await test.step("Filter by presentations", async () => {
      await files.filesFilter.openFilterDialog();
      await files.filesFilter.selectFilterByPresentations();
      await files.filesFilter.applyFilterNoWait();
      await files.filesTable.checkRowExist("Presentation");
      await files.filesTable.checkRowNotExist("Document");
    });

    await test.step("Filter by PDF forms", async () => {
      await files.filesFilter.openFilterDialog();
      await files.filesFilter.selectFilterByPdfForms();
      await files.filesFilter.applyFilterNoWait();
      await files.filesTable.checkRowExist("Blank");
    });

    await test.step("Filter by empty categories", async () => {
      await files.filesFilter.openFilterDialog();
      await files.filesFilter.selectFilterByDiagrams();
      await files.filesFilter.applyFilterNoWait();
      await files.filesFilter.checkFilesEmptyViewExist();

      await files.filesFilter.openFilterDialog();
      await files.filesFilter.selectFilterByPdfDocuments();
      await files.filesFilter.applyFilterNoWait();
      await files.filesFilter.checkFilesEmptyViewExist();

      await files.filesFilter.openFilterDialog();
      await files.filesFilter.selectFilterByArchives();
      await files.filesFilter.applyFilterNoWait();
      await files.filesFilter.checkFilesEmptyViewExist();

      await files.filesFilter.openFilterDialog();
      await files.filesFilter.selectFilterByImages();
      await files.filesFilter.applyFilterNoWait();
      await files.filesFilter.checkFilesEmptyViewExist();
      await files.filesFilter.clearFilterFromEmptyView();
    });
  });

  test("Search", async () => {
    await test.step("Precondition: create files", async () => {
      await files.deleteAllDocs();
      await files.createFiles();
    });

    await files.filesFilter.fillFilesSearchInputAndCheckRequest("Document");

    await files.filesFilter.clearSearchText();
    await files.filesTable.checkRowExist("Folder");

    await files.filesFilter.fillFilesSearchInputAndCheckRequest(
      "empty view search",
    );
    await files.filesFilter.checkFilesEmptyViewExist();
  });

  test("Search by part of the name", async () => {
    await test.step("Precondition: create files sharing a name fragment", async () => {
      await files.deleteAllDocs();
      await files.createDocumentFile("ReportAlpha");
      await files.createDocumentFile("ReportBeta");
      await files.createDocumentFile("Summary");
    });

    await test.step("A partial name returns only the matching files", async () => {
      await files.filesFilter.fillFilesSearchInputAndCheckRequest("Report");
      await files.filesTable.expectItemVisible("ReportAlpha");
      await files.filesTable.expectItemVisible("ReportBeta");
      await files.filesTable.expectItemNotVisible("Summary");
    });
  });

  test("Rename files", async () => {
    await test.step("Precondition: create files", async () => {
      await files.deleteAllDocs();
      await files.createFiles();
    });

    await files.open();
    await files.renameFile("Document", "Document (renamed)");
    await files.renameFile("Spreadsheet", "Spreadsheet (renamed)");
    await files.renameFile("Presentation", "Presentation (renamed)");
    await files.renameFile("Folder", "Folder (renamed)");
    await files.renameFile("Blank", "Blank (renamed)");
  });

  test("Table settings", async () => {
    await files.filesTable.openTableSettings();
    await files.filesTable.expectColumnVisible("Modified");
    await files.filesTable.expectColumnVisible("Size");

    await files.filesTable.setColumnVisible("Author");
    await files.filesTable.setColumnVisible("Created");
    await files.filesTable.setColumnVisible("Type");

    await files.filesTable.setColumnNotVisible("Modified");
    await files.filesTable.setColumnNotVisible("Size");
    await files.filesTable.setColumnNotVisible("Author");
    await files.filesTable.setColumnNotVisible("Created");
    await files.filesTable.setColumnNotVisible("Type");

    await files.filesTable.setColumnVisible("Modified");
    await files.filesTable.setColumnVisible("Size");
    await files.filesTable.closeTableSettings();
  });
});

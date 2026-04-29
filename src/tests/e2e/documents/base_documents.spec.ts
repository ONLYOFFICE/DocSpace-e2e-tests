import MyDocuments from "@/src/objects/files/MyDocuments";
import { test } from "@/src/fixtures";

test.describe("My documents: Base", () => {
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);

    await login.loginToPortal();
    await myDocuments.open();
  });

  test("Empty state", async () => {
    await myDocuments.deleteAllDocs();
    await myDocuments.filesEmptyView.checkNoDocsTextExist();
  });

  test("Create files", async () => {
    await myDocuments.filesNavigation.openCreateDropdown();
    await myDocuments.filesNavigation.closeContextMenu();
    await myDocuments.filesNavigation.openAndValidateFileCreateModals();
    await myDocuments.filesArticle.openMainDropdown();
    await myDocuments.filesArticle.closeMainDropdown();
    await myDocuments.filesArticle.createFiles();
  });

  test("Info panel", async () => {
    await test.step("Precondition: create files", async () => {
      await myDocuments.deleteAllDocs();
      await myDocuments.filesArticle.createFiles();
    });

    await test.step("Empty selection", async () => {
      await myDocuments.infoPanel.open();
      await myDocuments.infoPanel.checkNoItemTextExist();
    });

    await test.step("File properties and history", async () => {
      await myDocuments.filesTable.selectDocxFile();
      await myDocuments.infoPanel.checkDocxFileProperties();
      await myDocuments.infoPanel.openTab("History");
      await myDocuments.infoPanel.checkHistoryExist("File created.");
    });

    await test.step("File share", async () => {
      await myDocuments.infoPanel.openTab("Share");
      await myDocuments.infoPanel.checkShareExist();
      await myDocuments.infoPanel.createFirstSharedLink();
      await myDocuments.infoPanel.createMoreSharedLink();
    });
  });

  test("View and sort", async () => {
    await test.step("Precondition: create files", async () => {
      await myDocuments.deleteAllDocs();
      await myDocuments.filesArticle.createFiles();
    });

    await test.step("Switch views", async () => {
      await myDocuments.filesFilter.switchToDocumentsThumbnailView();
      await myDocuments.filesFilter.switchToDocumentsCompactView();
    });

    await test.step("Sort by name", async () => {
      await myDocuments.filesFilter.openDropdownSortBy();
      await myDocuments.filesFilter.selectSortByName();
    });
  });

  test("Filter", async () => {
    await test.step("Precondition: create files", async () => {
      await myDocuments.deleteAllDocs();
      await myDocuments.filesArticle.createFiles();
    });

    await test.step("Filter by folders", async () => {
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByFolders();
      await myDocuments.filesFilter.applyFilterNoWait();
      await myDocuments.filesTable.checkRowExist("Folder");
    });

    await test.step("Filter by media (empty)", async () => {
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByMedia();
      await myDocuments.filesFilter.applyFilterNoWait();
      await myDocuments.filesFilter.checkFilesEmptyViewExist();

      await myDocuments.filesFilter.clearFilter();
      await myDocuments.filesTable.checkRowExist("Folder");
    });

    await test.step("Filter by files", async () => {
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByFiles();
      await myDocuments.filesFilter.applyFilterNoWait();
      await myDocuments.filesTable.checkRowExist("Document");
    });

    await test.step("Filter by documents", async () => {
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByDocuments();
      await myDocuments.filesFilter.applyFilterNoWait();
      await myDocuments.filesTable.checkRowExist("Document");
      await myDocuments.filesTable.checkRowNotExist("Spreadsheet");
    });

    await test.step("Filter by spreadsheets", async () => {
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterBySpreadsheets();
      await myDocuments.filesFilter.applyFilterNoWait();
      await myDocuments.filesTable.checkRowExist("Spreadsheet");
      await myDocuments.filesTable.checkRowNotExist("Presentation");
    });

    await test.step("Filter by presentations", async () => {
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByPresentations();
      await myDocuments.filesFilter.applyFilterNoWait();
      await myDocuments.filesTable.checkRowExist("Presentation");
      await myDocuments.filesTable.checkRowNotExist("Document");
    });

    await test.step("Filter by PDF forms", async () => {
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByPdfForms();
      await myDocuments.filesFilter.applyFilterNoWait();
      await myDocuments.filesTable.checkRowExist("Blank");
    });

    await test.step("Filter by empty categories", async () => {
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByDiagrams();
      await myDocuments.filesFilter.applyFilterNoWait();
      await myDocuments.filesFilter.checkFilesEmptyViewExist();

      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByPdfDocuments();
      await myDocuments.filesFilter.applyFilterNoWait();
      await myDocuments.filesFilter.checkFilesEmptyViewExist();

      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByArchives();
      await myDocuments.filesFilter.applyFilterNoWait();
      await myDocuments.filesFilter.checkFilesEmptyViewExist();

      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByImages();
      await myDocuments.filesFilter.applyFilterNoWait();
      await myDocuments.filesFilter.checkFilesEmptyViewExist();
      await myDocuments.filesFilter.clearFilterFromEmptyView();
    });
  });

  test("Search", async () => {
    await test.step("Precondition: create files", async () => {
      await myDocuments.deleteAllDocs();
      await myDocuments.filesArticle.createFiles();
    });

    await myDocuments.filesFilter.fillFilesSearchInputAndCheckRequest(
      "Document",
    );

    await myDocuments.filesFilter.clearSearchText();
    await myDocuments.filesTable.checkRowExist("Folder");

    await myDocuments.filesFilter.fillFilesSearchInputAndCheckRequest(
      "empty view search",
    );
    await myDocuments.filesFilter.checkFilesEmptyViewExist();
  });

  test("Rename files", async () => {
    await test.step("Precondition: create files", async () => {
      await myDocuments.deleteAllDocs();
      await myDocuments.filesArticle.createFiles();
    });

    await myDocuments.open();
    await myDocuments.renameFile("Document", "Document (renamed)");
    await myDocuments.renameFile("Spreadsheet", "Spreadsheet (renamed)");
    await myDocuments.renameFile("Presentation", "Presentation (renamed)");
    await myDocuments.renameFile("Folder", "Folder (renamed)");
    await myDocuments.renameFile("Blank", "Blank (renamed)");
  });

  test("Table settings", async () => {
    await myDocuments.filesTable.openTableSettings();
    await myDocuments.filesTable.expectColumnVisible("Modified");
    await myDocuments.filesTable.expectColumnVisible("Size");

    await myDocuments.filesTable.setColumnVisible("Author");
    await myDocuments.filesTable.setColumnVisible("Created");
    await myDocuments.filesTable.setColumnVisible("Type");

    await myDocuments.filesTable.setColumnNotVisible("Modified");
    await myDocuments.filesTable.setColumnNotVisible("Size");
    await myDocuments.filesTable.setColumnNotVisible("Author");
    await myDocuments.filesTable.setColumnNotVisible("Created");
    await myDocuments.filesTable.setColumnNotVisible("Type");

    await myDocuments.filesTable.setColumnVisible("Modified");
    await myDocuments.filesTable.setColumnVisible("Size");
    await myDocuments.filesTable.closeTableSettings();
  });
});

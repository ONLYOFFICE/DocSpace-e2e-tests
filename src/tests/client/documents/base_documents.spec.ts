import MyDocuments from "@/src/objects/files/MyDocuments";
import { test } from "@/src/fixtures";

test.describe("My documents: Base", () => {
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);

    await login.loginToPortal();
    await myDocuments.open();
  });

  test("Render", async () => {
    await test.step("EmptyScreen", async () => {
      await myDocuments.deleteAllDocs();
      await myDocuments.filesEmptyView.checkNoDocsTextExist();
    });

    await test.step("FilesCreate", async () => {
      await myDocuments.filesNavigation.openCreateDropdown();
      await myDocuments.filesNavigation.closeContextMenu();
      await myDocuments.filesNavigation.openAndValidateFileCreateModals();
      await myDocuments.filesArticle.openMainDropdown();
      await myDocuments.filesArticle.closeMainDropdown();
      await myDocuments.filesArticle.createFiles();
    });

    await test.step("InfoPanel", async () => {
      await myDocuments.infoPanel.open();
      await myDocuments.infoPanel.checkNoItemTextExist();

      await myDocuments.filesTable.selectDocxFile();
      await myDocuments.infoPanel.hideDatePropertiesDetails();
      await myDocuments.infoPanel.checkDocxFileProperties();

      await myDocuments.infoPanel.openOptions();
      await myDocuments.infoPanel.closeMenu();

      await myDocuments.infoPanel.openTab("History");
      await myDocuments.infoPanel.checkHistoryExist("File created.");
      await myDocuments.infoPanel.hideCreationDateHistory();

      await myDocuments.infoPanel.openTab("Share");
      await myDocuments.infoPanel.checkShareExist();
      await myDocuments.infoPanel.createFirstSharedLink();
      await myDocuments.infoPanel.createMoreSharedLink();

      await myDocuments.filesTable.selectAllRows();
      await myDocuments.filesTable.resetSelect();

      await myDocuments.filesTable.selectFolderByName("Folder");
      await myDocuments.infoPanel.hideDatePropertiesDetails();
      await myDocuments.infoPanel.checkFolderProperties();

      await myDocuments.infoPanel.openOptions();

      await myDocuments.infoPanel.openTab("History");
      await myDocuments.infoPanel.checkHistoryExist("Folder created.");

      // Temporarily disabled; will be re-enabled once the selector issue is resolved
      // await myDocuments.filesTable.openContextMenu();
      // await myDocuments.filesTable.contextMenu.clickOption("Share");
      // await myDocuments.infoPanel.checkShareExist();

      await myDocuments.infoPanel.close();
    });

    await test.step("View", async () => {
      await myDocuments.filesFilter.switchToDocumentsThumbnailView();
      await myDocuments.filesFilter.switchToDocumentsCompactView();
    });

    await test.step("Sort", async () => {
      await myDocuments.filesFilter.openDropdownSortBy();
      await myDocuments.filesFilter.selectSortByName();
    });

    await test.step("Filter", async () => {
      await myDocuments.filesFilter.openFilterDialog();

      // Quick tag filters should limit to folders first
      await myDocuments.filesFilter.selectFilterByFolders();
      await myDocuments.filesFilter.applyFilter();
      await myDocuments.filesTable.checkRowExist("Folder");

      // Media preset returns empty when no assets exist
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByMedia();
      await myDocuments.filesFilter.applyFilter();
      await myDocuments.filesFilter.checkFilesEmptyViewExist();

      await myDocuments.filesFilter.clearFilter();
      await myDocuments.filesTable.checkRowExist("Folder");

      // All files view should list at least the generated document
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByFiles();
      await myDocuments.filesFilter.applyFilter();
      await myDocuments.filesTable.checkRowExist("Document");

      // Documents filter hides other file types
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByDocuments();
      await myDocuments.filesFilter.applyFilter();

      await myDocuments.filesTable.checkRowExist("Document");
      await myDocuments.filesTable.checkRowNotExist("Spreadsheet");

      // Spreadsheet filter restores spreadsheet entries
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.clearFilterDialog();
      await myDocuments.filesFilter.selectFilterBySpreadsheets();
      await myDocuments.filesFilter.applyFilter();
      await myDocuments.filesTable.checkRowExist("Spreadsheet");
      await myDocuments.filesTable.checkRowNotExist("Presentation");

      // Presentation filter isolates presentation file
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.clearFilterDialog();
      await myDocuments.filesFilter.selectFilterByPresentations();
      await myDocuments.filesFilter.applyFilter();
      await myDocuments.filesTable.checkRowExist("Presentation");
      await myDocuments.filesTable.checkRowNotExist("Document");

      // PDF documents filter should surface Blank file
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.clearFilterDialog();
      await myDocuments.filesFilter.selectFilterByPdfForms();
      await myDocuments.filesFilter.applyFilter();
      await myDocuments.filesTable.checkRowExist("Blank");

      // Remaining categories should show empty state if no assets
      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.clearFilterDialog();
      await myDocuments.filesFilter.selectFilterByDiagrams();
      await myDocuments.filesFilter.applyFilter();
      await myDocuments.filesFilter.checkFilesEmptyViewExist();

      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.clearFilterDialog();
      await myDocuments.filesFilter.selectFilterByPdfDocuments();
      await myDocuments.filesFilter.applyFilter();
      await myDocuments.filesFilter.checkFilesEmptyViewExist();

      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.clearFilterDialog();
      await myDocuments.filesFilter.selectFilterByArchives();
      await myDocuments.filesFilter.applyFilter();
      await myDocuments.filesFilter.checkFilesEmptyViewExist();

      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.clearFilterDialog();
      await myDocuments.filesFilter.selectFilterByImages();
      await myDocuments.filesFilter.applyFilter();
      await myDocuments.filesFilter.checkFilesEmptyViewExist();
      await myDocuments.filesFilter.clearFilterFromEmptyView();
    });

    await test.step("Search", async () => {
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

    await test.step("Rename Files", async () => {
      await myDocuments.open();
      await myDocuments.renameFile("Document", "Document (renamed)");
      await myDocuments.renameFile("Spreadsheet", "Spreadsheet (renamed)");
      await myDocuments.renameFile("Presentation", "Presentation (renamed)");
      await myDocuments.renameFile("Folder", "Folder (renamed)");
      await myDocuments.renameFile("Blank", "Blank (renamed)");
    });
  });
});

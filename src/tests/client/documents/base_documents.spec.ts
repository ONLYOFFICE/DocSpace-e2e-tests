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

      await myDocuments.filesFilter.selectFilterByFolders();
      await myDocuments.filesFilter.applyFilter();

      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByMedia();
      await myDocuments.filesFilter.applyFilter();
      await myDocuments.filesFilter.checkFilesEmptyViewExist();

      await myDocuments.filesFilter.clearFilter();
      await myDocuments.filesTable.checkRowExist("Folder");
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
  });
});

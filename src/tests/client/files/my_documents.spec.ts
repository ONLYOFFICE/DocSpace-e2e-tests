import { test, Page } from "@playwright/test";

import API from "@/src/api";
import MyDocuments from "@/src/objects/files/MyDocuments";
import Login from "@/src/objects/common/Login";
import Screenshot from "@/src/objects/common/Screenshot";

test.describe("Files: My documents", () => {
  let api: API;
  let page: Page;
  let login: Login;
  let myDocuments: MyDocuments;
  let screenshot: Screenshot;

  test.beforeAll(async ({ playwright, browser }) => {
    const apiContext = await playwright.request.newContext();
    api = new API(apiContext);
    await api.setup();
    console.log(api.portalDomain);

    page = await browser.newPage();

    await page.addInitScript(() => {
      globalThis.localStorage?.setItem("integrationUITests", "true");
    });

    login = new Login(page, api.portalDomain);
    myDocuments = new MyDocuments(page, api.portalDomain);
    screenshot = new Screenshot(page, "files");

    await login.loginToPortal();
    await myDocuments.open();
  });

  test.beforeEach(async ({}, testInfo) => {
    await screenshot.setCurrentTestInfo(testInfo);
  });

  /**
   * Tests the initial rendering of the documents page
   * Verifies that the documents table is displayed correctly with proper column visibility
   */
  test("Render", async () => {
    // Render
    await myDocuments.filesTable.hideModifiedColumn();
    await screenshot.expectHaveScreenshot();

    // EmptyScreen
    await myDocuments.deleteAllDocs();
    await screenshot.expectHaveScreenshot("empty_view");

    await myDocuments.filesEmptyView.openAndValidateFileCreateModals();

    await myDocuments.openRecentlyAccessibleTab();
    await myDocuments.filesEmptyView.checkNoFilesTextExist();

    await screenshot.expectHaveScreenshot("empty_view_recent");

    await myDocuments.filesEmptyView.clickGotoDocumentsButton();
    await myDocuments.filesEmptyView.checkNoDocsTextExist();

    // FilesCreate
    await myDocuments.filesNavigation.openCreateDropdown();
    await screenshot.expectHaveScreenshot("dropdown");
    await myDocuments.filesNavigation.closeCreateDropdown();

    await myDocuments.filesNavigation.openAndValidateFileCreateModals();

    await myDocuments.filesArticle.openMainDropdown();
    await screenshot.expectHaveScreenshot("dropdown_action");
    await myDocuments.filesArticle.closeMainDropdown();

    await myDocuments.filesArticle.createFiles();
    await myDocuments.filesTable.hideModifiedColumn();

    await screenshot.expectHaveScreenshot("created_files");

    // InfoPanel
    await myDocuments.infoPanel.open();
    await myDocuments.infoPanel.checkNoItemTextExist();
    await screenshot.expectHaveScreenshot("empty");

    await myDocuments.filesTable.selectDocxFile();
    await myDocuments.infoPanel.hideDatePropertiesDetails();
    await myDocuments.infoPanel.checkDocxFileProperties();
    await screenshot.expectHaveScreenshot("file_details");

    await myDocuments.infoPanel.openOptions();
    await screenshot.expectHaveScreenshot(
      "view_opened_info_panel_file_options",
    );
    await myDocuments.infoPanel.closeDropdown();

    await myDocuments.infoPanel.openTab("History");
    await myDocuments.infoPanel.checkHistoryExist("File created.");
    await myDocuments.infoPanel.hideCreationDateHistory();
    await screenshot.expectHaveScreenshot("file_history");

    await myDocuments.infoPanel.openTab("Share");
    await myDocuments.infoPanel.checkShareExist();
    await myDocuments.infoPanel.createFirstSharedLink();
    await myDocuments.infoPanel.createMoreSharedLink();
    await screenshot.expectHaveScreenshot("ile_share");

    await myDocuments.filesTable.selectAllRows();
    await screenshot.expectHaveScreenshot("multi-selected_files");
    await myDocuments.filesTable.resetSelect();

    await myDocuments.filesTable.selectFolderByName("Folder");
    await myDocuments.infoPanel.hideDatePropertiesDetails();
    await myDocuments.infoPanel.checkFolderProperties();

    await myDocuments.infoPanel.openOptions();
    await screenshot.expectHaveScreenshot("folder_options");

    await myDocuments.infoPanel.openTab("History");
    await myDocuments.infoPanel.checkHistoryExist("Folder created.");

    await myDocuments.filesTable.openContextMenu();
    await myDocuments.filesTable.contextMenu.clickOption("Info");
    await myDocuments.infoPanel.hideDatePropertiesDetails();
    await myDocuments.infoPanel.checkDocxFileProperties();

    await myDocuments.filesTable.openContextMenu();
    await myDocuments.filesTable.contextMenu.clickOption("Share");
    await myDocuments.infoPanel.checkShareExist();

    await myDocuments.infoPanel.close();

    // View
    await myDocuments.filesFilter.switchToDocumentsThumbnailView();
    await screenshot.expectHaveScreenshot("view_thumbnail");
    await myDocuments.filesFilter.switchToDocumentsCompactView();

    // Sort
    await myDocuments.filesFilter.openDropdownSortBy();
    await screenshot.expectHaveScreenshot("dropdown_sort_by");
    await myDocuments.filesFilter.clickSortBySize();
    await screenshot.expectHaveScreenshot("sorted_by_size");

    // Filter
    await myDocuments.filesFilter.openFilterDialog();
    await screenshot.expectHaveScreenshot("opened_dialog");

    await myDocuments.filesFilter.selectFilterByFolders();
    await myDocuments.filesFilter.applyFilter();
    await screenshot.expectHaveScreenshot("filtered_by_folders");

    await myDocuments.filesFilter.openFilterDialog();
    await myDocuments.filesFilter.selectFilterByMedia();
    await myDocuments.filesFilter.applyFilter();
    await myDocuments.filesFilter.checkFilesEmptyViewExist();
    await screenshot.expectHaveScreenshot("filtered_by_media_empty");

    await myDocuments.filesFilter.clearFilter();

    // Search
    await myDocuments.filesFilter.fillFilesSearchInputAndCheckRequest(
      "Document",
    );
    await screenshot.expectHaveScreenshot("search_docx_file");

    await myDocuments.filesFilter.clearSearchText();
    await myDocuments.filesFilter.fillFilesSearchInputAndCheckRequest(
      "empty view search",
    );
    await myDocuments.filesFilter.checkFilesEmptyViewExist();
    await screenshot.expectHaveScreenshot("search_empty");
  });

  test.afterAll(async () => {
    await api.cleanup();
  });
});

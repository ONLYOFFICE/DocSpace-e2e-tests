import { test, Page } from "@playwright/test";

import API from "@/src/api";
import MyDocuments from "@/src/objects/files/MyDocuments";
import Login from "@/src/objects/common/Login";
import AdFrame from "@/src/objects/common/AdFrame";
import AdBanner from "@/src/objects/common/AdBanner";
import Screenshot from "@/src/objects/common/Screenshot";

test.describe("Files: My documents", () => {
  let api: API;
  let page: Page;
  let login: Login;
  let myDocuments: MyDocuments;
  let adFrame: AdFrame;
  let adBanner: AdBanner;
  let screenshot: Screenshot;

  test.beforeAll(async ({ playwright, browser }) => {
    const apiContext = await playwright.request.newContext();
    api = new API(apiContext);
    await api.setup();
    console.log(api.portalDomain);

    page = await browser.newPage();

    login = new Login(page, api.portalDomain);
    myDocuments = new MyDocuments(page, api.portalDomain);
    screenshot = new Screenshot(page, "my_documents", "files");
    adFrame = new AdFrame(page);
    adBanner = new AdBanner(page);

    await login.loginToPortal();
    await adFrame.closeIframe();
    await myDocuments.open();
    await adBanner.closeBanner();
    await myDocuments.filesTable.hideModifiedColumn();
  });

  /**
   * Tests the initial rendering of the documents page
   * Verifies that the documents table is displayed correctly with proper column visibility
   */
  test("Render", async () => {
    await screenshot.expectHaveScreenshot("render");
  });

  /**
   * Tests the empty state functionality of the documents page
   * Verifies:
   * - Empty state message is displayed correctly
   * - File creation modals can be opened from empty state
   * - Recently accessible tab shows proper empty state
   * - Navigation between empty states works correctly
   */
  test("EmptyScreen", async () => {
    await myDocuments.deleteAllDocs();
    await myDocuments.filesEmptyView.checkNoDocsTextExist();

    await screenshot.expectHaveScreenshot("empty_view");

    await myDocuments.filesEmptyView.openAndValidateFileCreateModals();

    await myDocuments.openRecentlyAccessibleTab();
    await myDocuments.filesEmptyView.checkNoFilesTextExist();

    await screenshot.expectHaveScreenshot("empty_view_recent");

    await myDocuments.filesEmptyView.clickGotoDocumentsButton();
    await myDocuments.filesEmptyView.checkNoDocsTextExist();
  });

  /**
   * Tests the file creation functionality
   * Verifies:
   * - Create dropdown opens and closes correctly
   * - File creation modals work properly
   * - Main dropdown actions work correctly
   * - Files are created successfully
   */
  test("FilesCreate", async () => {
    await myDocuments.filesNavigation.openCreateDropdown();
    await screenshot.expectHaveScreenshot("view_dropdown");
    await myDocuments.filesNavigation.closeCreateDropdown();

    await myDocuments.filesNavigation.openAndValidateFileCreateModals();

    await myDocuments.filesArticle.openMainDropdown();
    await screenshot.expectHaveScreenshot("view_dropdown_action");
    await myDocuments.filesArticle.closeMainDropdown();

    await myDocuments.filesArticle.createFiles();
    await myDocuments.filesTable.hideModifiedColumn();

    await screenshot.expectHaveScreenshot("view_created_files");
  });

  /**
   * Tests the info panel functionality for files and folders
   * Verifies:
   * - Empty info panel state
   * - File properties display
   * - History tracking
   * - Sharing functionality
   * - Multi-selection behavior
   * - Folder properties
   * - Context menu integration
   */
  test("InfoPanel", async () => {
    await myDocuments.infoPanel.open();
    await myDocuments.infoPanel.checkNoItemTextExist();
    await screenshot.expectHaveScreenshot("view_info_panel_empty");

    await myDocuments.filesTable.selectDocxFile();
    await myDocuments.infoPanel.hideDatePropertiesDetails();
    await myDocuments.infoPanel.checkDocxFileProperties();
    await screenshot.expectHaveScreenshot("view_info_panel_file_details");

    await myDocuments.infoPanel.openOptions();
    await screenshot.expectHaveScreenshot(
      "view_opened_info_panel_file_options",
    );
    await myDocuments.infoPanel.closeDropdown();

    await myDocuments.infoPanel.openTab("History");
    await myDocuments.infoPanel.checkHistoryExist("File created.");
    await myDocuments.infoPanel.hideCreationDateHistory();
    await screenshot.expectHaveScreenshot("view_info_panel_file_history");

    await myDocuments.infoPanel.openTab("Share");
    await myDocuments.infoPanel.checkShareExist();
    await myDocuments.infoPanel.createFirstSharedLink();
    await myDocuments.infoPanel.createMoreSharedLink();
    await screenshot.expectHaveScreenshot("view_info_panel_file_share");

    await myDocuments.filesTable.selectAllRows();
    await screenshot.expectHaveScreenshot(
      "view_info_panel_multi-selected_files",
    );
    await myDocuments.filesTable.resetSelect();

    await myDocuments.filesTable.selectFolderByName("Folder");
    await myDocuments.infoPanel.hideDatePropertiesDetails();
    await myDocuments.infoPanel.checkFolderProperties();

    await myDocuments.infoPanel.openOptions();
    await screenshot.expectHaveScreenshot(
      "view_opened_info_panel_folder_options",
    );

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
  });

  /**
   * Tests the view switching functionality
   * Verifies that files can be displayed in both thumbnail and compact views
   * and that the UI updates correctly when switching between views
   */
  test("View", async () => {
    await myDocuments.filesFilter.switchToDocumentsThumbnailView();
    await screenshot.expectHaveScreenshot("view_thumbnail");
    await myDocuments.filesFilter.switchToDocumentsCompactView();
  });

  /**
   * Tests the sorting functionality
   * Verifies that:
   * - Sort dropdown opens correctly
   * - Sorting by size works properly
   * - UI updates correctly after sorting
   */
  test("Sort", async () => {
    await myDocuments.filesFilter.openDropdownSortBy();
    await screenshot.expectHaveScreenshot("view_dropdown_sort_by");
    await myDocuments.filesFilter.clickSortBySize();
    await screenshot.expectHaveScreenshot("view_sorted_by_size");
  });

  /**
   * Tests the filtering functionality
   * Verifies that:
   * - Filter dialog opens correctly
   * - Filtering by folders works properly
   * - Filtering by media type works properly
   * - Empty state is handled correctly for filtered results
   * - Filter can be cleared
   */
  test("Filter", async () => {
    await myDocuments.filesFilter.openFilterDialog();
    await screenshot.expectHaveScreenshot("view_filter_dialog");

    await myDocuments.filesFilter.clickFilterByFoldersTag();
    await myDocuments.filesFilter.applyFilter();
    await screenshot.expectHaveScreenshot("view_filtered_by_folders");

    await myDocuments.filesFilter.openFilterDialog();
    await myDocuments.filesFilter.clickFilterByMediaTag();
    await myDocuments.filesFilter.applyFilter();
    await myDocuments.filesFilter.checkFilesEmptyViewExist();
    await screenshot.expectHaveScreenshot("view_filtered_by_media_empty");

    await myDocuments.filesFilter.clearFilter();
  });

  /**
   * Tests the search functionality
   * Verifies that:
   * - Search input works correctly
   * - Search results are displayed properly
   * - Empty search results are handled correctly
   * - Search can be cleared
   */
  test("Search", async () => {
    await myDocuments.filesFilter.fillFilesSearchInputAndCheckRequest(
      "Document",
    );
    await screenshot.expectHaveScreenshot("view_search_docx_file");

    await myDocuments.filesFilter.clearSearchText();
    await myDocuments.filesFilter.fillFilesSearchInputAndCheckRequest(
      "empty view search",
    );
    await myDocuments.filesFilter.checkFilesEmptyViewExist();
    await screenshot.expectHaveScreenshot("view_search_empty");
  });

  test.afterAll(async () => {
    await api.cleanup();
  });
});

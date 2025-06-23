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
    await test.step("Render", async () => {
      await myDocuments.filesTable.hideModifiedColumn();
      await screenshot.expectHaveScreenshot("render");
    });

    await test.step("EmptyScreen", async () => {
      await myDocuments.deleteAllDocs();
      await screenshot.expectHaveScreenshot("empty_screen_view");

      await myDocuments.filesEmptyView.openAndValidateFileCreateModals();

      await myDocuments.openRecentlyAccessibleTab();
      await myDocuments.filesEmptyView.checkNoFilesTextExist();

      await screenshot.expectHaveScreenshot("empty_screen_recent");

      await myDocuments.filesEmptyView.clickGotoDocumentsButton();
      await myDocuments.filesEmptyView.checkNoDocsTextExist();
    });

    await test.step("FilesCreate", async () => {
      await myDocuments.filesNavigation.openCreateDropdown();
      await screenshot.expectHaveScreenshot("files_create_dropdown");
      await myDocuments.filesNavigation.closeCreateDropdown();

      await myDocuments.filesNavigation.openAndValidateFileCreateModals();

      await myDocuments.filesArticle.openMainDropdown();
      await screenshot.expectHaveScreenshot("files_create_dropdown_action");
      await myDocuments.filesArticle.closeMainDropdown();

      await myDocuments.filesArticle.createFiles();
      await myDocuments.filesTable.hideModifiedColumn();

      await screenshot.expectHaveScreenshot("files_create_created_files");
    });

    await test.step("InfoPanel", async () => {
      await myDocuments.infoPanel.open();
      await myDocuments.infoPanel.checkNoItemTextExist();
      await screenshot.expectHaveScreenshot("info_panel_empty");

      await myDocuments.filesTable.selectDocxFile();
      await myDocuments.infoPanel.hideDatePropertiesDetails();
      await myDocuments.infoPanel.checkDocxFileProperties();
      await screenshot.expectHaveScreenshot("info_panel_file_details");

      await myDocuments.infoPanel.openOptions();
      await screenshot.expectHaveScreenshot("info_panel_file_options_opened");
      await myDocuments.infoPanel.closeMenu();

      await myDocuments.infoPanel.openTab("History");
      await myDocuments.infoPanel.checkHistoryExist("File created.");
      await myDocuments.infoPanel.hideCreationDateHistory();
      await screenshot.expectHaveScreenshot("info_panel_file_history");

      await myDocuments.infoPanel.openTab("Share");
      await myDocuments.infoPanel.checkShareExist();
      await myDocuments.infoPanel.createFirstSharedLink();
      await myDocuments.infoPanel.createMoreSharedLink();
      await screenshot.expectHaveScreenshot("info_panel_file_share");

      await myDocuments.filesTable.selectAllRows();
      await screenshot.expectHaveScreenshot("info_panel_multi_selected_files");
      await myDocuments.filesTable.resetSelect();

      await myDocuments.filesTable.selectFolderByName("Folder");
      await myDocuments.infoPanel.hideDatePropertiesDetails();
      await myDocuments.infoPanel.checkFolderProperties();

      await myDocuments.infoPanel.openOptions();
      await screenshot.expectHaveScreenshot("info_panel_folder_options");

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

    await test.step("View", async () => {
      await myDocuments.filesFilter.switchToDocumentsThumbnailView();
      await screenshot.expectHaveScreenshot("view_thumbnail");
      await myDocuments.filesFilter.switchToDocumentsCompactView();
    });

    await test.step("Sort", async () => {
      await myDocuments.filesFilter.openDropdownSortBy();
      await screenshot.expectHaveScreenshot("sort_dropdown_by");
      await myDocuments.filesFilter.clickSortBySize();
      await screenshot.expectHaveScreenshot("sort_by_size");
    });

    await test.step("Filter", async () => {
      await myDocuments.filesFilter.openFilterDialog();
      await screenshot.expectHaveScreenshot("filter_opened_dialog");

      await myDocuments.filesFilter.selectFilterByFolders();
      await myDocuments.filesFilter.applyFilter();
      await screenshot.expectHaveScreenshot("filter_by_folders");

      await myDocuments.filesFilter.openFilterDialog();
      await myDocuments.filesFilter.selectFilterByMedia();
      await myDocuments.filesFilter.applyFilter();
      await myDocuments.filesFilter.checkFilesEmptyViewExist();
      await screenshot.expectHaveScreenshot("filter_by_media_empty");

      await myDocuments.filesFilter.clearFilter();
    });

    await test.step("Search", async () => {
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
  });

  test.afterAll(async () => {
    await api.cleanup();
  });
});

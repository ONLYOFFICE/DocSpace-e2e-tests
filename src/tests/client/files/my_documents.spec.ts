import { test, Page } from "@playwright/test";

import FilesEmptyView from "@/src/objects/files/FilesEmptyView";
import FilesFilter from "@/src/objects/files/FilesFilter";
import API from "@/src/api";
import MyDocuments from "@/src/objects/files/MyDocuments";
import Login from "@/src/objects/common/Login";
import AdFrame from "@/src/objects/common/AdFrame";
import AdBanner from "@/src/objects/common/AdBanner";
import InfoPanel from "@/src/objects/common/InfoPanel";
import Screenshot from "@/src/objects/common/Screenshot";
import FilesTable from "@/src/objects/files/FilesTable";
import FilesNavigation from "@/src/objects/files/FilesNavigation";
import FilesArticle from "@/src/objects/files/FilesArticle";

test.describe("Files: My documents", () => {
  let api: API;
  let page: Page;

  let login: Login;
  let myDocuments: MyDocuments;
  let filesTable: FilesTable;
  let adFrame: AdFrame;
  let filesEmptyView: FilesEmptyView;
  let adBanner: AdBanner;
  let filesNavigation: FilesNavigation;
  let filesArticle: FilesArticle;
  let infoPanel: InfoPanel;
  let screenshot: Screenshot;
  let filesFilter: FilesFilter;

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
    infoPanel = new InfoPanel(page);

    filesTable = new FilesTable(page);
    filesArticle = new FilesArticle(page);
    filesEmptyView = new FilesEmptyView(page);
    filesNavigation = new FilesNavigation(page);
    filesFilter = new FilesFilter(page);

    await login.loginToPortal();
    await myDocuments.open();
    await adFrame.closeIframe();
    await filesTable.hideModifiedColumn();
    await adBanner.closeBanner();
  });

  test("Render", async () => {
    await screenshot.expectHaveScreenshot("render");
  });

  test("EmptyScreen", async () => {
    await filesTable.deleteAllRows();
    await filesEmptyView.checkNoDocsTextExist();

    await screenshot.expectHaveScreenshot("empty_view");

    await filesEmptyView.openAndValidateFileCreateModals();

    await myDocuments.openRecentlyAccessibleTab();
    await filesEmptyView.checkNoFilesTextExist();

    await screenshot.expectHaveScreenshot("empty_view_recent");

    await filesEmptyView.clickGotoDocumentsButton();
    await filesEmptyView.checkNoDocsTextExist();
  });

  test("FilesCreate", async () => {
    await filesNavigation.openCreateDropdown();
    await screenshot.expectHaveScreenshot("view_dropdown");
    await filesNavigation.closeCreateDropdown();

    await filesNavigation.openAndValidateFileCreateModals();

    await filesArticle.openMainDropdown();
    await screenshot.expectHaveScreenshot("view_dropdown_action");
    await filesArticle.closeMainDropdown();

    await filesArticle.createFiles();
    await filesTable.hideModifiedColumn();

    await screenshot.expectHaveScreenshot("view_created_files");
  });

  test("InfoPanel", async () => {
    await infoPanel.toggleInfoPanel();
    await infoPanel.checkNoItemTextExist();
    await screenshot.expectHaveScreenshot("view_info_panel_empty");

    await filesTable.selectDocxFile();
    await infoPanel.hideDatePropertiesDetails();
    await infoPanel.checkDocxFileProperties();
    await screenshot.expectHaveScreenshot("view_info_panel_file_details");

    await infoPanel.openOptions();
    await screenshot.expectHaveScreenshot(
      "view_openned_info_panel_file_options",
    );
    await infoPanel.closeDropdown();

    await infoPanel.openTab("History");
    await infoPanel.checkHistoryExist("File created.");
    await infoPanel.hideCreationTimeHistory();
    await screenshot.expectHaveScreenshot("view_info_panel_file_history");

    await infoPanel.openTab("Share");
    await infoPanel.checkShareExist();
    await infoPanel.createFirstSharedLink();
    await infoPanel.createMoreSharedLink();
    await screenshot.expectHaveScreenshot("view_info_panel_file_share");

    await filesTable.selectAllRows();
    await screenshot.expectHaveScreenshot(
      "view_info_panel_multiselected_files",
    );
    await filesTable.resetSelect();

    await filesTable.selectFolderByName("Folder");
    await infoPanel.hideDatePropertiesDetails();
    await infoPanel.checkFolderProperties();

    await infoPanel.openOptions();
    await screenshot.expectHaveScreenshot(
      "view_openned_info_panel_folder_options",
    );

    await infoPanel.openTab("History");
    await infoPanel.checkHistoryExist("Folder created.");

    await filesTable.openContextMenu();
    await filesTable.contextMenu.clickOption("Info");
    await infoPanel.hideDatePropertiesDetails();
    await infoPanel.checkDocxFileProperties();

    await filesTable.openContextMenu();
    await filesTable.contextMenu.clickOption("Share");
    await infoPanel.checkShareExist();

    await infoPanel.toggleInfoPanel();
  });

  test("FilesFilter", async () => {
    await filesFilter.switchToThumbnailView();
    await screenshot.expectHaveScreenshot("view_thumbnail");

    await filesFilter.switchToCompactView();
    await screenshot.expectHaveScreenshot("view_compact");

    await filesFilter.openDropdownSortBy();
    await screenshot.expectHaveScreenshot("view_dropdown_sort_by");

    await filesFilter.clickSortBySize();
    await screenshot.expectHaveScreenshot("view_sorted_by_size");

    await filesFilter.openFilterDialog();
    await screenshot.expectHaveScreenshot("view_filter_dialog");

    await filesFilter.clickFilterByFoldersTag();
    await filesFilter.clickApplyFilter();
    await screenshot.expectHaveScreenshot("view_filtered_by_folders");

    await filesFilter.openFilterDialog();
    await filesFilter.clickFilterByMediaTag();
    await filesFilter.clickApplyFilter();
    await filesFilter.checkEmptyViewExist();
    await screenshot.expectHaveScreenshot("view_filtered_by_media_empty");

    await filesFilter.clearFilter();

    await filesFilter.fillSearchInputAndCheckRequest("Document");
    await screenshot.expectHaveScreenshot("view_search_docx_file");

    await filesFilter.clearSearchText();
    await filesFilter.fillSearchInputAndCheckRequest("empty view search");
    await filesFilter.checkEmptyViewExist();
    await screenshot.expectHaveScreenshot("view_search_empty");
  });

  test.afterAll(async () => {
    await api.cleanup();
  });
});

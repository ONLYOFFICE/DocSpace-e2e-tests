import { test, expect } from "@playwright/test";

import API from "../../../api";
import Login from "../../../objects/Login";
import MyDocuments from "../../../objects/MyDocuments";
import Table from "../../../objects/Table";
import AdFrame from "../../../objects/AdFrame";
import FilesEmptyView from "../../../objects/FilesEmptyView";
import AdBanner from "../../../objects/AdBanner";
import FilesCreateDropdown from "../../../objects/FilesCreateDropdown";
import InfoPanel from "../../../objects/InfoPanel";
import Screenshot from "../../../objects/Screenshot";
import ContextMenu from "../../../objects/ContextMenu";

test.describe("Files: My documents", () => {
  let api: API;
  let login: Login;
  let myDocuments: MyDocuments;
  let table: Table;
  let adFrame: AdFrame;
  let filesEmptyView: FilesEmptyView;
  let adBanner: AdBanner;
  let filesCreateDropdown: FilesCreateDropdown;
  let infoPanel: InfoPanel;
  let screenshot: Screenshot;
  let contextMenu: ContextMenu;

  test.beforeAll(async ({ playwright }) => {
    const apiContext = await playwright.request.newContext();

    api = new API(apiContext);

    await api.setup();
  });

  test.beforeEach(async ({ page }) => {
    console.log(api.portalDomain);
    login = new Login(page, api.portalDomain);
    myDocuments = new MyDocuments(page, api.portalDomain);
    screenshot = new Screenshot(page, "my_documents", "files");
    table = new Table(page);
    adFrame = new AdFrame(page);
    adBanner = new AdBanner(page);
    filesEmptyView = new FilesEmptyView(page);
    filesCreateDropdown = new FilesCreateDropdown(page);
    infoPanel = new InfoPanel(page);
    contextMenu = new ContextMenu(page);

    await login.loginToPortal();
    await myDocuments.open();
    await table.hideModified();
    await adFrame.closeIframe();
    await adBanner.closeBanner();
  });

  test("Render", async () => {
    await screenshot.expectHaveScreenshot("render");
  });

  test("EmptyScreen", async () => {
    await table.deleteAllRows();
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
    await filesCreateDropdown.clickHeaderAddButton();

    await screenshot.expectHaveScreenshot("view_dropdown");

    await filesCreateDropdown.closeCreateDropdown();
    await filesCreateDropdown.openAndValidateFileCreateModals();

    await filesCreateDropdown.openCreateDropdownByMainButton();

    await screenshot.expectHaveScreenshot("view_dropdown_action");

    await filesCreateDropdown.closeCreateDropdown();
    await filesCreateDropdown.createFiles();

    await table.hideModified();

    await screenshot.expectHaveScreenshot("view_created_files");
  });

  test("InfoPanel", async ({ page }) => {
    await infoPanel.toggleInfoPanel();
    await infoPanel.checkNoItemTextExist();
    await screenshot.expectHaveScreenshot("view_info_panel_empty");

    await table.selectDocxFile();
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

    await page.pause();
    await table.selectAllRows();
    await screenshot.expectHaveScreenshot(
      "view_info_panel_multiselected_files",
    );
    await table.resetSelect();

    await table.selectFolderByName("Folder");
    await infoPanel.hideDatePropertiesDetails();
    await infoPanel.checkFolderProperties();

    await infoPanel.openOptions();
    await screenshot.expectHaveScreenshot(
      "view_openned_info_panel_folder_options",
    );

    await infoPanel.openTab("History");
    await infoPanel.checkHistoryExist("Folder created.");

    await table.openContextMenu();

    await contextMenu.selectOption("Info");
    await infoPanel.hideDatePropertiesDetails();
    await infoPanel.checkDocxFileProperties();

    await table.openContextMenu();

    await contextMenu.selectOption("Share");
    await infoPanel.checkShareExist();

    await infoPanel.toggleInfoPanel();
  });

  test.afterAll(async () => {
    await api.cleanup();
  });
});

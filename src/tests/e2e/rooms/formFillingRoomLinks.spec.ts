import { test } from "@/src/fixtures";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomPDFCompleted from "@/src/objects/rooms/RoomPDFCompleted";
import InfoPanel from "@/src/objects/common/InfoPanel";
import { BrowserContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import FilesTable from "@/src/objects/files/FilesTable";
import RoomEmptyView from "@/src/objects/rooms/RoomEmptyView";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import { INFO_PANEL_TABS } from "@/src/utils/types/common";
import Login from "@/src/objects/common/Login";
import RoomAnonymousView from "@/src/objects/rooms/RoomAnonymousView";
import FilesNavigation from "@/src/objects/files/FilesNavigation";
import BaseToast from "@/src/objects/common/BaseToast";
import BaseEditLink from "@/src/objects/common/BaseLinkSettings";
import {
  setupClipboardPermissions,
  setupIncognitoContext,
  cleanupIncognitoContext,
  getLinkFromClipboard,
  verifyLoginPageInIncognito,
  verifyAnonymousPageInIncognito,
  verifyInvalidLinkMessageInIncognito,
  verifyAccessDeniedInIncognito,
  ensureIncognitoPage,
} from "@/src/utils/helpers/linkTest";
import {
  copyFileLink,
  uploadAndVerifyPDF,
} from "@/src/utils/helpers/formFillingRoom";

test.describe("FormFilling room - Link tests", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let roomEmptyView: RoomEmptyView;
  let filesTable: FilesTable;
  let selectPanel: RoomSelectPanel;
  let infoPanel: InfoPanel;
  let incognitoContext: BrowserContext | null = null;
  let incognitoPage: Page | null = null;
  let login: Login;
  let roomAnonymousView: RoomAnonymousView;

  test.beforeEach(async ({ page, api }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    roomEmptyView = new RoomEmptyView(page);
    filesTable = new FilesTable(page);
    selectPanel = new RoomSelectPanel(page);
    infoPanel = new InfoPanel(page);
    login = new Login(page, api.portalDomain);
    roomAnonymousView = new RoomAnonymousView(page);
    await login.loginToPortal();
    await myRooms.createFormFillingRoom("FormFillingRoom");
  });

  test.afterEach(async () => {
    await cleanupIncognitoContext(incognitoContext, incognitoPage);
  });
  test("Verify room link remains unchanged when modifying file sharing settings", async ({
    page,
  }) => {
    await test.step("Upload PDF form from My Documents", async () => {
      await shortTour.clickSkipTour();
      await roomEmptyView.uploadPdfFromDocSpace();
      await selectPanel.checkSelectorExist();
      await selectPanel.select("documents");
      await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
      await selectPanel.confirmSelection();
      await shortTour.clickModalCloseButton().catch(() => {});
      await myRooms.infoPanel.close();
      //Check file added to room
      await expect(page.getByLabel("ONLYOFFICE Resume Sample,")).toBeVisible();
    });
    await test.step("Change link to file", async () => {
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      //Set link access to "docspace users only" and copy link
      await infoPanel.selectLinkAccess("docspace users only");
      //Check link copied to clipboard
      await myRooms.toast.dismissToastSafely("Link copied to clipboard", 10000);
      await myRooms.infoPanel.close();
    });
    await test.step("Check link to room doesn't changed", async () => {
      // Navigate to the contacts/members tab for sharing options of Room
      await myRooms.infoPanel.open();
      const membersTab = page.getByTestId(INFO_PANEL_TABS.Contacts.testId);
      await expect(membersTab).toBeVisible();
      await infoPanel.clickLinkComboboxAccess();
      // Check access level Room changed to "docspace users only"
      const currentOption = await infoPanel.getCurrentLinkAccess();
      expect(currentOption).toBe("docspace users only"); //Bug 79256
    });
  });

  // Check the page after filling does not contain Back to Room button
  test("Filling PDF Form with link by anonymous", async ({ page, browser }) => {
    let incognitoPage: Page;

    await test.step("Upload PDF Form from My Documents", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
    });

    await test.step("Copy shared link for PDF form", async () => {
      await copyFileLink(page, filesTable, myRooms);
    });

    await test.step("Open PDF form in incognito", async () => {
      const url = await getLinkFromClipboard(page);
      if (!url) throw new Error("Clipboard is empty");
      const result = await setupIncognitoContext(browser);
      incognitoPage = result.page;
      await incognitoPage.goto(url, { waitUntil: "domcontentloaded" });
    });
    let completedForm: RoomPDFCompleted;
    await test.step("Submit not filled PDF Form", async () => {
      ensureIncognitoPage(incognitoPage);
      const pdfForm = new FilesPdfForm(incognitoPage);
      //Submit form with empty fields
      completedForm = await pdfForm.clickSubmitButton();
      //Check document title on completed form page
      await completedForm.checkDocumentTitleIsVisible(
        "1 - ONLYOFFICE Resume Sample",
      );
    });
    await test.step("Check back to room button is hidden", async () => {
      await completedForm.checkBackToRoomButtonHidden();
    });
    await test.step("Check download button is visible and clickable", async () => {
      ensureIncognitoPage(incognitoPage);
      await completedForm.checkDownloadButtonVisible();
    });
    await test.step("Click download button and verify download starts", async () => {
      ensureIncognitoPage(incognitoPage);
      const [download] = await Promise.all([
        incognitoPage.waitForEvent("download"),
        completedForm.clickDownloadButton(),
      ]);
      const fileName = await download.suggestedFilename();
      expect(fileName).toMatch(/ONLYOFFICE Resume Sample.*\.pdf$/i);
      // cancel download to avoid file saving
      await download.cancel();
    });
  });
  //Check copy shared link in modal window after Pdf form uploaded to Room
  test("Copy shared link in modal window for PDF Form", async ({
    page,
    browser,
  }) => {
    let shareLink: string;
    await test.step("Upload PDF Form from My Documents", async () => {
      await shortTour.clickSkipTour();
      await roomEmptyView.uploadPdfFromDocSpace();
      await selectPanel.checkSelectorExist();
      await selectPanel.select("documents");
      await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
      await selectPanel.confirmSelection();
    });

    await test.step("Copy shared link in modal window", async () => {
      // Setup clipboard permissions to allow copying the shared
      await setupClipboardPermissions(page);
      // Click copy public link button on Modal window
      await shortTour.clickCopyPublicLink();
      await myRooms.toast.dismissToastSafely("Link copied to clipboard", 5000);
      // Retrieve the shared link from clipboard for later use
      shareLink = await page.evaluate(() => navigator.clipboard.readText());
      if (!shareLink)
        throw new Error("Failed to get share link from clipboard");
    });
    await test.step("Open PDF form in incognito", async () => {
      const url = await page.evaluate(() => navigator.clipboard.readText());
      if (!url) throw new Error("Clipboard is empty");
      incognitoContext = await browser.newContext();
      incognitoPage = await incognitoContext.newPage();
      await incognitoPage.goto(url, { waitUntil: "domcontentloaded" });
    });
    //check form will open for filling
    await test.step("Check Submit button exist", async () => {
      ensureIncognitoPage(incognitoPage);
      const pdfForm = new FilesPdfForm(incognitoPage);
      await pdfForm.checkSubmitButtonExist();
    });
  });
  test("Verify file links are identical on repeated copying", async ({
    page,
  }) => {
    let firstLink: string;
    let secondLink: string;

    await test.step("Upload PDF form", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
    });

    await test.step("Copy file link first time", async () => {
      firstLink = await copyFileLink(page, filesTable, myRooms);
    });

    await test.step("Copy file link second time", async () => {
      secondLink = await copyFileLink(page, filesTable, myRooms);
    });

    await test.step("Verify links are identical", async () => {
      expect(firstLink).toBe(secondLink);
    });
  });
  //Checking the link to the file will open the authorization page.
  test("Open shared link pdf form for Docspace users only", async ({
    page,
    browser,
  }) => {
    let shareLink: string;
    await test.step("Upload PDF form from My Documents", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
    });
    await test.step("Change and copy link to file access docspace users only", async () => {
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );

      await setupClipboardPermissions(page);
      //the link is automatically copied along with the change of access rights
      await infoPanel.selectLinkAccess("docspace users only");
      await myRooms.toast.dismissToastSafely("Link copied to clipboard", 10000);
      shareLink = await getLinkFromClipboard(page);
    });
    await test.step("Open PDF form in incognito and check login button", async () => {
      await verifyLoginPageInIncognito(browser, shareLink);
    });
  });
  //Checking the link to the Room will open the authorization page.
  test("Open shared link Room for Docspace users only", async ({
    page,
    browser,
  }) => {
    await test.step("Upload PDF form from My Documents", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
    });
    let shareLink: string;
    //the link is automatically copied along with the change of access rights
    await test.step("Change and copy link to Room", async () => {
      await myRooms.infoPanel.open();
      // Navigate to the contacts/members tab for sharing options
      const membersTab = page.getByTestId(INFO_PANEL_TABS.Contacts.testId);
      await expect(membersTab).toBeVisible();
      await setupClipboardPermissions(page);
      // Set and copy link access
      await infoPanel.selectLinkAccess("docspace users only");
      await myRooms.toast.dismissToastSafely("Link copied to clipboard", 10000);
      // Retrieve the shared link from clipboard for later use
      shareLink = await page.evaluate(() => navigator.clipboard.readText());
      if (!shareLink)
        throw new Error("Failed to get share link from clipboard");
      await myRooms.infoPanel.close();
    });
    //Check opening link at login Page
    await test.step("Open PDF form in incognito and check login button", async () => {});
    // Get shared link from clipboard
    const url = await page.evaluate(() => navigator.clipboard.readText());
    if (!url) throw new Error("Clipboard is empty");
    await verifyLoginPageInIncognito(browser, url);
  });
  //Checking the link to the Room will open with file and Sing In button
  test("Open shared link Room for Anyone with link", async ({
    page,
    browser,
  }) => {
    let shareLink: string;
    let incognitoPage: Page;

    //Copy link to the room
    await test.step("Click Share room in empty view", async () => {
      await shortTour.clickSkipTour();
      await setupClipboardPermissions(page);
      await roomEmptyView.shareRoomClick();
      await myRooms.toast.dismissToastSafely("Link copied to clipboard", 10000);
      //Save link to clipboard
      shareLink = await page.evaluate(() => navigator.clipboard.readText());
      if (!shareLink)
        throw new Error("Failed to get share link from clipboard");
    });

    await test.step("Upload PDF form from My Documents", async () => {
      await roomEmptyView.uploadPdfFromDocSpace();
      await selectPanel.checkSelectorExist();
      await selectPanel.select("documents");
      await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
      await selectPanel.confirmSelection();
      await shortTour.clickModalCloseButton().catch(() => {});
      await myRooms.infoPanel.close();
      await expect(page.getByLabel("ONLYOFFICE Resume Sample,")).toBeVisible();
    });

    await test.step("Open Room in incognito and check Sign In button", async () => {
      const url = await page.evaluate(() => navigator.clipboard.readText());
      if (!url) throw new Error("Clipboard is empty");
      const result = await verifyAnonymousPageInIncognito(browser, url);
      incognitoContext = result.context;
      incognitoPage = result.page;
    });

    await test.step("Validate pdf form is visible", async () => {
      await expect(
        incognitoPage.getByLabel("ONLYOFFICE Resume Sample,"),
      ).toBeVisible();
    });

    await test.step("Validate that Complete and In progress folders do not exist", async () => {
      const incognitoMyRooms = new MyRooms(incognitoPage, "docspace");
      // Verify the "Complete" folder is not visible
      await incognitoMyRooms.verifyCompleteFolderNotVisible();
      // Verify the "In progress" folder is not visible
      await incognitoMyRooms.verifyInProgressFolderNotVisible();
    });
  });
  //Check that Progress folders can't be deleted
  test("Progress folders can't be deleted", async ({ page }) => {
    //Upload the document so that the progress folders appear.
    await test.step("UploadPDFFormFromMyDocuments", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
    });
    await test.step("Check Delete doesn't exist for Complete folder", async () => {
      const filesTable = new FilesTable(page);
      await filesTable.openContextMenuForItem("Complete");
      // Verify Delete option is not visible in the context menu
      await expect(
        filesTable.contextMenu.menu.getByText("Delete"),
      ).not.toBeVisible();
      await page.keyboard.press("Escape");
      // Check Delete button is not visible on the page
      filesTable.selectFolderByName("Complete");
      await expect(page.getByText("Delete")).not.toBeVisible();
    });
    await test.step("Check Delete doesn't exist for In Progress folder", async () => {
      const filesTable = new FilesTable(page);
      await filesTable.openContextMenuForItem("In process");
      // Verify Delete option is not visible in the context menu
      await expect(
        filesTable.contextMenu.menu.getByText("Delete"),
      ).not.toBeVisible();
      await page.keyboard.press("Escape");
      // Check Delete button is not visible on the page
      filesTable.selectFolderByName("In process");
      await expect(page.getByText("Delete")).not.toBeVisible();
    });
  });
  //Check that room can't be open after revoking link
  test("Revoke link Room and open it", async ({ page, browser }) => {
    let shareLink: string;

    await test.step("Copy link to the room", async () => {
      await shortTour.clickSkipTour();
      await setupClipboardPermissions(page);
      await roomEmptyView.shareRoomClick();
      await myRooms.toast.dismissToastSafely("Link copied to clipboard", 10000);
      shareLink = await getLinkFromClipboard(page);
    });

    await test.step("Revoke link", async () => {
      await myRooms.infoPanel.revokeRoomLink();
    });

    await test.step("Verify old link is invalid", async () => {
      await verifyInvalidLinkMessageInIncognito(browser, shareLink);
    });
  });
  //Check new link after revoke old link
  test("Check new room link after revoke old link", async ({
    page,
    browser,
  }) => {
    let oldShareLink: string;
    let newShareLink: string;

    await test.step("Copy initial link", async () => {
      await shortTour.clickSkipTour();
      await setupClipboardPermissions(page);
      await roomEmptyView.shareRoomClick();
      await myRooms.toast.dismissToastSafely("Link copied to clipboard", 10000);
      oldShareLink = await getLinkFromClipboard(page);
    });

    await test.step("Revoke and generate new link", async () => {
      await myRooms.infoPanel.revokeRoomLink();

      await setupClipboardPermissions(page);
      await roomEmptyView.shareRoomClick();
      await myRooms.toast.dismissToastSafely("Link copied to clipboard", 10000);
      newShareLink = await getLinkFromClipboard(page);

      if (oldShareLink === newShareLink) {
        throw new Error("New link should be different from old link");
      }
    });

    await test.step("Verify new link works", async () => {
      const { context, page: incognitoPage } =
        await setupIncognitoContext(browser);
      await incognitoPage.goto(newShareLink, { waitUntil: "domcontentloaded" });
      await roomAnonymousView.singInButtonVisible();
      await cleanupIncognitoContext(context, incognitoPage);
    });
  });
  test("Check new file link after revoke old link", async ({
    page,
    browser,
  }) => {
    let oldFileLink: string;
    let newFileLink: string;

    await test.step("Upload PDF form and copy file link", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );

      const filesTable = new FilesTable(page);
      oldFileLink = await copyFileLink(page, filesTable, myRooms);
    });

    await test.step("Revoke file link", async () => {
      const filesTable = new FilesTable(page);
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await myRooms.infoPanel.openLinkContextMenu();
      await myRooms.infoPanel.clickDeleteLink();
      await myRooms.toast.checkToastMessage(
        "New general link created successfully",
      );
    });

    await test.step("Verify old file link is invalid", async () => {
      await verifyAccessDeniedInIncognito(browser, oldFileLink);
    });

    await test.step("Copy new file link", async () => {
      const filesTable = new FilesTable(page);
      newFileLink = await copyFileLink(page, filesTable, myRooms);
    });

    await test.step("Verify new file link works", async () => {
      const { context, page } = await setupIncognitoContext(browser);
      await page.goto(newFileLink, { waitUntil: "domcontentloaded" });
      const pdfForm = new FilesPdfForm(page);
      await pdfForm.checkSubmitButtonExist();
      await expect(page.getByText("Invalid link")).not.toBeVisible();
      await cleanupIncognitoContext(context, page);
    });
  });
  test("Revoke file link invalidates room link", async ({ page, browser }) => {
    let roomLink: string;
    let fileLink: string;

    await test.step("Copy initial room link", async () => {
      await shortTour.clickSkipTour();
      await setupClipboardPermissions(page);
      await roomEmptyView.shareRoomClick();
      await myRooms.toast.dismissToastSafely("Link copied to clipboard", 10000);
      roomLink = await getLinkFromClipboard(page);
    });

    await test.step("Upload PDF and copy file link", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
        false,
      );
      const filesTable = new FilesTable(page);
      fileLink = await copyFileLink(page, filesTable, myRooms);
    });

    await test.step("Verify both links work initially", async () => {
      // Verify room link works
      const { context: roomContext, page: roomPage } =
        await setupIncognitoContext(browser);
      await roomPage.goto(roomLink, { waitUntil: "domcontentloaded" });
      await roomAnonymousView.singInButtonVisible();
      await cleanupIncognitoContext(roomContext, roomPage);

      // Verify file link works
      const { context: fileContext, page: filePage } =
        await setupIncognitoContext(browser);
      await filePage.goto(fileLink, { waitUntil: "domcontentloaded" });
      const pdfForm = new FilesPdfForm(filePage);
      await pdfForm.checkSubmitButtonExist();
      await cleanupIncognitoContext(fileContext, filePage);
    });

    await test.step("Revoke file link", async () => {
      const filesTable = new FilesTable(page);
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await myRooms.infoPanel.openLinkContextMenu();
      await myRooms.infoPanel.clickDeleteLink();
      await myRooms.toast.checkToastMessage(
        "New general link created successfully",
      );
    });

    await test.step("Verify room link becomes invalid", async () => {
      await verifyInvalidLinkMessageInIncognito(browser, roomLink);
    });

    await test.step("Verify file link becomes invalid", async () => {
      await verifyAccessDeniedInIncognito(browser, fileLink);
    });
  });
  //Check Access Denied when opening deleted file link
  test("Delete pdf form from room and verify link Access denied", async ({
    page,
    browser,
  }) => {
    let fileLink: string;

    await test.step("UploadPDFFormFromMyDocuments", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
    });

    await test.step("Copy file link before deletion", async () => {
      fileLink = await copyFileLink(page, filesTable, myRooms);
    });

    await test.step("Delete pdf in the context menu", async () => {
      const filesTable = new FilesTable(page);
      await filesTable.selectPdfFile();
      const filesNavigation = new FilesNavigation(page);
      await filesNavigation.delete();
      const toast = new BaseToast(page);
      await toast.removeToast("successfully moved to Trash");
      await expect(
        page.getByText("ONLYOFFICE Resume Sample"),
      ).not.toBeVisible();
    });

    await test.step("Verify Access denied when opening deleted file link", async () => {
      await verifyAccessDeniedInIncognito(browser, fileLink);
    });
  });
  test("Check link settings panel for file", async ({ page }) => {
    let baseEditLink: BaseEditLink;

    await test.step("Upload PDF form", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
    });

    await test.step("Open file sharing settings", async () => {
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
    });

    await test.step("Open link settings panel", async () => {
      await myRooms.infoPanel.openLinkSettings();
      baseEditLink = new BaseEditLink(page);
    });

    await test.step("Set link name", async () => {
      await baseEditLink.newLinkName("Test Link");
    });

    await test.step("Set access level to DocSpace users only", async () => {
      await baseEditLink.selectLinkAccess("docspace");
    });

    await test.step("Set up password protection", async () => {
      await baseEditLink.clickTogglePassword();
      await baseEditLink.fillPassword("TestPassword123");
    });

    await test.step("Test password visibility toggle", async () => {
      await baseEditLink.clickShowPassword();
    });

    await test.step("Test password clear and regenerate", async () => {
      await baseEditLink.clickCleanPassword();
      await baseEditLink.generatePassword();
    });

    await test.step("Copy password to clipboard", async () => {
      await baseEditLink.clickCopyPassword();
      await myRooms.toast.checkToastMessage("Password successfully copied");
    });

    await test.step("Verify date period is not visible", async () => {
      expect(await baseEditLink.dataLinkPeriod).not.toBeVisible();
    });

    await test.step("Save link settings", async () => {
      await baseEditLink.clickSaveButton();
    });
  });

  test("Edit share link to room", async ({ page }) => {
    let baseEditLink: BaseEditLink;

    await test.step("Open sharing settings and click link settings", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.open();
      const membersTab = page.getByTestId(INFO_PANEL_TABS.Contacts.testId);
      await expect(membersTab).toBeVisible();
      await myRooms.infoPanel.openLinkSettings();
      baseEditLink = new BaseEditLink(page);
    });

    await test.step("Configure link settings", async () => {
      await baseEditLink.configureLinkSettings({
        name: "Test Link",
        access: "docspace",
        password: "TestPassword123",
        save: true,
      });
    });

    await test.step("Reopen link settings for verification", async () => {
      await myRooms.infoPanel.open();
      const membersTab = page.getByTestId(INFO_PANEL_TABS.Contacts.testId);
      await expect(membersTab).toBeVisible();
      await myRooms.infoPanel.openLinkSettings();
      baseEditLink = new BaseEditLink(page);
    });

    await test.step("Verify all settings are saved correctly", async () => {
      await expect(baseEditLink.linkNameInput).toHaveValue("Test Link");

      const combo = baseEditLink.comboLinkAccess;
      await expect(combo).toContainText("DocSpace users only");

      await expect(baseEditLink.passwordInput).toBeVisible();
      const passwordValue = await baseEditLink.passwordInput.inputValue();
      expect(passwordValue).not.toBe("");

      expect(await baseEditLink.dataLinkPeriod).not.toBeVisible();
    });

    await test.step("Close settings", async () => {
      await baseEditLink.clickCancelButton();
    });
  });
});

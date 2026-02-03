import { test } from "@/src/fixtures";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import fs from "fs";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomPDFCompleted from "@/src/objects/rooms/RoomPDFCompleted";
import InfoPanel from "@/src/objects/common/InfoPanel";
import path from "path";
import { BrowserContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import FilesTable from "@/src/objects/files/FilesTable";
import RoomEmptyView from "@/src/objects/rooms/RoomEmptyView";
import { formFillingRoomContextMenuOption } from "@/src/utils/constants/rooms";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import { INFO_PANEL_TABS } from "@/src/utils/types/common";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import Login from "@/src/objects/common/Login";
import RoomAnonymousView from "@/src/objects/rooms/RoomAnonymousView";

function ensureIncognitoPage(
  incognitoPage: Page | null,
): asserts incognitoPage is Page {
  if (!incognitoPage) {
    throw new Error("incognitoPage is not initialized");
  }
}
async function setupClipboardPermissions(page: Page) {
  const origin = new URL(page.url()).origin;
  const isFirefox =
    (await page.context().browser()?.browserType().name()) === "firefox";

  try {
    if (isFirefox) {
      await page
        .context()
        .grantPermissions(["clipboardReadWrite", "clipboard-sanitized-write"], {
          origin,
        });
    } else {
      await page
        .context()
        .grantPermissions(["clipboard-read", "clipboard-write"], { origin });
    }
    // Clear clipboard
    await page.evaluate(() => navigator.clipboard.writeText(""));
  } catch (error: unknown) {
    // Add type annotation here
    if (error instanceof Error) {
      console.warn("Could not set up clipboard permissions:", error.message);
    } else {
      console.warn(
        "An unknown error occurred while setting up clipboard permissions",
      );
    }
  }
}
test.describe("FormFilling room tests", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let newPage: Page;
  let roomEmptyView: RoomEmptyView;
  let filesTable: FilesTable;
  let selectPanel: RoomSelectPanel;
  let infoPanel: InfoPanel;
  let roomInfoPanel: RoomInfoPanel;
  let roomsInviteDialog: RoomsInviteDialog;
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
    roomInfoPanel = new RoomInfoPanel(page);
    roomsInviteDialog = new RoomsInviteDialog(page);
    login = new Login(page, api.portalDomain);
    roomAnonymousView = new RoomAnonymousView(page);
    await login.loginToPortal();
    await myRooms.createFormFillingRoom("FormFillingRoom");
  });
  test.afterEach(async () => {
    if (incognitoPage) {
      await incognitoPage.close().catch(() => {});
      incognitoPage = null;
    }
    if (incognitoContext) {
      await incognitoContext.close().catch(() => {});
      incognitoContext = null;
    }
  });

  test("Take A Tour", async () => {
    await test.step("TakeATourAfterCreatingFormFillingRoom", async () => {
      await shortTour.checkStep("welcome");
      await shortTour.clickStartTour();
      await shortTour.checkStep("firstStep");
      await shortTour.clickNextStep();
      await shortTour.checkStep("secondStep");
      await shortTour.clickNextStep();
      await shortTour.checkStep("thirdStep");
      await shortTour.clickNextStep();
      await shortTour.checkStep("fourthStep");
      await shortTour.clickNextStep();
      await shortTour.checkStep("fifthStep");
      await shortTour.clickNextStep();
      await myRooms.infoPanel.close();
      ////check the tour has closed and a empty page is visible
      await roomEmptyView.checkEmptyView();
    });
    await test.step("CheckSkipButtonTheTourModalWindow", async () => {
      await myRooms.navigation.openContextMenu();
      await myRooms.navigation.contextMenu.clickOption(
        formFillingRoomContextMenuOption.startTour,
      );
      await shortTour.checkStep("welcome");
      await shortTour.clickSkipTour();
      //check the tour has closed and a empty page is visible
      await roomEmptyView.checkEmptyView();
    });
    await test.step("CheckCloseButtonTheTourModalWindow", async () => {
      await myRooms.navigation.openContextMenu();
      await myRooms.navigation.contextMenu.clickOption(
        formFillingRoomContextMenuOption.startTour,
      );
      await shortTour.checkStep("welcome");
      await shortTour.clickModalCloseButton();
      //check the tour has closed and a empty page is visible
      await roomEmptyView.checkEmptyView();
    });
    await test.step("CheckTheBackButtonTheTourModalWindow", async () => {
      await myRooms.navigation.openContextMenu();
      await myRooms.navigation.contextMenu.clickOption(
        formFillingRoomContextMenuOption.startTour,
      );
      await shortTour.checkStep("welcome");
      await shortTour.clickStartTour();
      await shortTour.checkStep("firstStep");
      await shortTour.clickNextStep();
      await shortTour.checkStep("secondStep");
      await shortTour.clickBackStep();
      await shortTour.checkStep("firstStep");
      await shortTour.clickModalCloseButton();
      //check the tour has closed and a empty page is visible
      await roomEmptyView.checkEmptyView();
    });
  });
  test("Check All Buttons On Empty Page", async ({ page }) => {
    await test.step("ClickShareRoomOnEmptyRoomScreen", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.close();
      await roomEmptyView.shareRoomClick();
      await myRooms.toast.clickLinkInToast();
      await myRooms.infoPanel.checkInfoPanelExist();
      //check the form filling shared link exist in info panel
      await myRooms.infoPanel.checkFormFillingSharedLinkExist();
    });
    await test.step("ClickAddPDFFormFromMyDocuments", async () => {
      await roomEmptyView.uploadPdfFromDocSpace();
      //check folders on Select Panel
      await selectPanel.verifyAllFolderOptions();
      await selectPanel.close();
    });
    await test.step("ClickUploadFormFromDevice", async () => {
      const pdfPath = path.resolve(
        __dirname,
        "../../../../data/rooms/PDF from device.pdf",
      );
      console.log("PDF Path:", pdfPath);
      console.log("Exists:", fs.existsSync(pdfPath));
      await roomEmptyView.uploadPdfForm(pdfPath);
      await shortTour.clickModalCloseButton();
      await myRooms.infoPanel.close();
      await myRooms.filesTable.hideModifiedColumn();
      await myRooms.filesTable.selectPdfFile();
      await expect(page.getByLabel("PDF from device,")).toBeVisible();
      await expect(page.getByLabel("In process")).toBeVisible();
      await expect(page.getByLabel("Complete")).toBeVisible();
    });
  });
  test("Submit Not Filling PDF Form", async ({ page }) => {
    await test.step("UploadPDFFormFromMyDocuments", async () => {
      await shortTour.clickSkipTour();
      await roomEmptyView.uploadPdfFromDocSpace();
      await selectPanel.checkSelectorExist();
      await selectPanel.select("documents");
      await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
      await selectPanel.confirmSelection();
      await shortTour.clickModalCloseButton().catch(() => {});
      await myRooms.infoPanel.close();
      await expect(page.getByLabel("ONLYOFFICE Resume Sample,")).toBeVisible();
    });

    // Submit Form
    await test.step("SubmitPDFFormWithEmptyFields", async () => {
      const context = page.context();
      const pagePromise = context.waitForEvent("page");
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Fill");
      // Wait for the new page to open
      newPage = await pagePromise;
      await newPage.waitForLoadState("load");
      const pdfForm = new FilesPdfForm(newPage);
      const pdfCompleted = new RoomPDFCompleted(newPage);
      await pdfForm.clickSubmitButton();
      await pdfCompleted.chooseBackToRoom();
      await expect(newPage.getByLabel("ONLYOFFICE Resume Sample,")).toBeVisible(
        { timeout: 10000 },
      );
    });
    await test.step("CheckPDFFormAndXlsxInCompleteFolder", async () => {
      const filesTable = new FilesTable(newPage);
      await filesTable.openContextMenuForItem("Complete");
      await filesTable.contextMenu.clickOption("Open");
      await expect(
        newPage.getByRole("heading", { name: "Complete" }),
      ).toBeVisible();
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Open");
      await expect(
        newPage.getByLabel(
          /1 - admin-zero admin-zero - ONLYOFFICE Resume Sample/,
        ),
      ).toBeVisible();
      await expect(
        newPage.getByLabel("ONLYOFFICE Resume Sample,"),
      ).toBeVisible();
    });

    // Check File Size
    await test.step("CheckSizeOfXlsxFileNotEqualZero", async () => {
      const item = newPage.locator('[aria-label="ONLYOFFICE Resume Sample,"]');
      await expect(item).toBeVisible();
      const filesTable = new FilesTable(newPage);
      await filesTable.openContextMenuRow(item);
      await filesTable.contextMenu.clickOption("Select");
      const infoPanel = new InfoPanel(newPage);
      await infoPanel.open();
      const sizeNum = await infoPanel.getSizeInBytes();
      await expect(sizeNum).toBeGreaterThan(0);
    });

    // Open XLSX File
    await test.step("OpenResultXlsxFile", async () => {
      const item = newPage.locator('[aria-label="ONLYOFFICE Resume Sample,"]');
      const filesTable = new FilesTable(newPage);
      await filesTable.openContextMenuRow(item);
      await filesTable.contextMenu.clickOption("Preview");
      const xlsxPage = await newPage.waitForEvent("popup");
      await xlsxPage.waitForSelector('iframe[name="frameEditor"]', {
        state: "attached",
        timeout: 60000,
      });
      const frameEditor = xlsxPage.frameLocator('iframe[name="frameEditor"]');
      const canvasOverlay = frameEditor.locator("#ws-canvas-graphic-overlay");
      await expect(frameEditor.locator("#box-doc-name")).toBeVisible({
        timeout: 20000,
      });
      await expect(canvasOverlay).toBeVisible({ timeout: 30000 });
      await xlsxPage.close();
    });
  });
  test("Check work with Draft PDF Form", async ({ page }) => {
    await test.step("UploadPDFFormFromMyDocuments", async () => {
      await shortTour.clickSkipTour();
      await roomEmptyView.uploadPdfFromDocSpace();
      await selectPanel.checkSelectorExist();
      await selectPanel.select("documents");
      await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
      await selectPanel.confirmSelection();
      await shortTour.clickModalCloseButton().catch(() => {});
      await myRooms.infoPanel.close();
      await expect(page.getByLabel("ONLYOFFICE Resume Sample,")).toBeVisible();
    });
    await test.step("Open and close pdf form", async () => {
      const context = page.context();
      const pagePromise = context.waitForEvent("page");
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Fill");
      // Wait for the new page to open
      newPage = await pagePromise;
      await newPage.waitForLoadState("load");
      const pdfForm = new FilesPdfForm(newPage);
      // Dont fill the form, just close it
      await pdfForm.clickCloseButton();
      //Verify file visible in the room
      await expect(
        newPage.getByLabel(/admin-zero admin-zero - ONLYOFFICE Resume Sample/),
      ).toBeVisible();
    });
    await test.step("Check PDF Form in Progress folder", async () => {
      await newPage
        .getByRole("heading", { name: "ONLYOFFICE Resume Sample" })
        .click();
      //Navigate to In process folder
      await newPage.getByText("In process", { exact: true }).click();
      //Verify file visible in In process folder
      await expect(
        newPage.getByLabel("ONLYOFFICE Resume Sample,"),
      ).toBeVisible();
    });
    await test.step("Check mark file label Draft", async () => {
      // Switch focus back to the main page
      await page.bringToFront();
      // Verify the Draft label is visible on the file
      await myRooms.verifyDraftLabelVisible();
    });
  });
  test("Search for user in room info panel", async ({ page }) => {
    await test.step("Open room info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
    });
    await test.step("Search for non-existent user", async () => {
      const nonExistentUser = "nonexistentuser123";
      await roomInfoPanel.search(nonExistentUser);
      // Verify no members found message is visible
      await expect(roomInfoPanel.noMembersFound).toBeVisible();
      await roomInfoPanel.clearSearch();
    });
    await test.step("Search for existing user", async () => {
      await roomInfoPanel.search("Admin");
      await expect(
        page.locator("p").filter({ hasText: "admin-zero admin-zero" }).first(),
      ).toBeVisible();
    });
  });

  test("Add manualy guest to room", async () => {
    await test.step("Open room info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.open();
      // Navigate to the Contacts tab to manage users
      await myRooms.infoPanel.openTab("Contacts");
    });

    await test.step("Add guest with default access Form filler", async () => {
      const email = "test@example.com";
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.fillSearchInviteInput(email);
      await roomsInviteDialog.clickAddUserToInviteList(email);
      await roomsInviteDialog.checkAddedUserExist(email);
      // Verify the default role is set to Form filler
      await roomsInviteDialog.verifyUserRole(email, "Form filler");
      await roomsInviteDialog.submitInviteDialog();
    });
    await test.step("Add guest with Content creator access", async () => {
      const email = "testContentCreator@example.com";
      //Open invite dialog
      await roomInfoPanel.clickAddUser();
      //Select Content creator access
      await roomsInviteDialog.openAccessOptions();
      await roomsInviteDialog.selectAccessOption("Content creator");
      await roomsInviteDialog.fillSearchInviteInput(email);
      await roomsInviteDialog.clickAddUserToInviteList(email);
      await roomsInviteDialog.checkAddedUserExist(email);
      // Verify the role is set to Content creator at list users
      await roomsInviteDialog.verifyUserRole(email, "Content creator");
      await roomsInviteDialog.submitInviteDialog();
    });
    await test.step("Guest can't be added as Room Manager", async () => {
      const email = "testRoomManager@example.com";
      //Open invite dialog
      await roomInfoPanel.clickAddUser();
      //Select Room manager access
      await roomsInviteDialog.openAccessOptions();
      await roomsInviteDialog.selectAccessOption("Room manager");
      await roomsInviteDialog.fillSearchInviteInput(email);
      await roomsInviteDialog.clickAddUserToInviteList(email);
      await roomsInviteDialog.checkAddedUserExist(email);
      // Verify the role changed to Content creator at list users
      await roomsInviteDialog.verifyUserRole(email, "Content creator");
      // Verify the warning icon is visible
      await roomsInviteDialog.checkRoleWarningVisible();
      await roomsInviteDialog.submitInviteDialog();
    });
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
  // Сheck the page after filling does not contain Back to Room button
  test.skip("Filling PDF Form with link by anonymous", async ({
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
      await shortTour.clickModalCloseButton().catch(() => {});
      await myRooms.infoPanel.close();
      await expect(page.getByLabel("ONLYOFFICE Resume Sample,")).toBeVisible();
    });

    await test.step("Copy shared link for PDF form", async () => {
      // Setup clipboard permissions to allow copying the shared link
      await setupClipboardPermissions(page);
      // Copy link to file in context menu
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Copy shared link",
      );
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
      //Wait for page with pdf loaded
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
  test("Open shared link pdf form for Docspace users only", async ({
    page,
    browser,
  }) => {
    let shareLink: string;
    //Checking the link to the file will open the authorization page.
    await test.step("Upload PDF form from My Documents", async () => {
      await shortTour.clickSkipTour();
      await roomEmptyView.uploadPdfFromDocSpace();
      await selectPanel.checkSelectorExist();
      await selectPanel.select("documents");
      await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
      await selectPanel.confirmSelection();
      await shortTour.clickModalCloseButton().catch(() => {});
      await myRooms.infoPanel.close();
      await expect(page.getByLabel("ONLYOFFICE Resume Sample,")).toBeVisible();
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
      // Get the shared link from clipboard
      shareLink = await page.evaluate(() => navigator.clipboard.readText());
      if (!shareLink)
        throw new Error("Failed to get share link from clipboard");
    });
    await test.step("Open PDF form in incognito and check login button", async () => {
      const url = await page.evaluate(() => navigator.clipboard.readText());
      if (!url) throw new Error("Clipboard is empty");
      incognitoContext = await browser.newContext();
      incognitoPage = await incognitoContext.newPage();
      // Navigate to the shared link - should redirect to login page for unauthorized users
      await incognitoPage.goto(url, { waitUntil: "domcontentloaded" });
      const incognitoLogin = new Login(incognitoPage, "docspace");
      // Verify login button is visible on the authorization page
      await incognitoLogin.loginButtonVisible();
    });
  });
  //Checking the link to the Room will open the authorization page.
  test("Open shared link Room for Docspace users only", async ({
    page,
    browser,
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
      await expect(page.getByLabel("ONLYOFFICE Resume Sample,")).toBeVisible();
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
    await test.step("Open PDF form in incognito and check login button", async () => {
      // Get the shared link from clipboard
      const url = await page.evaluate(() => navigator.clipboard.readText());
      if (!url) throw new Error("Clipboard is empty");
      incognitoContext = await browser.newContext();
      incognitoPage = await incognitoContext.newPage();
      // Navigate to the shared link in incognito mode
      await incognitoPage.goto(url, { waitUntil: "domcontentloaded" });
      // Verify login button is visible
      const incognitoLogin = new Login(incognitoPage, "docspace");
      await incognitoLogin.loginButtonVisible();
    });
  });
  //Checking the link to the Room will open with file and Sing In button
  test("Open shared link Room for Anyone with link", async ({
    page,
    browser,
  }) => {
    let shareLink: string;
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
      incognitoContext = await browser.newContext();
      incognitoPage = await incognitoContext.newPage();
      //Open room in incognito by link
      await incognitoPage.goto(url, { waitUntil: "domcontentloaded" });
      //Verify Sign In button is visible
      await roomAnonymousView.singInButtonVisible();
    });
    await test.step("Validate pdf form is visible", async () => {
      await expect(
        incognitoPage!.getByLabel("ONLYOFFICE Resume Sample,"),
      ).toBeVisible();
    });
    await test.step("Validate that Complete and In progress folders do not exist ", async () => {
      const incognitoMyRooms = new MyRooms(incognitoPage!, "docspace");
      // Verify the "Complete" folder is not visible
      await incognitoMyRooms.verifyCompleteFolderNotVisible();
      // Verify the "In progress" folder is not visible
      await incognitoMyRooms.verifyInProgressFolderNotVisible();
    });
  });
});

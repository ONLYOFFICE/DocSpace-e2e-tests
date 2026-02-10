import { test } from "@/src/fixtures";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import fs from "fs";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomPDFCompleted from "@/src/objects/rooms/RoomPDFCompleted";
import InfoPanel from "@/src/objects/common/InfoPanel";
import path from "path";
import { Browser, BrowserContext, Page } from "@playwright/test";
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
import FilesNavigation from "@/src/objects/files/FilesNavigation";
import BaseToast from "@/src/objects/common/BaseToast";
import BaseEditLink from "@/src/objects/common/BaseLinkSettings";

function ensureIncognitoPage(
  incognitoPage: Page | null,
): asserts incognitoPage is Page {
  if (!incognitoPage) {
    throw new Error("incognitoPage is not initialized");
  }
}

// Sets up clipboard permissions for Firefox/Chrome
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

// Creates incognito context and page
async function setupIncognitoContext(
  browser: Browser,
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  return { context, page };
}

// Safely closes incognito context and page
async function cleanupIncognitoContext(
  context: BrowserContext | null,
  page: Page | null,
) {
  if (page) {
    await page.close().catch(() => {});
  }
  if (context) {
    await context.close().catch(() => {});
  }
}

// Gets link from clipboard
async function getLinkFromClipboard(page: Page): Promise<string> {
  const link = await page.evaluate(() => navigator.clipboard.readText());
  if (!link) throw new Error("Failed to get link from clipboard");
  return link;
}

// Opens link in incognito and checks Login button visibility
async function verifyLoginPageInIncognito(
  browser: Browser,
  link: string,
): Promise<void> {
  const { context, page } = await setupIncognitoContext(browser);
  await page.goto(link, { waitUntil: "domcontentloaded" });
  const incognitoLogin = new Login(page, "");
  await incognitoLogin.loginButtonVisible();
  await cleanupIncognitoContext(context, page);
}

// For anonymous page (Sign In button) - returns context and page for further use
async function verifyAnonymousPageInIncognito(
  browser: Browser,
  link: string,
): Promise<{ context: BrowserContext; page: Page }> {
  const { context, page } = await setupIncognitoContext(browser);
  await page.goto(link, { waitUntil: "domcontentloaded" });
  const roomAnonymousView = new RoomAnonymousView(page);
  await roomAnonymousView.singInButtonVisible();
  return { context, page };
}

// Opens link in incognito and checks "Invalid link" message
async function verifyInvalidLinkMessageInIncognito(
  browser: Browser,
  link: string,
  expectedText = "Invalid link",
): Promise<void> {
  const { context, page } = await setupIncognitoContext(browser);
  await page.goto(link, { waitUntil: "domcontentloaded" });
  await expect(page.getByText(expectedText)).toBeVisible();
  await cleanupIncognitoContext(context, page);
}
// Opens file link in incognito and checks "Access denied" in iframe
async function verifyAccessDeniedInIncognito(
  browser: Browser,
  link: string,
): Promise<void> {
  const { context, page } = await setupIncognitoContext(browser);
  await page.goto(link, { waitUntil: "domcontentloaded" });
  const iframeLocator = page.locator('iframe[name="frameEditor"]');
  await iframeLocator.waitFor({ state: "visible" });
  const frame = iframeLocator.contentFrame();
  await expect(frame.getByText("Access denied Click to close")).toBeVisible();
  await cleanupIncognitoContext(context, page);
}

// Copies shared link for a file using context menu
async function copyFileLink(
  page: Page,
  filesTable: FilesTable,
  myRooms: MyRooms,
): Promise<string> {
  await setupClipboardPermissions(page);
  await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
  await filesTable.contextMenu.clickSubmenuOption("Share", "Copy shared link");
  await myRooms.toast.dismissToastSafely("Link copied to clipboard", 5000);
  return await getLinkFromClipboard(page);
}

// Uploads PDF and verifies it's visible
async function uploadAndVerifyPDF(
  shortTour: ShortTour,
  roomEmptyView: RoomEmptyView,
  selectPanel: RoomSelectPanel,
  myRooms: MyRooms,
  page: Page,
  skipTour = true,
): Promise<void> {
  if (skipTour) {
    await shortTour.clickSkipTour();
  }
  await roomEmptyView.uploadPdfFromDocSpace();
  await selectPanel.checkSelectorExist();
  await selectPanel.select("documents");
  await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
  await selectPanel.confirmSelection();
  await shortTour.clickModalCloseButton().catch(() => {});
  await myRooms.infoPanel.close();
  await expect(page.getByLabel("ONLYOFFICE Resume Sample,")).toBeVisible();
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
    await cleanupIncognitoContext(incognitoContext, incognitoPage);
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
        process.cwd(),
        "data/rooms/PDF from device.pdf",
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
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
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
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
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
      await shortTour.clickSkipTour();
      await roomEmptyView.uploadPdfFromDocSpace();
      await selectPanel.checkSelectorExist();
      await selectPanel.select("documents");
      await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
      await selectPanel.confirmSelection();
      await shortTour.clickModalCloseButton().catch(() => {});
      await myRooms.infoPanel.close();
      await expect(page.getByLabel("ONLYOFFICE Resume Sample,")).toBeVisible();

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

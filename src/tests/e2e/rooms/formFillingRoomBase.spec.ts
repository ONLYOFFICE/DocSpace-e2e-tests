import { test } from "@/src/fixtures";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import fs from "fs";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomPDFCompleted from "@/src/objects/rooms/RoomPDFCompleted";
import InfoPanel from "@/src/objects/common/InfoPanel";
import path from "path";
import { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import FilesTable from "@/src/objects/files/FilesTable";
import RoomEmptyView from "@/src/objects/rooms/RoomEmptyView";
import { formFillingRoomContextMenuOption } from "@/src/utils/constants/rooms";
import {
  formFillingRoomPdfContextMenuOption,
  spreadsheetContextMenuOption,
  pdfFormMoreOptionsSubmenu,
} from "@/src/utils/constants/files";
import FileVersionHistory from "@/src/objects/files/FileVersionHistory";
import PauseSubmissionsDialog from "@/src/objects/files/PauseSubmissionsDialog";
import StopFillingModal from "@/src/objects/files/StopFillingModal";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import Login from "@/src/objects/common/Login";
import { uploadAndVerifyPDF } from "@/src/utils/helpers/formFillingRoom";
import TemplateGallery from "@/src/objects/rooms/TemplateGallery";
import BaseFloatingProgress from "@/src/objects/common/BaseFloatingProgress";

test.describe("FormFilling base tests", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let newPage: Page;
  let roomEmptyView: RoomEmptyView;
  let filesTable: FilesTable;
  let selectPanel: RoomSelectPanel;
  let roomInfoPanel: RoomInfoPanel;
  let roomsInviteDialog: RoomsInviteDialog;
  let login: Login;

  test.beforeEach(async ({ page, api }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    roomEmptyView = new RoomEmptyView(page);
    filesTable = new FilesTable(page);
    selectPanel = new RoomSelectPanel(page);
    roomInfoPanel = new RoomInfoPanel(page);
    roomsInviteDialog = new RoomsInviteDialog(page);
    login = new Login(page, api.portalDomain);
    await login.loginToPortal();
    await myRooms.createFormFillingRoom("FormFillingRoom");
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
    // TODO: Bug 80619 - PDF upload from DocSpace behaves differently than upload from device; re-enable once fixed
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
      await myRooms.infoPanel.close();
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

    await test.step("Start filling the form", async () => {
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Start filling");
      await shortTour.clickModalCloseButton();
    });

    // Submit Form
    await test.step("SubmitPDFFormWithEmptyFields", async () => {
      const context = page.context();
      const pagePromise = context.waitForEvent("page", { timeout: 30000 });
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
      const xlsxPage = await newPage.waitForEvent("popup", { timeout: 30000 });
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
    await test.step("Start filling the form", async () => {
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Start filling");
      await shortTour.clickModalCloseButton();
    });
    await test.step("Open and close pdf form", async () => {
      const context = page.context();
      const pagePromise = context.waitForEvent("page", { timeout: 30000 });
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

  test("Verify download and print buttons visible in PDF form", async ({
    page,
  }) => {
    let newPage: Page;

    await test.step("Upload PDF form", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
    });
    await test.step("Start filling the form", async () => {
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Start filling");
      await shortTour.clickModalCloseButton();
    });

    await test.step("Open PDF form for filling", async () => {
      const context = page.context();
      const pagePromise = context.waitForEvent("page", { timeout: 30000 });
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Fill");
      newPage = await pagePromise;
      await newPage.waitForLoadState("load");
    });

    await test.step("Open menu and verify download and print buttons are visible", async () => {
      const pdfForm = new FilesPdfForm(newPage);
      await pdfForm.checkSubmitButtonExist();
      await pdfForm.openMenu();
      await pdfForm.verifyDownloadAndPrintButtonsVisible();
    });
  });

  test("Add PDF template from Template Gallery", async ({ page }) => {
    const templateTitle = "30-day eviction notice form";

    await test.step("Skip tour and close info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.close();
    });

    await test.step("Open Template Gallery from plus menu", async () => {
      await myRooms.filesNavigation.openCreateDropdown();
      await myRooms.filesNavigation.contextMenu.openTemplateGallery();
    });

    let editorPage: Page;

    await test.step("Select template and create PDF form", async () => {
      const templateGallery = new TemplateGallery(page);
      await templateGallery.selectTemplate(templateTitle);
      await templateGallery.verifyNewPdfFormModalVisible();

      const context = page.context();
      const pagePromise = context.waitForEvent("page", { timeout: 30000 });
      await templateGallery.clickCreate();
      editorPage = await pagePromise;
      await editorPage.waitForLoadState("load");
    });

    await test.step("Verify PDF form opened for editing, then start filling", async () => {
      const pdfForm = new FilesPdfForm(editorPage);
      await pdfForm.checkEditorMode();
      await pdfForm.clickStartFillButton();
      const shortTour = new ShortTour(editorPage);
      await shortTour.clickModalCloseButton();
      await editorPage.close();
    });

    await test.step("Verify room contains folders and PDF file with filling icon", async () => {
      await expect(page.getByLabel("Complete")).toBeVisible();
      await expect(page.getByLabel("In process")).toBeVisible();
      await expect(
        page.getByLabel(templateTitle, { exact: false }),
      ).toBeVisible();
      await myRooms.filesTable.expectFillingIconVisible(templateTitle);
    });
  });

  // Verifies that uploading a simple PDF (not an ONLYOFFICE form) shows a warning message
  test("Upload simple PDF from device shows warning", async ({ page }) => {
    await test.step("Skip tour and close info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.close();
    });

    await test.step("Upload simple PDF from device", async () => {
      const pdfPath = path.resolve(process.cwd(), "data/rooms/PDF simple.pdf");
      await roomEmptyView.uploadPdfForm(pdfPath);
    });

    await test.step("Verify warning toast message", async () => {
      await myRooms.toast.checkToastMessage(
        "The file cannot be uploaded to this room. Please try to upload the ONLYOFFICE PDF form.",
      );
    });

    await test.step("Verify floating progress button shows error", async () => {
      const floatingProgress = new BaseFloatingProgress(page);
      await floatingProgress.waitForButton();
      await floatingProgress.openErrorPanel();
      await floatingProgress.verifyFileNameVisible("PDF simple");
      await floatingProgress.verifyErrorTooltipVisible();
    });

    await test.step("Verify file is not in the room", async () => {
      await expect(page.getByLabel("PDF simple,")).not.toBeVisible();
    });
  });

  test("Editing a filling form triggers stop-filling confirmation and opens editor", async ({
    page,
  }) => {
    let editorPage: Page;

    await test.step("Upload PDF form", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
    });

    await test.step("Start filling the form", async () => {
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Start filling");
      await shortTour.clickModalCloseButton();
    });

    await test.step("Open Edit in context menu - pause submissions dialog appears", async () => {
      const pauseDialog = new PauseSubmissionsDialog(page);
      const pagePromise = page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.edit,
      );
      await pauseDialog.clickEdit();
      editorPage = await pagePromise;
      await editorPage.waitForLoadState("load");
    });

    await test.step("Verify form opened in edit mode, not fill mode", async () => {
      const pdfForm = new FilesPdfForm(editorPage);
      await pdfForm.checkEditorMode();
      await pdfForm.checkStartFillButtonVisible();
    });

    await test.step("Close editor and verify filling icon is not visible", async () => {
      await editorPage.close();
      await page.bringToFront();
      await myRooms.filesTable.expectFillingIconNotVisible(
        "ONLYOFFICE Resume Sample",
      );
    });
  });

  test("Re-submitting after editing a filling form creates a new version of the results table", async ({
    page,
  }) => {
    let fillPage: Page;

    await test.step("Upload PDF form and start filling", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Start filling");
      await shortTour.clickModalCloseButton();
    });

    await test.step("Submit the form (first submission)", async () => {
      const pagePromise = page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Fill");
      fillPage = await pagePromise;
      await fillPage.waitForLoadState("load");
      const pdfForm = new FilesPdfForm(fillPage);
      const completed = await pdfForm.clickSubmitButton();
      await completed.chooseBackToRoom();
    });

    await test.step("Edit form - stop filling via PauseSubmissionsDialog, then re-start filling from editor", async () => {
      const pauseDialog = new PauseSubmissionsDialog(page);
      const editorPagePromise = page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.edit,
      );
      await pauseDialog.clickEdit();
      const editorPage = await editorPagePromise;
      await editorPage.waitForLoadState("load");

      const pdfForm = new FilesPdfForm(editorPage);
      await pdfForm.checkEditorMode();
      await pdfForm.clickStartFillButton();
      // Editor saves and navigates back to room; wait for the "copy public link" modal
      const startFillModal = new ShortTour(editorPage);
      await startFillModal.clickModalCloseButton();
      await editorPage.close();
      await page.bringToFront();
      await myRooms.filesTable.expectFillingIconVisible(
        "ONLYOFFICE Resume Sample",
      );
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickSubmenuOption(
        formFillingRoomPdfContextMenuOption.moreOptions,
        pdfFormMoreOptionsSubmenu.showVersionHistory,
      );
      const pdfVersionHistory = new FileVersionHistory(page);
      await pdfVersionHistory.checkVersionsVisible();
      const pdfVersionCount = await pdfVersionHistory.getVersionCount();
      expect(pdfVersionCount).toBeGreaterThanOrEqual(2);
      await pdfVersionHistory.close();
    });

    await test.step("Submit the form again (first submission of new filling round)", async () => {
      const pagePromise = page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Fill");
      fillPage = await pagePromise;
      await fillPage.waitForLoadState("load");
      const pdfForm = new FilesPdfForm(fillPage);
      const completed = await pdfForm.clickSubmitButton();
      await completed.chooseBackToRoom();
    });

    await test.step("Verify new version of results table was created in Complete folder", async () => {
      const localTable = new FilesTable(fillPage);
      await localTable.openContextMenuForItem("Complete");
      await localTable.contextMenu.clickOption("Open");
      await expect(
        fillPage.getByRole("heading", { name: "Complete" }),
      ).toBeVisible();
      await localTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await localTable.contextMenu.clickOption("Open");
      await localTable.openContextMenuRow(
        fillPage.locator('[aria-label="ONLYOFFICE Resume Sample,"]'),
      );
      await localTable.contextMenu.clickSubmenuOption(
        spreadsheetContextMenuOption.moreOptions,
        pdfFormMoreOptionsSubmenu.showVersionHistory,
      );
      const versionHistory = new FileVersionHistory(fillPage);
      await versionHistory.checkVersionsVisible();
      const versionCount = await versionHistory.getVersionCount();

      expect(versionCount).toBeGreaterThanOrEqual(2);
    });
  });

  test("Starting filling via PDF editor triggers filling", async ({ page }) => {
    let editorPage: Page;

    await test.step("Upload PDF form", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
    });

    await test.step("Open form in editor via Edit context menu", async () => {
      const pagePromise = page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.edit,
      );
      editorPage = await pagePromise;
      await editorPage.waitForLoadState("load");
    });

    await test.step("Click Start Fill button in editor", async () => {
      const pdfForm = new FilesPdfForm(editorPage);
      await pdfForm.checkEditorMode();
      await pdfForm.clickStartFillButton();
    });

    await test.step("Close editor and verify filling icon is visible", async () => {
      await editorPage.close();
      await page.bringToFront();
      await myRooms.filesTable.expectFillingIconVisible(
        "ONLYOFFICE Resume Sample",
      );
    });
  });

  test("Cancelling Stop Filling dialog keeps form in filling mode", async ({
    page,
  }) => {
    await test.step("Upload PDF form and start filling", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      await shortTour.clickModalCloseButton();
    });

    await test.step("Verify filling icon is visible after starting", async () => {
      await filesTable.expectFillingIconVisible("ONLYOFFICE Resume Sample");
    });

    await test.step("Open Stop Filling dialog and click Cancel", async () => {
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.stopFilling,
      );
      const stopFillingModal = new StopFillingModal(page);
      await stopFillingModal.clickCancel();
    });

    await test.step("Verify form is still in filling mode after cancel", async () => {
      await filesTable.expectFillingIconVisible("ONLYOFFICE Resume Sample");
    });
  });

  test("In Progress folder appears with draft file after opening form and closing without submitting", async ({
    page,
  }) => {
    let formPage: Page;

    await test.step("Upload PDF form and start filling", async () => {
      await uploadAndVerifyPDF(
        shortTour,
        roomEmptyView,
        selectPanel,
        myRooms,
        page,
      );
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      await shortTour.clickModalCloseButton();
    });

    await test.step("Verify draft label is not visible before opening form", async () => {
      await myRooms.verifyDraftLabelNotVisible();
    });

    await test.step("Open form and close without submitting", async () => {
      const pagePromise = page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.fill,
      );
      formPage = await pagePromise;
      await formPage.waitForLoadState("load");
      const pdfForm = new FilesPdfForm(formPage);
      await pdfForm.clickCloseButton();
    });

    await test.step("Verify draft label appears on the file after closing without submitting", async () => {
      await page.bringToFront();
      await page.reload({ waitUntil: "load" });
      await myRooms.verifyDraftLabelVisible();
    });

    await test.step("Open In Process folder and verify draft file is present", async () => {
      await filesTable.openContextMenuForItem("In process");
      await filesTable.contextMenu.clickOption("Open");
      await expect(
        page.getByText("ONLYOFFICE Resume Sample", { exact: true }),
      ).toBeVisible();
    });
  });
});

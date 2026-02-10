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
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import Login from "@/src/objects/common/Login";
import { uploadAndVerifyPDF } from "./formFillingRoomHelpers";

test.describe("FormFilling base tests", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let newPage: Page;
  let roomEmptyView: RoomEmptyView;
  let filesTable: FilesTable;
  let selectPanel: RoomSelectPanel;
  let infoPanel: InfoPanel;
  let roomInfoPanel: RoomInfoPanel;
  let roomsInviteDialog: RoomsInviteDialog;
  let login: Login;

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
});

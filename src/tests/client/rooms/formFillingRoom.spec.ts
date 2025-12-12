import { test } from "@/src/fixtures";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import fs from 'fs';
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomPDFCompleted from "@/src/objects/rooms/RoomPDFCompleted";
import InfoPanel from "@/src/objects/common/InfoPanel";
import path from 'path';
import { Page } from '@playwright/test';
import { expect } from "@playwright/test";
import FilesTable from "@/src/objects/files/FilesTable";
import RoomEmptyView from "@/src/objects/rooms/RoomEmptyView";
import {formFillingRoomContextMenuOption} from "@/src/utils/constants/rooms";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";

test.describe("FormFilling room tests", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let newPage: Page;
  let roomEmptyView: RoomEmptyView;
  let filesTable: FilesTable;
  let selectPanel: RoomSelectPanel;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    roomEmptyView = new RoomEmptyView(page);
    filesTable = new FilesTable(page);
    selectPanel = new RoomSelectPanel(page);
    await login.loginToPortal();
    await myRooms.createFormFillingRoom("FormFillingRoom");
  });

  test("Take A Tour", async ({page}) => {
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
      await myRooms.navigation.contextMenu.clickOption(formFillingRoomContextMenuOption.startTour);
      await shortTour.checkStep("welcome");
      await shortTour.clickSkipTour();
      //check the tour has closed and a empty page is visible
      await roomEmptyView.checkEmptyView();
    });
    await test.step("CheckCloseButtonTheTourModalWindow", async () => {
      await myRooms.navigation.openContextMenu();
      await myRooms.navigation.contextMenu.clickOption(formFillingRoomContextMenuOption.startTour);
      await shortTour.checkStep("welcome");
      await shortTour.clickModalCloseButton();
      //check the tour has closed and a empty page is visible
      await roomEmptyView.checkEmptyView();
    });
    await test.step("CheckTheBackButtonTheTourModalWindow", async () => {
      await myRooms.navigation.openContextMenu();
      await myRooms.navigation.contextMenu.clickOption(formFillingRoomContextMenuOption.startTour);
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
 test("Check All Buttons On Empty Page", async ({page}) => {
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
      const pdfPath = path.resolve(__dirname, '../../../../data/rooms/PDF from device.pdf');
      console.log('PDF Path:', pdfPath);
      console.log('Exists:', fs.existsSync(pdfPath));
      await roomEmptyView.uploadPdfForm(pdfPath);
      await shortTour.clickModalCloseButton();
      await myRooms.infoPanel.close();
      await myRooms.filesTable.hideModifiedColumn();
      await myRooms.filesTable.selectPdfFile();
      await expect(page.getByLabel('PDF from device,')).toBeVisible();
      await expect(page.getByLabel('In process')).toBeVisible();
      await expect(page.getByLabel('Complete')).toBeVisible();
    });
  });
  test("Submit Not Filling PDF Form", async ({ page }) => {
    await test.step("UploadPDFFormFromMyDocuments", async () => {
       await shortTour.clickSkipTour();
       await roomEmptyView.uploadPdfFromDocSpace();
       await selectPanel.checkSelectorExist(); 
       await selectPanel.select("documents");
       await selectPanel.selectItemByText('ONLYOFFICE Resume Sample');
       await selectPanel.confirmSelection();
       await shortTour.clickModalCloseButton().catch(() => {});
       await myRooms.infoPanel.close();
       await expect(page.getByLabel('ONLYOFFICE Resume Sample,')).toBeVisible();
    });

    // Submit Form
    await test.step("SubmitPDFFormWithEmptyFields", async () => {
      const context = page.context();
      const pagePromise = context.waitForEvent('page');
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Fill");
      // Wait for the new page to open
      newPage = await pagePromise;
      await newPage.waitForLoadState('load');
      const pdfForm = new FilesPdfForm(newPage);
      const pdfCompleted = new RoomPDFCompleted(newPage);
      await pdfForm.clickSubmitButton();
      await pdfCompleted.chooseBackToRoom();
      await expect(newPage.getByLabel('ONLYOFFICE Resume Sample,')).toBeVisible({ timeout: 10000 });
    });
    await test.step("CheckPDFFormAndXlsxInCompleteFolder", async () => {
      const filesTable = new FilesTable(newPage);
      await filesTable.openContextMenuForItem("Complete");    
      await filesTable.contextMenu.clickOption("Open");
      await expect(newPage.getByRole('heading', { name: 'Complete' })).toBeVisible();
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");    
      await filesTable.contextMenu.clickOption("Open");
      await expect(newPage.getByLabel(/1 - admin-zero admin-zero - ONLYOFFICE Resume Sample/)).toBeVisible();
      await expect(newPage.getByLabel('ONLYOFFICE Resume Sample,')).toBeVisible();
    });

    // Check File Size
    await test.step("CheckSizeOfXlsxFileNotEqualZero", async () => {
      const item = newPage.locator('[aria-label="ONLYOFFICE Resume Sample,"]');
      await expect(item).toBeVisible();
      const filesTable =  new FilesTable(newPage);
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
      const filesTable =  new FilesTable(newPage);
      await filesTable.openContextMenuRow(item);
      await filesTable.contextMenu.clickOption("Preview");
      const xlsxPage = await newPage.waitForEvent('popup');
      await xlsxPage.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {
      console.warn('networkidle did not happen in 60 seconds, continuing test');
      });
      
      const frameEditor = xlsxPage.frameLocator('iframe[name="frameEditor"]');
      const canvasOverlay = frameEditor.locator('#ws-canvas-graphic-overlay');
      await expect(frameEditor.locator('#box-doc-name')).toBeVisible({ timeout: 20000 });
      await expect(canvasOverlay).toBeVisible({ timeout: 30000 });
      await xlsxPage.close();
    });
  });
  
});
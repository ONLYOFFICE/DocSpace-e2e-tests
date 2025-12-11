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

test.describe("FormFilling room tests", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let pdfForm: FilesPdfForm;
  let completedForm: RoomPDFCompleted;


  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    pdfForm = new FilesPdfForm(page);
    completedForm = new RoomPDFCompleted(page);
    await login.loginToPortal();
    await myRooms.createFormFillingRoom("FormFillingRoom");
  });
  test("Check All Buttons On Empty Page", async ({page}) => {
    await test.step("ClickShareRoomOnEmptyRoomScreen", async () => {
      try {
      await shortTour.clickSkipTour();
    } catch (e) {
      console.log('Tour modal not found, continuing with the test');
    }
      await myRooms.infoPanel.close();
      await myRooms.roomEmptyView.shareRoomClick();
      await myRooms.toast.clickLinkInToast();
      await myRooms.infoPanel.checkInfoPanelExist();
      //check the form filling shared link exist in info panel
      await myRooms.infoPanel.checkFormFillingSharedLinkExist();
    });

    await test.step("ClickAddPDFFormFromMyDocuments", async () => {
      await myRooms.roomEmptyView.uploadPdfFromDocSpace();
      //check folders on Select Panel
      await myRooms.selectPanel.verifyAllFolderOptions();
      await myRooms.selectPanel.close();
    });

    await test.step("ClickUploadFormFromDevice", async () => {
      const pdfPath = path.resolve(__dirname, '../../../../data/rooms/PDF from device.pdf');
      console.log('PDF Path:', pdfPath);
      console.log('Exists:', fs.existsSync(pdfPath));
      await myRooms.roomEmptyView.uploadPdfForm(pdfPath);
      await shortTour.clickModalCloseButton();
      await myRooms.infoPanel.close();
      await myRooms.filesTable.hideModifiedColumn();
      await myRooms.filesTable.selectPdfFile();
      await expect(page.getByLabel('PDF from device,')).toBeVisible();
      await expect(page.getByLabel('In process')).toBeVisible();
      await expect(page.getByLabel('Complete')).toBeVisible();
    });
  });
  test("Submit Not Filling PDF Form", async ({page}) => {
    let page2: Page;
    let page3: Page;

    await test.step("UploadPDFFormFromMyDocuments", async () => {
      await shortTour.clickSkipTour();
      await myRooms.roomEmptyView.uploadPdfFromDocSpace();
      await myRooms.selectPanel.checkSelectorExist(); 
      await myRooms.selectPanel.select("documents");
      await myRooms.selectPanel.selectItemByText('ONLYOFFICE Resume Sample');
      await myRooms.selectPanel.confirmSelection();
      await shortTour.clickModalCloseButton();
      await myRooms.infoPanel.close();
      await expect(page.getByLabel('ONLYOFFICE Resume Sample,')).toBeVisible();
    });

    await test.step("SubmitPDFFormWithEmptyFields", async () => {
      const context = page.context();
      const page2Promise = context.waitForEvent('page');
      await myRooms.filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await myRooms.filesTable.contextMenu.clickOption("Fill");
      page2 = await page2Promise;
      await page2.waitForLoadState();
      pdfForm.setPdfPage(page2);
      completedForm.setPdfPage(page2);
      myRooms.setPage(page2);
      await pdfForm.clickSubmitButton();
      await completedForm.chooseBackToRoom();
      await expect(page2.getByLabel('ONLYOFFICE Resume Sample,')).toBeVisible({ timeout: 10000 });
    });

    await test.step("CheckPDFFormAndXlsxInCompleteFolder", async () => {
      await myRooms.gotoFolder("Complete");
      await expect(page2.getByRole('heading', { name: 'Complete' })).toBeVisible();
      await myRooms.gotoFolder("ONLYOFFICE Resume Sample");
      await expect(page2.getByLabel(/1 - admin-zero admin-zero - ONLYOFFICE Resume Sample/)).toBeVisible();
      await expect(page2.getByLabel('ONLYOFFICE Resume Sample,')).toBeVisible();
    });

    await test.step("CheckSizeOfXlsxFileNotEqualZero", async () => {
      const item = page2.locator('[aria-label="ONLYOFFICE Resume Sample,"]');
      await expect(item).toBeVisible();
      await myRooms.filesTable.openContextMenuRow(item);
      await myRooms.filesTable.contextMenu.clickOption("Select");
      const infoPanel = new InfoPanel(page2);
      await infoPanel.open();
      const sizeNum = await infoPanel.getSizeInBytes();
      await expect(sizeNum).toBeGreaterThan(0);
    });

    await test.step("OpenResultXlsxFile", async () => {
      const item = page2.locator('[aria-label="ONLYOFFICE Resume Sample,"]');
      await myRooms.filesTable.openContextMenuRow(item);
      await myRooms.filesTable.contextMenu.clickOption("Preview");
            page3 = await page2.waitForEvent('popup');
      // Wait up to 20000 ms because the XLSX editor inside the iframe opens slowly in Firefox
      await page3.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {
        console.warn('networkidle did not happen in 20 seconds, continue testing');
      });
      // Wait for the iframe XLSX to load
      const frameEditor = await page3.frameLocator('iframe[name="frameEditor"]');
      const canvasOverlay = frameEditor.locator('#ws-canvas-graphic-overlay');
      await expect(frameEditor.locator('#box-doc-name')).toBeVisible({ timeout: 20000 });
      await expect(canvasOverlay).toBeVisible({ timeout: 20000 });
    });
  });
});
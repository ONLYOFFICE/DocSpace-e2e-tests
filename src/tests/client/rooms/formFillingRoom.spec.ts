import { test } from "@/src/fixtures";
import Screenshot from "@/src/objects/common/Screenshot";
import {formFillingRoomContextMenuOption} from "@/src/utils/constants/rooms";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import fs from 'fs';
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomPDFCompleted from "@/src/objects/rooms/RoomPDFCompleted";
import InfoPanel from "@/src/objects/common/InfoPanel";
import path from 'path';
import { Page } from '@playwright/test';
import { expect } from "@playwright/test";

test.describe("Rooms", () => {
  let screenshot: Screenshot;
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let pdfForm: FilesPdfForm;
  let completedForm: RoomPDFCompleted;


  test.beforeEach(async ({ page, api, login }) => {
    screenshot = new Screenshot(page, { screenshotDir: "rooms" });
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    pdfForm = new FilesPdfForm(page);
    completedForm = new RoomPDFCompleted(page);
    await login.loginToPortal();
  });

  test("FormFillingRoom - Take A Tour", async ({page}) => {
    await test.step("TakeATourAfterCreatingFormFillingRoom", async () => {
      await myRooms.createFormFillingRoom("FormFillingRoom");
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
      await myRooms.roomEmptyView.checkEmptyView();
      await screenshot.expectHaveScreenshot("form_filling_room_after_completing_of_the_tour");
    });


    await test.step("CheckSkipButtonTheTourModalWindow", async () => {
      await myRooms.navigation.openContextMenu();
      await myRooms.navigation.contextMenu.clickOption(formFillingRoomContextMenuOption.startTour);
      await shortTour.checkStep("welcome");
      await shortTour.clickSkipTour();
      await screenshot.expectHaveScreenshot("form_filling_room_after_skip_tour");
    });

    await test.step("CheckCloseButtonTheTourModalWindow", async () => {
      await myRooms.navigation.openContextMenu();
      await myRooms.navigation.contextMenu.clickOption(formFillingRoomContextMenuOption.startTour);
      await shortTour.checkStep("welcome");
      await shortTour.clickModalCloseButton();
      await screenshot.expectHaveScreenshot("closing_the_tour_modal_window");
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
      await screenshot.expectHaveScreenshot("first_step_after_pressing_the_back_button");
      await myRooms.navigation.gotoBack();
    });
  });

  test("FormFillingRoom - Check All Buttons On Empty Page", async ({page}) => {
    await test.step("ClickShareRoomOnEmptyRoomScreen", async () => {
      await myRooms.createFormFillingRoom("FormFillingRoom");
      await shortTour.clickSkipTour();
     // await shortTour.skipWelcomeIfPresent();
      await myRooms.infoPanel.close();
      await myRooms.roomEmptyView.shareRoomClick();
      await myRooms.toast.clickLinkInToast();
      await myRooms.infoPanel.checkInfoPanelExist();
      await screenshot.expectHaveScreenshot("info_panel_after_clicking_on_share_room");
    });

    await test.step("ClickAddPDFFormFromMyDocuments", async () => {
      await myRooms.roomEmptyView.uploadPdfFromDocSpace();
      await myRooms.selectPanel.checkSelectorExist(); 
      await screenshot.expectHaveScreenshot("select_panel_opened");
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
    });
  });

  test("FormFillingRoom - Submit Not Filling PDF Form", async ({page}) => {
    let page2: Page;
    let page3: Page;
    
    await test.step("CreateFormFillingRoom", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.createFormFillingRoom("FormFillingRoom");
      await shortTour.clickSkipTour();
      //    await shortTour.waitAndCloseWelcomeModal();
      await myRooms.infoPanel.close();
      await screenshot.expectHaveScreenshot("form_filling_room_after_creating");
    });

    await test.step("UploadPDFFormFromMyDocuments", async () => {
      await myRooms.roomEmptyView.uploadPdfFromDocSpace();
      await myRooms.selectPanel.checkSelectorExist(); 
      await myRooms.selectPanel.select("documents");
      await myRooms.selectPanel.selectItemByText('ONLYOFFICE Resume Sample');
      await screenshot.expectHaveScreenshot("select_pdf_form_from_my_documents");
      await myRooms.selectPanel.confirmSelection();
      await shortTour.clickModalCloseButton();
      await myRooms.infoPanel.close();
      await myRooms.filesTable.hideModifiedColumn();
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
      await expect(page2.getByLabel('ONLYOFFICE Resume Sample,')).toBeVisible();
    });

    await test.step("CheckPDFFormAndXlsxInCompleteFolder", async () => {
      await myRooms.gotoFolder("Complete");
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

    await test.step("OpenXlsxFile", async () => {
      const item = page2.locator('[aria-label="ONLYOFFICE Resume Sample,"]');
      await myRooms.filesTable.openContextMenuRow(item);
      await myRooms.filesTable.contextMenu.clickOption("Preview");
            page3 = await page2.waitForEvent('popup');
      // Wait up to 20000 ms because the XLSX editor inside the iframe opens slowly in Firefox
      await page3.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {
        console.warn('networkidle did not happen in 20 seconds, continue testing');
      });
      const screenshot = new Screenshot(page3, { screenshotDir: "rooms" });
      // Wait for the iframe XLSX to load
      const frameEditor = await page3.frameLocator('iframe[name="frameEditor"]');
      const canvasOverlay = frameEditor.locator('#ws-canvas-graphic-overlay');
      await expect(frameEditor.locator('#box-doc-name')).toBeVisible({ timeout: 20000 });
      await expect(canvasOverlay).toBeVisible({ timeout: 20000 });
      await screenshot.expectHaveScreenshot("opened_xlsx_file");
    });
  });
});

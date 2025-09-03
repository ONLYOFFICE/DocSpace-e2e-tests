import { test, Page, expect } from "@playwright/test";
import API from "@/src/api";
import Login from "@/src/objects/common/Login";
import Screenshot from "@/src/objects/common/Screenshot";
import {formFillingRoomContextMenuOption, formFillingRoomDropdownActions} from "@/src/utils/constants/rooms";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import FormFillingRoom from "@/src/objects/rooms/RoomsFormFilling";
import MyRooms from "@/src/objects/rooms/Rooms";

import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomPDFCompleted from "@/src/objects/rooms/RoomPDFCompleted";
import { Profile } from "@/src/objects/profile/Profile";
import MyDocuments from "@/src/objects/files/MyDocuments";  
import InfoPanel from "@/src/objects/common/InfoPanel";
import path from 'path';
import fs from 'fs';

test.describe("Rooms", () => {
  let api: API;
  let page: Page;
  let login: Login;
  let screenshot: Screenshot;
  let formFillingRoom: FormFillingRoom;
  let shortTour: ShortTour;
  let myRooms: MyRooms;
  let myDocuments: MyDocuments;  
  let roomPDFCompleted: RoomPDFCompleted;
  let profile: Profile;
  let page2: Page;
  let page3: Page;

   test.beforeAll(async ({ playwright, browser }) => {
    const apiContext = await playwright.request.newContext();
    api = new API(apiContext);
    await api.setup();
    console.log(api.portalDomain);
    page = await browser.newPage();
    await page.addInitScript(() => {
      globalThis.localStorage?.setItem("integrationUITests", "true");
    });

    login = new Login(page, api.portalDomain);
    screenshot = new Screenshot(page, { screenshotDir: "rooms" });
    myRooms = new MyRooms(page, api.portalDomain);
    formFillingRoom = new FormFillingRoom(page);
    shortTour = new ShortTour(page);
    myDocuments = new MyDocuments(page, api.portalDomain);
    roomPDFCompleted = new RoomPDFCompleted(page);
    profile = new Profile(page);
    await login.loginToPortal();
  });

test("FormFillingRoom - Take A Tour", async () => {
    await test.step("TakeATourAfterCreatingFormFillingRoom", async () => {
      await myRooms.createFormFillingRoom();
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
      await formFillingRoom.infoPanel.close();
      await screenshot.expectHaveScreenshot("form_filling_room_after_completing_of_the_tour");
    });

    await test.step("CheckSkipButtonTheTourModalWindow", async () => {
    
      await formFillingRoom.navigation.openContextMenu();
      await formFillingRoom.navigation.contextMenu.clickOption(formFillingRoomContextMenuOption.startTour);
      await shortTour.checkStep("welcome");
      await shortTour.clickSkipTour();
      await screenshot.expectHaveScreenshot("form_filling_room_after_skip_tour");
    });

    await test.step("CheckCloseButtonTheTourModalWindow", async () => {
      await formFillingRoom.navigation.openContextMenu()
      await formFillingRoom.navigation.contextMenu.clickOption(formFillingRoomContextMenuOption.startTour);
      await shortTour.checkStep("welcome");
      await shortTour.clickModalCloseButton();
      await screenshot.expectHaveScreenshot("closing_the_tour_modal_window");
    });

    await test.step("CheckTheBackButtonTheTourModalWindow", async () => {
     await formFillingRoom.navigation.openContextMenu()
     await formFillingRoom.navigation.contextMenu.clickOption(formFillingRoomContextMenuOption.startTour);
     await shortTour.checkStep("welcome");
     await shortTour.clickStartTour();
     await shortTour.checkStep("firstStep");
     await shortTour.clickNextStep();
     await shortTour.checkStep("secondStep");
     await shortTour.clickBackStep();
     await shortTour.checkStep("firstStep");
     await shortTour.clickModalCloseButton();
     await screenshot.expectHaveScreenshot("first_step_after_pressing_the_back_button");
     await formFillingRoom.navigation.gotoBack();
  });
 });
test("FormFillingRoom - Check All Buttons On Empty Page", async () =>   {
    await test.step("ClickShareRoomOnEmptyRoomScreen", async () => {
      await myRooms.createFormFillingRoom();
      await shortTour.skipWelcomeIfPresent();
      await myRooms.infoPanel.close();
      await screenshot.expectHaveScreenshot("form_filling_room_empty_view");
      await formFillingRoom.roomEmptyView.shareRoomClick();
      await screenshot.expectHaveScreenshot("share_room_on_empty_room_screen");
    });
    await test.step("ClickAddPDFFormFromMyDocuments", async () => {
      await formFillingRoom.roomEmptyView.uploadPdfFromDocSpace();
      await formFillingRoom.selectPanel.checkSelectorExist(); 
      await screenshot.expectHaveScreenshot("select_panel_opened");
      await formFillingRoom.selectPanel.close();
      
    });
    await test.step("ClickUploadFormFromDevice", async () => {
      const pdfPath = path.resolve(__dirname, '../../../../data/rooms/PDF from device.pdf');
      console.log('PDF PATH:', pdfPath);
      console.log('Exists:', fs.existsSync(pdfPath));
      await formFillingRoom.roomEmptyView.uploadPdfForm(pdfPath);
      await shortTour.clickModalCloseButton();
      await formFillingRoom.infoPanel.close();
      await formFillingRoom.filesTable.hideModifiedColumn();
      await screenshot.expectHaveScreenshot("upload_form_from_device");
    });
  });
test("FormFillingRoom - Submit Not Filling PDF Form", async () => {
    await test.step("CreateFormFillingRoom", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.createFormFillingRoom();
      await shortTour.skipWelcomeIfPresent();
      await myRooms.infoPanel.close();
      await screenshot.expectHaveScreenshot("form_filling_room_empty_view");
    });
    await test.step("UploadPDFFormFromMyDocuments", async () => {
      await formFillingRoom.roomEmptyView.uploadPdfFromDocSpace();
      await formFillingRoom.selectPanel.checkSelectorExist(); 
      await formFillingRoom.selectPanel.select("documents");
      await formFillingRoom.selectPanel.selectItemByText('ONLYOFFICE Resume Sample');
      await screenshot.expectHaveScreenshot("select_pdf_form_from_my_documents");
      await formFillingRoom.selectPanel.confirmSelection();
      await shortTour.clickModalCloseButton();
      await myRooms.infoPanel.close();
      await formFillingRoom.filesTable.hideModifiedColumn();
      await screenshot.expectHaveScreenshot("selected_pdf_form_added_to_room");
    });
    await test.step("SubmitPDFFormWithEmptyFields", async () => {
      const pdfForm = new FilesPdfForm(page);
      const completedForm = new RoomPDFCompleted(page);
      await formFillingRoom.filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await formFillingRoom.filesTable.contextMenu.clickOption("Fill");
      page2 = await page.waitForEvent('popup');
      pdfForm.setPdfPage(page2);
      completedForm.setPdfPage(page2);
      formFillingRoom.setPage(page2);
      await pdfForm.clickSubmitButton();
      await completedForm.chooseBackToRoom();
      await page2.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {
        console.warn('networkidle did not happen in 2 seconds, continue testing');
      });
      await page2.reload();
    });  
    await test.step("CheckPDFFormAndXlsxInCompleteFolder", async () => {
      await formFillingRoom.gotoFolder("Complete");
      await page.waitForTimeout(2000);
      await formFillingRoom.gotoFolder("ONLYOFFICE Resume Sample");
      await expect(page2.getByLabel('ONLYOFFICE Resume Sample,')).toBeVisible();
      await expect(page2.getByLabel('1 - admin-zero admin-zero - ONLYOFFICE Resume Sample')).toBeVisible();

    });  
    await test.step("CheckSizeOfXlsxFileNotEqualZero", async () => {
      const item = page2.locator('[aria-label="ONLYOFFICE Resume Sample,"]');
      await expect(item).toBeVisible();
      await formFillingRoom.filesTable.openContextMenuRow(item);
      await formFillingRoom.filesTable.contextMenu.clickOption("Select");
      const infoPanel = new InfoPanel(page2);
      await infoPanel.open();
      const sizeNum = await infoPanel.getSizeInBytes();
      await expect(sizeNum).toBeGreaterThan(0);
    });
  
    await test.step("OpenXlsxFile", async () => {
      const item = page2.locator('[aria-label="ONLYOFFICE Resume Sample,"]');
      await formFillingRoom.filesTable.openContextMenuRow(item);
      await formFillingRoom.filesTable.contextMenu.clickOption("Preview");
      page3 = await page2.waitForEvent('popup');
      await page3.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        console.warn('networkidle did not happen in 10 seconds, continue testing');
      });
      const screenshot = new Screenshot(page3, { screenshotDir: "rooms" });
      await screenshot.expectHaveScreenshot("opened_xlsx_file");
    });
  });

test.afterAll(async ({ browser }) => {
  await api.cleanup();
  await browser.close();
});
});

import { test, Page, expect } from "@playwright/test";
import API from "@/src/api";
import Login from "@/src/objects/common/Login";
import Screenshot from "@/src/objects/common/Screenshot";
import {formFillingRoomContextMenuOption} from "@/src/utils/constants/rooms";

import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import FormFillingRoom from "@/src/objects/rooms/RoomsFormFilling";
import MyRooms from "@/src/objects/rooms/Rooms";


test.describe("Rooms", () => {
  let api: API;
  let page: Page;
  let login: Login;
  let screenshot: Screenshot;
  let formFillingRoom: FormFillingRoom;
  let shortTour: ShortTour;
  let myRooms: MyRooms;
  
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
    await login.loginToPortal();
  });

//   test("TakeATourInFormFillingRoom", async () => {
//     await test.step("CreateFormFillingRoomAndTakeATour", async () => {
//       await myRooms.createFormFillingRoom();
//       await shortTour.checkStep("welcome");
//       await shortTour.clickStartTour();
//       await shortTour.checkStep("firstStep");
//       await shortTour.clickNextStep();
//       await shortTour.checkStep("secondStep");
//       await shortTour.clickNextStep();
//       await shortTour.checkStep("thirdStep");
//       await shortTour.clickNextStep();
//       await shortTour.checkStep("fourthStep");
//       await shortTour.clickNextStep();
//       await shortTour.checkStep("fifthStep");
//       await shortTour.clickNextStep();
//       await screenshot.expectHaveScreenshot("form_filling_room_after_completing_of_the_tour");
//     });

//     await test.step("CheckSkipButtonTheTourModalWindow", async () => {
    
//       await formFillingRoom.navigation.openContextMenu();
//       await formFillingRoom.navigation.contextMenu.clickOption(formFillingRoomContextMenuOption.startTour);
//       await shortTour.checkStep("welcome");
//       await shortTour.clickSkipTour();
//       await screenshot.expectHaveScreenshot("form_filling_room_after_skip_tour");
//     });

//     await test.step("CheckCloseButtonTheTourModalWindow", async () => {
//       await formFillingRoom.navigation.openContextMenu()
//       await formFillingRoom.navigation.contextMenu.clickOption(formFillingRoomContextMenuOption.startTour);
//       await shortTour.checkStep("welcome");
//       await shortTour.clickModalCloseButton();
//       await screenshot.expectHaveScreenshot("closing_the_tour_modal_window");
//     });

//     await test.step("CheckTheBackButtonTheTourModalWindow", async () => {
//      await formFillingRoom.navigation.openContextMenu()
//      await formFillingRoom.navigation.contextMenu.clickOption(formFillingRoomContextMenuOption.startTour);
//      await shortTour.checkStep("welcome");
//      await shortTour.clickStartTour();
//      await shortTour.checkStep("firstStep");
//      await shortTour.clickNextStep();
//      await shortTour.checkStep("secondStep");
//      await shortTour.clickBackStep();
//      await shortTour.checkStep("firstStep");
//      await shortTour.clickModalCloseButton();
//      await screenshot.expectHaveScreenshot("first_step_after_pressing_the_back_button");
//      await formFillingRoom.navigation.gotoBack();
//   });
//  });
  test("FormFillingRoomTests", async () =>   {
    await test.step("ClickShareRoomOnEmptyRoomScreen", async () => {
      await myRooms.createFormFillingRoom();
      await shortTour.skipWelcomeIfPresent();
      await screenshot.expectHaveScreenshot("form_filling_room_empty_view");
      await formFillingRoom.roomEmptyView.shareRoomClick();
      await screenshot.expectHaveScreenshot("share_room_on_empty_room_screen");
    });
    await test.step("AddPDFFormFromMyDocuments", async () => {
      await formFillingRoom.roomEmptyView.uploadPdfFromDocSpace();
      await formFillingRoom.selectPanel.checkSelectorExist(); 
      await formFillingRoom.selectPanel.select("documents");
      await formFillingRoom.selectPanel.selectItemByText('ONLYOFFICE Resume Sample');
      await screenshot.expectHaveScreenshot("select_pdf_form_from_my_documents");
      await formFillingRoom.selectPanel.confirmSelection();
      await shortTour.clickModalCloseButton();
      await myRooms.infoPanel.close();
      await formFillingRoom.hideModifiedColumn();
      await screenshot.expectHaveScreenshot("pdf_form_added_to_form_filling_room");
   });
   await test.step("OpenPDFFormToFill", async () => {
    await page.pause();
    await formFillingRoom.openAndClosePdfForm("ONLYOFFICE Resume Sample");
    await screenshot.expectHaveScreenshot("mark_pdf_form_as_draft");
    // await formFillingRoom.filesTable.openPdfContextMenu();
    // await formFillingRoom.filesTable.contextMenu.clickOption("Fill");
    // await screenshot.expectHaveScreenshot("open_pdf_form_to_fill");

 });
});
  test.afterAll(async () => {
      await api.cleanup();
      await page.close();
  });
});

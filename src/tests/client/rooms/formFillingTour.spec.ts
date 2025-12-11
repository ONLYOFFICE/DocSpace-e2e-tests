import { test } from "@/src/fixtures";
import {formFillingRoomContextMenuOption} from "@/src/utils/constants/rooms";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomPDFCompleted from "@/src/objects/rooms/RoomPDFCompleted";

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
  });

  test("Take A Tour", async ({page}) => {
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
      ////check the tour has closed and a empty page is visible
      await myRooms.roomEmptyView.checkEmptyView();
    });

    await test.step("CheckSkipButtonTheTourModalWindow", async () => {
      await myRooms.navigation.openContextMenu();
      await myRooms.navigation.contextMenu.clickOption(formFillingRoomContextMenuOption.startTour);
      await shortTour.checkStep("welcome");
      await shortTour.clickSkipTour();
      //check the tour has closed and a empty page is visible
      await myRooms.roomEmptyView.checkEmptyView();
    });

    await test.step("CheckCloseButtonTheTourModalWindow", async () => {
      await myRooms.navigation.openContextMenu();
      await myRooms.navigation.contextMenu.clickOption(formFillingRoomContextMenuOption.startTour);
      await shortTour.checkStep("welcome");
      await shortTour.clickModalCloseButton();
      //check the tour has closed and a empty page is visible
      await myRooms.roomEmptyView.checkEmptyView();
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
      await myRooms.roomEmptyView.checkEmptyView();
    });
  });

});
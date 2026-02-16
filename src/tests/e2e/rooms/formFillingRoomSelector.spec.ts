import { test } from "@/src/fixtures";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import { expect } from "@playwright/test";
import RoomEmptyView from "@/src/objects/rooms/RoomEmptyView";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import Login from "@/src/objects/common/Login";

test.describe("FormFilling room file selector tests", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let roomEmptyView: RoomEmptyView;
  let selectPanel: RoomSelectPanel;
  let login: Login;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    roomEmptyView = new RoomEmptyView(page);
    selectPanel = new RoomSelectPanel(page);
    login = new Login(page, api.portalDomain);
    await login.loginToPortal();

    await apiSdk.rooms.createRoom("owner", {
      title: "FormFillingRoom",
      roomType: "FillingFormsRoom",
    });
  });

  // Verifies that a simple PDF uploaded to My Documents is not available for selection in the room
  test("Simple PDF in My Documents is not available for room upload", async ({
    apiSdk,
  }) => {
    await test.step("Upload simple PDF to My Documents via API", async () => {
      await apiSdk.files.uploadToMyDocuments(
        "owner",
        "data/rooms/PDF simple.pdf",
      );
    });

    await test.step("Open FormFilling room", async () => {
      await myRooms.openRoom("FormFillingRoom");
    });

    await test.step("Skip tour and close info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.close();
    });

    await test.step("Open Add PDF form from DocSpace selector", async () => {
      await roomEmptyView.uploadPdfFromDocSpace();
      await selectPanel.checkSelectorExist();
    });

    await test.step("Navigate to My Documents and verify PDF simple is not available", async () => {
      await selectPanel.select("documents");
      await expect(
        selectPanel.selector.getByText("PDF simple"),
      ).not.toBeVisible();
    });
  });

  // Verifies that a PDF form marked as Favorite via API is available in the Favorite section of the room selector
  test("Favorite PDF form is available in room selector", async ({
    apiSdk,
  }) => {
    await test.step("Upload PDF form to My Documents via API", async () => {
      await apiSdk.files.uploadToMyDocuments(
        "owner",
        "data/rooms/PDF from device.pdf",
      );
    });

    let fileId: number;

    await test.step("Get file ID and mark as Favorite via API", async () => {
      fileId = await apiSdk.files.getFileIdByTitle("owner", "PDF from device");
      await apiSdk.files.addToFavorites("owner", [fileId]);
    });

    await test.step("Open FormFilling room", async () => {
      await myRooms.openRoom("FormFillingRoom");
    });

    await test.step("Skip tour and close info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.close();
    });

    await test.step("Open Add PDF form from DocSpace selector", async () => {
      await roomEmptyView.uploadPdfFromDocSpace();
      await selectPanel.checkSelectorExist();
    });

    await test.step("Navigate to Favorite and verify PDF form is available", async () => {
      await selectPanel.select("favorite");
      await expect(
        selectPanel.selector.getByText("PDF from device"),
      ).toBeVisible();
    });
  });

  // Verifies that a PDF form added to Recent via API is available in the Recent section of the room selector
  test("Recent PDF form is available in room selector", async ({ apiSdk }) => {
    await test.step("Upload PDF form to My Documents via API", async () => {
      await apiSdk.files.uploadToMyDocuments(
        "owner",
        "data/rooms/PDF from device.pdf",
      );
    });

    let fileId: number;

    await test.step("Get file ID and add to Recent via API", async () => {
      fileId = await apiSdk.files.getFileIdByTitle("owner", "PDF from device");
      await apiSdk.files.addToRecent("owner", fileId);
    });

    await test.step("Open FormFilling room", async () => {
      await myRooms.openRoom("FormFillingRoom");
    });

    await test.step("Skip tour and close info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.close();
    });

    await test.step("Open Add PDF form from DocSpace selector", async () => {
      await roomEmptyView.uploadPdfFromDocSpace();
      await selectPanel.checkSelectorExist();
    });

    await test.step("Navigate to Recent and verify PDF form is available", async () => {
      await selectPanel.select("recent");
      await expect(
        selectPanel.selector.getByText("PDF from device"),
      ).toBeVisible();
    });
  });

  // Verifies that a PDF form from another FormFilling room is available for selection via the Rooms section
  test("PDF form from another room is available in room selector", async ({
    apiSdk,
  }) => {
    let roomId: number;

    await test.step("Create another FormFilling room via API and upload PDF form", async () => {
      const response = await apiSdk.rooms.createRoom("owner", {
        title: "SourceRoom",
        roomType: "FillingFormsRoom",
      });
      const body = await response.json();
      roomId = body.response.id;
      await apiSdk.files.uploadToFolder(
        "owner",
        roomId,
        "data/rooms/PDF from device.pdf",
      );
    });

    await test.step("Open FormFilling room", async () => {
      await myRooms.openRoom("FormFillingRoom");
    });

    await test.step("Skip tour and close info panel", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.close();
    });

    await test.step("Open Add PDF form from DocSpace selector", async () => {
      await roomEmptyView.uploadPdfFromDocSpace();
      await selectPanel.checkSelectorExist();
    });

    await test.step("Navigate to Rooms, open SourceRoom and verify PDF form is available", async () => {
      await selectPanel.select("rooms");
      await selectPanel.selectItemByText("SourceRoom", true);
      await expect(
        selectPanel.selector.getByText("PDF from device"),
      ).toBeVisible();
    });
  });
});

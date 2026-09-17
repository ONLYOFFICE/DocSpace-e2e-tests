import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Files from "@/src/objects/files/Files";
import Favorites from "@/src/objects/files/Favorites";
import Recent from "@/src/objects/files/Recent";
import FilesSelectPanel from "@/src/objects/files/FilesSelectPanel";
import MyRooms from "@/src/objects/rooms/Rooms";
import { apps } from "@/src/utils/constants/navigation";

const FORM_FILLING_ROOM_NAME = "FormFillingRoom";
const SOURCE_ROOM_NAME = "SourceRoom";
const NON_PDF_FILE_NAME = "Document";
const PDF_FORM_FILE_NAME = "PDF Form";
const UPLOADED_PDF_FORM_FILE_NAME = "PDF from device";

test.describe("Copy files to an existing Form Filling room", () => {
  let files: Files;
  let favorites: Favorites;
  let recent: Recent;
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    files = new Files(page, api.portalDomain);
    favorites = new Favorites(page, api.portalDomain);
    recent = new Recent(page, api.portalDomain);
    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
    await apiSdk.rooms.createRoom("owner", {
      title: FORM_FILLING_ROOM_NAME,
      roomType: "FillingFormsRoom",
    });
    await files.open();
    await files.deleteAllDocs();
  });

  async function openFormFillingRoom() {
    await myRooms.sidebar.navigate(apps.forms);
    await myRooms.roomsTable.openRoomByName(FORM_FILLING_ROOM_NAME);
  }

  // Selecting the room in the picker occasionally only highlights it without
  // registering it as the copy target (no alert, "Copy here" stays enabled) -
  // retry the click until the alert actually shows up.
  async function selectRoomAndExpectIncompatibleAlert(
    selectPanel: FilesSelectPanel,
  ) {
    await expect(async () => {
      await selectPanel.selectItemByText(FORM_FILLING_ROOM_NAME);
      await selectPanel.checkIncompatibleCopyAlertVisible(3000);
    }).toPass({ timeout: 30000 });
    await selectPanel.checkConfirmButtonDisabled();
    await selectPanel.close();
  }

  test.describe("Non-PDF file cannot be copied", () => {
    test("From My Documents", async () => {
      await test.step("Create a non-PDF document", async () => {
        await files.createDocumentFile(NON_PDF_FILE_NAME);
      });

      await test.step("Attempt to copy it into the Form Filling room", async () => {
        const selectPanel =
          await files.openCopyToFormsSelector(NON_PDF_FILE_NAME);
        await selectRoomAndExpectIncompatibleAlert(selectPanel);
      });

      await test.step("Verify file was not copied into the room", async () => {
        await openFormFillingRoom();
        await myRooms.filesTable.checkRowNotExist(NON_PDF_FILE_NAME);
      });
    });

    test("From Favorites", async () => {
      await test.step("Create a non-PDF document and mark it as favorite", async () => {
        await files.createDocumentFile(NON_PDF_FILE_NAME);
        await files.filesTable.markAsFavorite(NON_PDF_FILE_NAME);
      });

      await test.step("Attempt to copy it into the Form Filling room from Favorites", async () => {
        await favorites.openFromNavigation();
        await favorites.filesTable.checkRowExist(NON_PDF_FILE_NAME);
        const selectPanel =
          await favorites.openCopyToFormsSelector(NON_PDF_FILE_NAME);
        await selectRoomAndExpectIncompatibleAlert(selectPanel);
      });

      await test.step("Verify file was not copied into the room", async () => {
        await openFormFillingRoom();
        await myRooms.filesTable.checkRowNotExist(NON_PDF_FILE_NAME);
      });
    });

    test("From Recent", async ({ apiSdk }) => {
      await test.step("Create a non-PDF document and add it to Recent", async () => {
        await files.createDocumentFile(NON_PDF_FILE_NAME);
        const fileId = await apiSdk.files.getFileIdByTitle(
          "owner",
          NON_PDF_FILE_NAME,
        );
        await apiSdk.files.addToRecent("owner", fileId);
      });

      await test.step("Attempt to copy it into the Form Filling room from Recent", async () => {
        await recent.openFromNavigation();
        await recent.filesTable.checkRowExist(NON_PDF_FILE_NAME);
        const selectPanel =
          await recent.openCopyToFormsSelector(NON_PDF_FILE_NAME);
        await selectRoomAndExpectIncompatibleAlert(selectPanel);
      });

      await test.step("Verify file was not copied into the room", async () => {
        await openFormFillingRoom();
        await myRooms.filesTable.checkRowNotExist(NON_PDF_FILE_NAME);
      });
    });

    test("From Rooms", async ({ apiSdk }) => {
      await test.step("Create a source room with a non-PDF file", async () => {
        const roomResp = await apiSdk.rooms.createRoom("owner", {
          title: SOURCE_ROOM_NAME,
          roomType: "PublicRoom",
        });
        const sourceRoomId = (await roomResp.json()).response.id;
        await apiSdk.files.createFile("owner", sourceRoomId, {
          title: NON_PDF_FILE_NAME,
        });
      });

      await test.step("Attempt to copy it into the Form Filling room from Rooms", async () => {
        await myRooms.openWithoutEmptyCheck();
        await myRooms.roomsTable.openRoomByName(SOURCE_ROOM_NAME);
        await myRooms.filesTable.checkRowExist(NON_PDF_FILE_NAME);
        const selectPanel =
          await myRooms.openCopyToFormsSelector(NON_PDF_FILE_NAME);
        await selectRoomAndExpectIncompatibleAlert(selectPanel);
      });

      await test.step("Verify file was not copied into the room", async () => {
        await openFormFillingRoom();
        await myRooms.filesTable.checkRowNotExist(NON_PDF_FILE_NAME);
      });
    });
  });

  test.describe("Valid ONLYOFFICE PDF form can be copied", () => {
    test("From My Documents", async () => {
      await test.step("Create a valid PDF form", async () => {
        const editor =
          await files.createPdfFormAndOpenEditor(PDF_FORM_FILE_NAME);
        await editor.waitForLoad();
        await editor.close();
      });

      await test.step("Copy the PDF form into the Form Filling room", async () => {
        const selectPanel =
          await files.openCopyToFormsSelector(PDF_FORM_FILE_NAME);
        await selectPanel.selectItemByText(FORM_FILLING_ROOM_NAME);
        await selectPanel.confirmSelection();
        await selectPanel.confirmPublicRoomWarningIfShown();
        await files.dismissToastSafely(
          `${PDF_FORM_FILE_NAME}.pdf successfully copied to ${FORM_FILLING_ROOM_NAME}`,
        );
      });

      await test.step("Verify the PDF form appears in the room", async () => {
        await openFormFillingRoom();
        await myRooms.filesTable.checkRowExist(PDF_FORM_FILE_NAME);
      });
    });

    test("From Favorites", async () => {
      await test.step("Create a valid PDF form and mark it as favorite", async () => {
        const editor =
          await files.createPdfFormAndOpenEditor(PDF_FORM_FILE_NAME);
        await editor.waitForLoad();
        await editor.close();
        await files.filesTable.markAsFavorite(PDF_FORM_FILE_NAME);
      });

      await test.step("Copy the PDF form into the Form Filling room from Favorites", async () => {
        await favorites.openFromNavigation();
        await favorites.filesTable.checkRowExist(PDF_FORM_FILE_NAME);
        const selectPanel =
          await favorites.openCopyToFormsSelector(PDF_FORM_FILE_NAME);
        await selectPanel.selectItemByText(FORM_FILLING_ROOM_NAME);
        await selectPanel.confirmSelection();
        await selectPanel.confirmPublicRoomWarningIfShown();
        await favorites.dismissToastSafely(
          `${PDF_FORM_FILE_NAME}.pdf successfully copied to ${FORM_FILLING_ROOM_NAME}`,
        );
      });

      await test.step("Verify the PDF form appears in the room", async () => {
        await openFormFillingRoom();
        await myRooms.filesTable.checkRowExist(PDF_FORM_FILE_NAME);
      });
    });

    test("From Recent", async ({ apiSdk }) => {
      await test.step("Create a valid PDF form and add it to Recent", async () => {
        const editor =
          await files.createPdfFormAndOpenEditor(PDF_FORM_FILE_NAME);
        await editor.waitForLoad();
        await editor.close();
        const fileId = await apiSdk.files.getFileIdByTitle(
          "owner",
          PDF_FORM_FILE_NAME,
        );
        await apiSdk.files.addToRecent("owner", fileId);
      });

      await test.step("Copy the PDF form into the Form Filling room from Recent", async () => {
        await recent.openFromNavigation();
        await recent.filesTable.checkRowExist(PDF_FORM_FILE_NAME);
        const selectPanel =
          await recent.openCopyToFormsSelector(PDF_FORM_FILE_NAME);
        await selectPanel.selectItemByText(FORM_FILLING_ROOM_NAME);
        await selectPanel.confirmSelection();
        await selectPanel.confirmPublicRoomWarningIfShown();
        await recent.dismissToastSafely(
          `${PDF_FORM_FILE_NAME}.pdf successfully copied to ${FORM_FILLING_ROOM_NAME}`,
        );
      });

      await test.step("Verify the PDF form appears in the room", async () => {
        await openFormFillingRoom();
        await myRooms.filesTable.checkRowExist(PDF_FORM_FILE_NAME);
      });
    });

    test("From Rooms", async ({ apiSdk }) => {
      await test.step("Create a source room with a valid PDF form", async () => {
        const roomResp = await apiSdk.rooms.createRoom("owner", {
          title: SOURCE_ROOM_NAME,
          roomType: "PublicRoom",
        });
        const sourceRoomId = (await roomResp.json()).response.id;
        await apiSdk.files.uploadToFolder(
          "owner",
          sourceRoomId,
          "data/rooms/PDF from device.pdf",
        );
      });

      await test.step("Copy the PDF form into the Form Filling room from Rooms", async () => {
        await myRooms.openWithoutEmptyCheck();
        await myRooms.roomsTable.openRoomByName(SOURCE_ROOM_NAME);
        await myRooms.filesTable.checkRowExist(UPLOADED_PDF_FORM_FILE_NAME);
        const selectPanel = await myRooms.openCopyToFormsSelector(
          UPLOADED_PDF_FORM_FILE_NAME,
        );
        await selectPanel.selectItemByText(FORM_FILLING_ROOM_NAME);
        await selectPanel.confirmSelection();
        await selectPanel.confirmPublicRoomWarningIfShown();
        await myRooms.dismissToastSafely(
          `${UPLOADED_PDF_FORM_FILE_NAME}.pdf successfully copied to ${FORM_FILLING_ROOM_NAME}`,
        );
      });

      await test.step("Verify the PDF form appears in the room", async () => {
        await openFormFillingRoom();
        await myRooms.filesTable.checkRowExist(UPLOADED_PDF_FORM_FILE_NAME);
      });
    });
  });
});

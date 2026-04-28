import { test } from "@/src/fixtures";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import FilesTable from "@/src/objects/files/FilesTable";
import FilesNavigation from "@/src/objects/files/FilesNavigation";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomPDFCompleted from "@/src/objects/rooms/RoomPDFCompleted";
import InfoPanel from "@/src/objects/common/InfoPanel";
import Login from "@/src/objects/common/Login";
import { expect, Page } from "@playwright/test";
import {
  folderContextMenuOption,
  formFillingRoomPdfContextMenuOption,
  pdfFormContextMenuOption,
  spreadsheetContextMenuOption,
} from "@/src/utils/constants/files";
import {
  roomContextMenuOption,
  formFillingSystemFolders,
} from "@/src/utils/constants/rooms";
import RoomsCreateDialog from "@/src/objects/rooms/RoomsCreateDialog";
import FolderDeleteModal from "@/src/objects/files/FolderDeleteModal";

// Tests for "Sync responses to XLSX" in a FormFilling room.
// After form submission, an XLSX file is auto-created inside the submission folder
// (inside the Complete system folder). "Sync responses to XLSX" on the submission
// folder recreates the XLSX if deleted, or updates it to reflect current state.

const ROOM_NAME = "FormFillingRoom";
const FORM_NAME = "PDF from device";

test.describe("FormFilling room - Sync responses to XLSX", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let filesTable: FilesTable;
  let login: Login;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    filesTable = new FilesTable(page);
    login = new Login(page, api.portalDomain);

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "FillingFormsRoom",
    });
    const roomBody = await roomResponse.json();
    const roomId = roomBody.response.id;

    await apiSdk.files.uploadToFolder(
      "owner",
      roomId,
      "data/rooms/PDF from device.pdf",
    );

    await login.loginToPortal();
    await myRooms.openWithoutEmptyCheck();
    await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    await shortTour.clickSkipTour();
  });

  // Helper: submits the form and returns the post-submit page (showing the room).
  const startFillingAndSubmit = async (page: Page): Promise<Page> => {
    await filesTable.openContextMenuForItem(FORM_NAME);
    await filesTable.contextMenu.clickOption(
      formFillingRoomPdfContextMenuOption.startFilling,
    );
    await shortTour.clickModalCloseButton();
    await filesTable.expectFillingIconVisible(FORM_NAME);

    const pagePromise = page.context().waitForEvent("page", { timeout: 30000 });
    await filesTable.openContextMenuForItem(FORM_NAME);
    await filesTable.contextMenu.clickOption(
      formFillingRoomPdfContextMenuOption.fill,
    );
    const fillPage = await pagePromise;
    const pdfForm = new FilesPdfForm(fillPage);
    await pdfForm.waitForEditorFrame();
    await pdfForm.clickSubmitButton();
    const pdfCompleted = new RoomPDFCompleted(fillPage);
    await pdfCompleted.chooseBackToRoom();
    await expect(fillPage.getByLabel(`${FORM_NAME},`)).toBeVisible({
      timeout: 10000,
    });
    return fillPage;
  };

  test("Sync creates XLSX when Collect results in XLSX toggle is disabled", async ({
    page,
  }) => {
    let newPage!: Page;
    const createDialog = new RoomsCreateDialog(page);

    await test.step("Disable Collect results in XLSX toggle in room settings", async () => {
      await myRooms.navigation.openContextMenu();
      await myRooms.navigation.contextMenu.menu
        .getByText(roomContextMenuOption.editRoom)
        .click();
      await myRooms.roomsEditDialog.checkDialogTitleExist();
      await createDialog.toggleSaveFormAsXlsx(false);
      await myRooms.roomsEditDialog.clickSaveButton();
    });

    await test.step("Submit the form", async () => {
      newPage = await startFillingAndSubmit(page);
    });

    const newFilesTable = new FilesTable(newPage);
    const filesNav = new FilesNavigation(newPage);

    await test.step("Navigate to submission folder inside Complete", async () => {
      await newFilesTable.openContextMenuForItem(
        formFillingSystemFolders.complete,
      );
      await newFilesTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        newPage.getByRole("heading", {
          name: formFillingSystemFolders.complete,
        }),
      ).toBeVisible();
      await newFilesTable.openContextMenuForItem(FORM_NAME);
      await newFilesTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        newPage.getByRole("heading", { name: FORM_NAME }),
      ).toBeVisible();
    });

    await test.step("Verify XLSX is not auto-created when toggle is disabled", async () => {
      await newFilesTable.expectXlsxItemNotVisible();
    });

    await test.step("Navigate back to Complete and sync submission folder", async () => {
      await filesNav.gotoBack(); // back to Complete
      await expect(
        newPage.getByRole("heading", {
          name: formFillingSystemFolders.complete,
        }),
      ).toBeVisible();
      await newFilesTable.openContextMenuForItem(FORM_NAME);
      await newFilesTable.contextMenu.clickOption(
        folderContextMenuOption.syncResponsesToXlsx,
      );
    });

    await test.step("Navigate into submission folder", async () => {
      await newFilesTable.openContextMenuForItem(FORM_NAME);
      await newFilesTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        newPage.getByRole("heading", { name: FORM_NAME }),
      ).toBeVisible();
    });

    await test.step("Verify XLSX is created by Sync with correct name", async () => {
      await newFilesTable.expectXlsxItemVisible(15000);
    });

    await test.step("Verify Sync-created XLSX has non-zero size", async () => {
      await newFilesTable.openContextMenuForXlsxItem();
      await newFilesTable.contextMenu.clickOption(
        spreadsheetContextMenuOption.select,
      );
      const infoPanel = new InfoPanel(newPage);
      await infoPanel.open();
      const sizeBytes = await infoPanel.getSizeInBytes();
      expect(sizeBytes).toBeGreaterThan(0);
    });
  });

  test("Sync recreates XLSX with correct name and non-zero size after deletion", async ({
    page,
  }) => {
    let newPage!: Page;

    await test.step("Submit the form", async () => {
      newPage = await startFillingAndSubmit(page);
    });

    const newFilesTable = new FilesTable(newPage);
    const filesNav = new FilesNavigation(newPage);

    await test.step("Navigate to submission folder inside Complete", async () => {
      await newFilesTable.openContextMenuForItem(
        formFillingSystemFolders.complete,
      );
      await newFilesTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        newPage.getByRole("heading", {
          name: formFillingSystemFolders.complete,
        }),
      ).toBeVisible();
      await newFilesTable.openContextMenuForItem(FORM_NAME);
      await newFilesTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        newPage.getByRole("heading", { name: FORM_NAME }),
      ).toBeVisible();
    });

    await test.step("Delete auto-created XLSX file", async () => {
      await newFilesTable.expectXlsxItemVisible(10000);
      await newFilesTable.openContextMenuForXlsxItem();
      await newFilesTable.contextMenu.clickOption(
        spreadsheetContextMenuOption.delete,
      );
      // Confirm deletion dialog
      const deleteModal = new FolderDeleteModal(newPage);
      await deleteModal.clickDeleteFolder();
      await newFilesTable.expectXlsxItemNotVisible();
    });

    await test.step("Navigate back to Complete and sync submission folder", async () => {
      await filesNav.gotoBack(); // back to Complete
      await expect(
        newPage.getByRole("heading", {
          name: formFillingSystemFolders.complete,
        }),
      ).toBeVisible();
      await newFilesTable.openContextMenuForItem(FORM_NAME);
      await newFilesTable.contextMenu.clickOption(
        folderContextMenuOption.syncResponsesToXlsx,
      );
    });

    await test.step("Navigate into submission folder", async () => {
      await newFilesTable.openContextMenuForItem(FORM_NAME);
      await newFilesTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        newPage.getByRole("heading", { name: FORM_NAME }),
      ).toBeVisible();
    });

    await test.step("Verify recreated XLSX has correct name", async () => {
      await newFilesTable.expectXlsxItemVisible(15000);
    });

    await test.step("Verify recreated XLSX has non-zero size", async () => {
      await newFilesTable.openContextMenuForXlsxItem();
      await newFilesTable.contextMenu.clickOption(
        spreadsheetContextMenuOption.select,
      );
      const infoPanel = new InfoPanel(newPage);
      await infoPanel.open();
      const sizeBytes = await infoPanel.getSizeInBytes();
      expect(sizeBytes).toBeGreaterThan(0);
    });
  });

  // Bug 81181: Deleted PDF still included in sync report until permanently removed from Trash
  test.skip("[Bug 81181] Sync reflects only remaining submission after one PDF is deleted", async ({
    page,
  }) => {
    let newPage!: Page;
    let xlsxSizeWith2Submissions: number;

    await test.step("Submit the form twice using Fill out again", async () => {
      // Start filling from the main room page
      await filesTable.openContextMenuForItem(FORM_NAME);
      await filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      await shortTour.clickModalCloseButton();
      await filesTable.expectFillingIconVisible(FORM_NAME);

      // Open the form editor (new tab)
      const pagePromise = page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await filesTable.openContextMenuForItem(FORM_NAME);
      await filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.fill,
      );
      const fillPage = await pagePromise;

      // 1st submission
      const pdfForm = new FilesPdfForm(fillPage);
      await pdfForm.waitForEditorFrame();
      await pdfForm.clickSubmitButton();

      // Click "Fill out again" instead of going back to the room
      const pdfCompleted = new RoomPDFCompleted(fillPage);
      await pdfCompleted.chooseFillItOutAgain();

      // 2nd submission (form reloads in the same tab)
      await pdfForm.waitForEditorFrame();
      await pdfForm.clickSubmitButton();

      // Go back to room after 2nd submission
      const pdfCompleted2 = new RoomPDFCompleted(fillPage);
      await pdfCompleted2.chooseBackToRoom();
      await expect(fillPage.getByLabel(`${FORM_NAME},`)).toBeVisible({
        timeout: 10000,
      });
      newPage = fillPage;
    });

    // newPage is now the page returned after 2nd submission
    const finalTable = new FilesTable(newPage);
    const finalNav = new FilesNavigation(newPage);

    await test.step("Navigate to submission folder inside Complete", async () => {
      await finalTable.openContextMenuForItem("Complete");
      await finalTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        newPage.getByRole("heading", { name: "Complete" }),
      ).toBeVisible();
      await finalTable.openContextMenuForItem(FORM_NAME);
      await finalTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        newPage.getByRole("heading", { name: FORM_NAME }),
      ).toBeVisible();
    });

    await test.step("Record XLSX size with 2 submissions", async () => {
      await finalTable.expectXlsxItemVisible(10000);
      await finalTable.openContextMenuForXlsxItem();
      await finalTable.contextMenu.clickOption(
        spreadsheetContextMenuOption.select,
      );
      const infoPanel = new InfoPanel(newPage);
      await infoPanel.open();
      xlsxSizeWith2Submissions = await infoPanel.getSizeInBytes();
      expect(xlsxSizeWith2Submissions).toBeGreaterThan(0);
    });

    await test.step("Delete one PDF submission from submission folder", async () => {
      await finalTable.openContextMenuForPdfItem();
      await finalTable.contextMenu.clickOption(pdfFormContextMenuOption.delete);
      const deleteModal = new FolderDeleteModal(newPage);
      await deleteModal.clickDeleteFolder();
    });

    await test.step("Navigate back to Complete and sync submission folder", async () => {
      await finalNav.gotoBack();
      await expect(
        newPage.getByRole("heading", { name: "Complete" }),
      ).toBeVisible();
      await finalTable.openContextMenuForItem(FORM_NAME);
      await finalTable.contextMenu.clickOption(
        folderContextMenuOption.syncResponsesToXlsx,
      );
    });

    await test.step("Navigate into submission folder", async () => {
      await finalTable.openContextMenuForItem(FORM_NAME);
      await finalTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        newPage.getByRole("heading", { name: FORM_NAME }),
      ).toBeVisible();
    });

    await test.step("Verify XLSX exists after sync", async () => {
      await finalTable.expectXlsxItemVisible(15000);
    });

    await test.step("Verify synced XLSX is smaller than with 2 submissions", async () => {
      await finalTable.openContextMenuForXlsxItem();
      await finalTable.contextMenu.clickOption(
        spreadsheetContextMenuOption.select,
      );
      const infoPanel = new InfoPanel(newPage);
      await infoPanel.open();
      const sizeAfterSync = await infoPanel.getSizeInBytes();
      expect(sizeAfterSync).toBeLessThan(xlsxSizeWith2Submissions);
    });
  });

  // TODO Bug 81181: unskip when fixed - form in trash is still counted
  test.skip("Sync option is absent from submission folder when PDF is deleted", async ({
    page,
  }) => {
    let newPage!: Page;

    await test.step("Submit the form", async () => {
      newPage = await startFillingAndSubmit(page);
    });

    const newFilesTable = new FilesTable(newPage);
    const filesNav = new FilesNavigation(newPage);

    await test.step("Navigate to submission folder inside Complete", async () => {
      await newFilesTable.openContextMenuForItem("Complete");
      await newFilesTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        newPage.getByRole("heading", { name: "Complete" }),
      ).toBeVisible();
      await newFilesTable.openContextMenuForItem(FORM_NAME);
      await newFilesTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        newPage.getByRole("heading", { name: FORM_NAME }),
      ).toBeVisible();
    });

    await test.step("Delete PDF submission copy from submission folder", async () => {
      await newFilesTable.expectXlsxItemVisible(10000);
      await newFilesTable.openContextMenuForPdfItem();
      await newFilesTable.contextMenu.clickOption(
        pdfFormContextMenuOption.delete,
      );
      const deleteModal = new FolderDeleteModal(newPage);
      await deleteModal.clickDeleteFolder();
    });

    await test.step("Navigate back to Complete", async () => {
      await filesNav.gotoBack();
      await expect(
        newPage.getByRole("heading", { name: "Complete" }),
      ).toBeVisible();
    });

    await test.step("Verify Sync option is absent from submission folder context menu", async () => {
      await newFilesTable.openContextMenuForItem(FORM_NAME);
      await expect(
        newFilesTable.contextMenu.getItemLocator(folderContextMenuOption.open),
      ).toBeVisible();
      await expect(
        newFilesTable.contextMenu.getItemLocator(
          folderContextMenuOption.syncResponsesToXlsx,
        ),
      ).not.toBeVisible();
      await newFilesTable.contextMenu.close();
    });

    await test.step("Navigate into submission folder", async () => {
      await newFilesTable.openContextMenuForItem(FORM_NAME);
      await newFilesTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        newPage.getByRole("heading", { name: FORM_NAME }),
      ).toBeVisible();
    });

    await test.step("Verify Sync option is absent from XLSX context menu", async () => {
      await newFilesTable.openContextMenuForXlsxItem();
      await expect(
        newFilesTable.contextMenu.getItemLocator(
          spreadsheetContextMenuOption.syncResponsesToXlsx,
        ),
      ).not.toBeVisible();
      await newFilesTable.contextMenu.close();
    });
  });
});

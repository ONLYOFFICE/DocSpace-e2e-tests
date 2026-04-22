import { test } from "@/src/fixtures";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import FilesTable from "@/src/objects/files/FilesTable";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomPDFCompleted from "@/src/objects/rooms/RoomPDFCompleted";
import Login from "@/src/objects/common/Login";
import { expect, Page } from "@playwright/test";
import {
  folderContextMenuOption,
  formFillingRoomPdfContextMenuOption,
} from "@/src/utils/constants/files";
import { formFillingSystemFolders } from "@/src/utils/constants/rooms";
import FilesSelectPanel from "@/src/objects/files/FilesSelectPanel";

// Tests for the "In process" and "Complete" system folders in a Form Filling room.
// Both folders appear as soon as a PDF form is uploaded to the room.
// Room and file are created via API for faster and more reliable setup.

const ROOM_NAME = "FormFillingRoom";
const FORM_NAME = "PDF from device";

test.describe("FormFilling room - In process and Complete folders", () => {
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

  test("Complete and In process folders have correct context menu options", async () => {
    const checkFolderContextMenu = async (folderName: string) => {
      await filesTable.openContextMenuForItem(folderName);
      await expect(
        filesTable.contextMenu.getItemLocator(folderContextMenuOption.open),
      ).toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator(folderContextMenuOption.download),
      ).toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.folderInfo,
        ),
      ).toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.markAsFavorite,
        ),
      ).toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator(folderContextMenuOption.select),
      ).toBeVisible();
      await expect(filesTable.contextMenu.getItemLocator("Copy")).toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator("Copy link"),
      ).toBeVisible();
      // Delete and Rename must not be present for system folders
      await expect(
        filesTable.contextMenu.getItemLocator(folderContextMenuOption.delete),
      ).not.toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator(folderContextMenuOption.rename),
      ).not.toBeVisible();
      await filesTable.contextMenu.close();
    };

    await test.step("Check context menu for Complete folder", async () => {
      await checkFolderContextMenu(formFillingSystemFolders.complete);
    });

    await test.step("Check context menu for In process folder", async () => {
      await checkFolderContextMenu(formFillingSystemFolders.inProcess);
    });
  });

  test("Progress folders cannot be deleted", async ({ page }) => {
    const checkNoDeletion = async (folderName: string) => {
      await filesTable.openContextMenuForItem(folderName);
      await expect(
        filesTable.contextMenu.menu.getByText("Delete"),
      ).not.toBeVisible();
      await page.keyboard.press("Escape");
      await filesTable.selectFolderByName(folderName);
      await expect(page.getByText("Delete")).not.toBeVisible();
    };

    await test.step("Check Complete folder cannot be deleted", async () => {
      await checkNoDeletion(formFillingSystemFolders.complete);
    });

    await test.step("Check In process folder cannot be deleted", async () => {
      await checkNoDeletion(formFillingSystemFolders.inProcess);
    });
  });

  test("Move to button is disabled when Complete or In process folder is selected", async ({
    page,
  }) => {
    const openMoveSelector = async () => {
      await myRooms.filesTable.openContextMenuForItem(FORM_NAME);
      await myRooms.filesTable.contextMenu.clickSubmenuOption(
        "Move or copy",
        "Move to",
      );
    };
    const filesSelectPanel = new FilesSelectPanel(page);
    const submitButton = filesSelectPanel.selector.getByTestId(
      "selector_submit_button",
    );

    await test.step("Select Complete folder and verify Move to button is disabled", async () => {
      await openMoveSelector();
      await filesSelectPanel.checkFileSelectPanelExist();
      await filesSelectPanel.selectItemByText(formFillingSystemFolders.complete);
      await expect(submitButton).toBeDisabled();
      await filesSelectPanel.close();
    });

    await test.step("Select In process folder and verify Move to button is disabled", async () => {
      await openMoveSelector();
      await filesSelectPanel.checkFileSelectPanelExist();
      await filesSelectPanel.selectItemByText(formFillingSystemFolders.inProcess);
      await expect(submitButton).toBeDisabled();
      await filesSelectPanel.close();
    });
  });

  test("Copy to button is disabled when Complete or In process folder is selected", async ({
    page,
  }) => {
    const openCopySelector = async () => {
      await myRooms.filesTable.openContextMenuForItem(FORM_NAME);
      await myRooms.filesTable.contextMenu.clickSubmenuOption(
        "Move or copy",
        "Copy",
      );
    };
    const filesSelectPanel = new FilesSelectPanel(page);
    const submitButton = filesSelectPanel.selector.getByTestId(
      "selector_submit_button",
    );

    await test.step("Select Complete folder and verify Copy to button is disabled", async () => {
      await openCopySelector();
      await filesSelectPanel.checkFileSelectPanelExist();
      await filesSelectPanel.selectItemByText(formFillingSystemFolders.complete);
      await expect(submitButton).toBeDisabled();
      await filesSelectPanel.close();
    });

    await test.step("Select In process folder and verify Copy to button is disabled", async () => {
      await openCopySelector();
      await filesSelectPanel.checkFileSelectPanelExist();
      await filesSelectPanel.selectItemByText(formFillingSystemFolders.inProcess);
      await expect(submitButton).toBeDisabled();
      await filesSelectPanel.close();
    });
  });

  // Helper: start filling and open the form in the editor, then close the tab.
  // This creates the submission subfolder inside the "In process" system folder.
  const startFillingAndOpenForm = async (page: Page): Promise<void> => {
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
    await fillPage.close();
  };

  test("Owner can download file from In process folder", async ({ page }) => {
    await test.step("Start filling and open form to create In process entry", async () => {
      await startFillingAndOpenForm(page);
    });

    await test.step("Navigate into In process folder", async () => {
      await filesTable.openContextMenuForItem(formFillingSystemFolders.inProcess);
      await filesTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        page.getByRole("heading", { name: formFillingSystemFolders.inProcess }),
      ).toBeVisible();
    });

    await test.step("Verify form copy is present in In process folder", async () => {
      await expect(page.getByText(FORM_NAME, { exact: true })).toBeVisible({
        timeout: 10000,
      });
    });

    await test.step("Download form copy from In process folder", async () => {
      await filesTable.openContextMenuForItem(FORM_NAME);
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 30000 }),
        filesTable.contextMenu.clickOption(folderContextMenuOption.download),
      ]);
      expect(download.suggestedFilename()).toBeTruthy();
      await download.cancel();
    });
  });

  test("Submission folder inside In process has correct context menu options", async ({
    page,
  }) => {
    await test.step("Start filling and open form to create In process entry", async () => {
      await startFillingAndOpenForm(page);
    });

    await test.step("Navigate into In process folder", async () => {
      await filesTable.openContextMenuForItem(formFillingSystemFolders.inProcess);
      await filesTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        page.getByRole("heading", { name: formFillingSystemFolders.inProcess }),
      ).toBeVisible();
    });

    await test.step("Verify required options are present in submission folder context menu", async () => {
      await filesTable.openContextMenuForItem(FORM_NAME);
      await expect(
        filesTable.contextMenu.getItemLocator(folderContextMenuOption.select),
      ).toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator(folderContextMenuOption.open),
      ).toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator(folderContextMenuOption.download),
      ).toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.markAsFavorite,
        ),
      ).toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.folderInfo,
        ),
      ).toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator(folderContextMenuOption.delete),
      ).toBeVisible();
      await expect(filesTable.contextMenu.getItemLocator("Copy")).toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator("Copy link"),
      ).toBeVisible();
    });

    await test.step("Verify restricted options are absent from submission folder context menu", async () => {
      await expect(
        filesTable.contextMenu.getItemLocator(folderContextMenuOption.share),
      ).not.toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.moveOrCopy,
        ),
      ).not.toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator(folderContextMenuOption.rename),
      ).not.toBeVisible();
      await expect(
        filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.syncResponsesToXlsx,
        ),
      ).not.toBeVisible();
      await filesTable.contextMenu.close();
    });
  });

  // Helper: start filling, open and submit the form.
  // Returns the new page that opens after submission (showing the room).
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
    await fillPage.waitForLoadState("load");
    const pdfForm = new FilesPdfForm(fillPage);
    await pdfForm.clickSubmitButton();
    const pdfCompleted = new RoomPDFCompleted(fillPage);
    await pdfCompleted.chooseBackToRoom();
    await expect(fillPage.getByLabel(`${FORM_NAME},`)).toBeVisible({
      timeout: 10000,
    });
    return fillPage;
  };

  test("Owner can download submitted form from Complete folder", async ({
    page,
  }) => {
    let newPage!: Page;

    await test.step("Start filling and submit the form", async () => {
      newPage = await startFillingAndSubmit(page);
    });

    await test.step("Navigate into Complete folder", async () => {
      const newFilesTable = new FilesTable(newPage);
      await newFilesTable.openContextMenuForItem(formFillingSystemFolders.complete);
      await newFilesTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        newPage.getByRole("heading", { name: formFillingSystemFolders.complete }),
      ).toBeVisible();
    });

    await test.step("Verify submitted form is present in Complete folder", async () => {
      await expect(newPage.getByText(FORM_NAME, { exact: true })).toBeVisible({
        timeout: 15000,
      });
    });

    await test.step("Download submitted form from Complete folder", async () => {
      const newFilesTable = new FilesTable(newPage);
      await newFilesTable.openContextMenuForItem(FORM_NAME);
      const [download] = await Promise.all([
        newPage.waitForEvent("download", { timeout: 30000 }),
        newFilesTable.contextMenu.clickOption(folderContextMenuOption.download),
      ]);
      expect(download.suggestedFilename()).toBeTruthy();
      await download.cancel();
    });

    await test.step("Verify submission folder has Sync responses to XLSX option", async () => {
      const newFilesTable = new FilesTable(newPage);
      await newFilesTable.openContextMenuForItem(FORM_NAME);
      await expect(
        newFilesTable.contextMenu.getItemLocator(
          folderContextMenuOption.syncResponsesToXlsx,
        ),
      ).toBeVisible();
      await newFilesTable.contextMenu.close();
    });
  });

  test("Submission folder inside Complete has correct context menu options", async ({
    page,
  }) => {
    let newPage!: Page;

    await test.step("Start filling and submit the form", async () => {
      newPage = await startFillingAndSubmit(page);
    });

    await test.step("Navigate into Complete folder", async () => {
      const newFilesTable = new FilesTable(newPage);
      await newFilesTable.openContextMenuForItem(formFillingSystemFolders.complete);
      await newFilesTable.contextMenu.clickOption(folderContextMenuOption.open);
      await expect(
        newPage.getByRole("heading", { name: formFillingSystemFolders.complete }),
      ).toBeVisible();
    });

    await test.step("Verify required options are present in submission folder context menu", async () => {
      const newFilesTable = new FilesTable(newPage);
      await newFilesTable.openContextMenuForItem(FORM_NAME);
      await expect(
        newFilesTable.contextMenu.getItemLocator(
          folderContextMenuOption.select,
        ),
      ).toBeVisible();
      await expect(
        newFilesTable.contextMenu.getItemLocator(folderContextMenuOption.open),
      ).toBeVisible();
      await expect(
        newFilesTable.contextMenu.getItemLocator(
          folderContextMenuOption.syncResponsesToXlsx,
        ),
      ).toBeVisible();
      await expect(
        newFilesTable.contextMenu.getItemLocator(
          folderContextMenuOption.download,
        ),
      ).toBeVisible();
      await expect(
        newFilesTable.contextMenu.getItemLocator(
          folderContextMenuOption.markAsFavorite,
        ),
      ).toBeVisible();
      await expect(
        newFilesTable.contextMenu.getItemLocator(
          folderContextMenuOption.folderInfo,
        ),
      ).toBeVisible();
      await expect(
        newFilesTable.contextMenu.getItemLocator(
          folderContextMenuOption.delete,
        ),
      ).toBeVisible();
      await expect(
        newFilesTable.contextMenu.getItemLocator("Copy"),
      ).toBeVisible();
      await expect(
        newFilesTable.contextMenu.getItemLocator("Copy link"),
      ).toBeVisible();
    });

    await test.step("Verify restricted options are absent from submission folder context menu", async () => {
      const newFilesTable = new FilesTable(newPage);
      await expect(
        newFilesTable.contextMenu.getItemLocator(folderContextMenuOption.share),
      ).not.toBeVisible();
      await expect(
        newFilesTable.contextMenu.getItemLocator(
          folderContextMenuOption.moveOrCopy,
        ),
      ).not.toBeVisible();
      await expect(
        newFilesTable.contextMenu.getItemLocator(
          folderContextMenuOption.rename,
        ),
      ).not.toBeVisible();
      await newFilesTable.contextMenu.close();
    });
  });
});

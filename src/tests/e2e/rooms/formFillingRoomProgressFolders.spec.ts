import { test } from "@/src/fixtures";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import MyRooms from "@/src/objects/rooms/Rooms";
import FilesTable from "@/src/objects/files/FilesTable";
import RoomEmptyView from "@/src/objects/rooms/RoomEmptyView";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import Login from "@/src/objects/common/Login";
import { expect } from "@playwright/test";
import { uploadAndVerifyPDF } from "@/src/utils/helpers/formFillingRoom";
import { folderContextMenuOption } from "@/src/utils/constants/files";
import FilesSelectPanel from "@/src/objects/files/FilesSelectPanel";

// Tests for the "In process" and "Complete" system folders in a Form Filling room.
// Both folders appear as soon as a PDF form is uploaded to the room.

test.describe("FormFilling room - In process and Complete folders", () => {
  let myRooms: MyRooms;
  let shortTour: ShortTour;
  let roomEmptyView: RoomEmptyView;
  let filesTable: FilesTable;
  let selectPanel: RoomSelectPanel;
  let login: Login;

  test.beforeEach(async ({ page, api }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    roomEmptyView = new RoomEmptyView(page);
    filesTable = new FilesTable(page);
    selectPanel = new RoomSelectPanel(page);
    login = new Login(page, api.portalDomain);
    await login.loginToPortal();
    await myRooms.createFormFillingRoom("FormFillingRoom");
    await uploadAndVerifyPDF(
      shortTour,
      roomEmptyView,
      selectPanel,
      myRooms,
      page,
    );
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
      await checkFolderContextMenu("Complete");
    });

    await test.step("Check context menu for In process folder", async () => {
      await checkFolderContextMenu("In process");
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
      await checkNoDeletion("Complete");
    });

    await test.step("Check In process folder cannot be deleted", async () => {
      await checkNoDeletion("In process");
    });
  });

  test("Move to button is disabled when Complete or In process folder is selected", async ({
    page,
  }) => {
    const openMoveSelector = async () => {
      await myRooms.filesTable.openContextMenuForItem(
        "ONLYOFFICE Resume Sample",
      );
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
      await filesSelectPanel.selectItemByText("Complete");
      await expect(submitButton).toBeDisabled();
      await filesSelectPanel.close();
    });

    await test.step("Select In process folder and verify Move to button is disabled", async () => {
      await openMoveSelector();
      await filesSelectPanel.checkFileSelectPanelExist();
      await filesSelectPanel.selectItemByText("In process");
      await expect(submitButton).toBeDisabled();
      await filesSelectPanel.close();
    });
  });

  test("Copy to button is disabled when Complete or In process folder is selected", async ({
    page,
  }) => {
    const openCopySelector = async () => {
      await myRooms.filesTable.openContextMenuForItem(
        "ONLYOFFICE Resume Sample",
      );
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
      await filesSelectPanel.selectItemByText("Complete");
      await expect(submitButton).toBeDisabled();
      await filesSelectPanel.close();
    });

    await test.step("Select In process folder and verify Copy to button is disabled", async () => {
      await openCopySelector();
      await filesSelectPanel.checkFileSelectPanelExist();
      await filesSelectPanel.selectItemByText("In process");
      await expect(submitButton).toBeDisabled();
      await filesSelectPanel.close();
    });
  });
});

import { test } from "@/src/fixtures";
import { expect, Page } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import RoomEmptyView from "@/src/objects/rooms/RoomEmptyView";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import FilesTable from "@/src/objects/files/FilesTable";
import VdrEditorRolesPanel from "@/src/objects/files/VdrEditorRolesPanel";
import VdrStartFillingPage from "@/src/objects/files/VdrStartFillingPage";
import PdfFormEditor from "@/src/objects/files/PdfFormEditor";
import {
  roomCreateTitles,
  roomDialogSource,
} from "@/src/utils/constants/rooms";

const PDF_FORM_NAME = "ONLYOFFICE Resume Sample";
const VDR_ROOM_NAME = "VDREditorRoles";

test.describe("VDR room: editor roles", () => {
  let myRooms: MyRooms;
  let roomEmptyView: RoomEmptyView;
  let selectPanel: RoomSelectPanel;
  let filesTable: FilesTable;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    roomEmptyView = new RoomEmptyView(page);
    selectPanel = new RoomSelectPanel(page);
    filesTable = new FilesTable(page);

    await login.loginToPortal();
    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.virtualData);
    await myRooms.roomsCreateDialog.createRoom(VDR_ROOM_NAME);

    await roomEmptyView.uploadPdfFromDocSpace();
    await selectPanel.checkSelectorExist();
    await selectPanel.select("documents");
    await selectPanel.selectItemByText(PDF_FORM_NAME);
    await selectPanel.confirmSelection();
    await myRooms.infoPanel.close();
    await expect(page.getByLabel(`${PDF_FORM_NAME},`)).toBeVisible();
  });

  test("Start filling opens editor with role assignment panel", async ({
    page,
  }) => {
    let editorPage: Page;

    await test.step("Click Start filling from file context menu", async () => {
      const pagePromise = page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await filesTable.openContextMenuForItem(PDF_FORM_NAME);
      await filesTable.contextMenu.clickOption("Start filling");
      editorPage = await pagePromise;
      await editorPage.waitForLoadState("load");
      const pdfFormEditor = new PdfFormEditor(editorPage);
      await pdfFormEditor.waitForLoad();
    });

    await test.step("Verify Start filling panel with role selector is visible", async () => {
      const rolesPanel = new VdrEditorRolesPanel(editorPage);
      await rolesPanel.checkPanelVisible();
      await rolesPanel.checkRoleSelectorVisible();
    });

    await test.step("Click role selector and assign current user", async () => {
      const rolesPanel = new VdrEditorRolesPanel(editorPage);
      await rolesPanel.clickRoleSelector();
      // selector-item-0 is the current user (owner) in the editor contacts selector
      await rolesPanel.selectUserByIndex(0);
      await rolesPanel.submitRoleSelection();
    });

    await test.step("Verify assigned user name is shown in role selector", async () => {
      const rolesPanel = new VdrEditorRolesPanel(editorPage);
      await rolesPanel.checkAssignedUserName("admin-zero admin-zero");
    });

    await test.step("Click Start to confirm role assignments", async () => {
      const rolesPanel = new VdrEditorRolesPanel(editorPage);
      await rolesPanel.clickStart();
    });

    await test.step("Verify role-based filling started successfully", async () => {
      const startFillingPage = new VdrStartFillingPage(editorPage);
      await startFillingPage.waitForPageLoad();
      await startFillingPage.checkHeading();
      await startFillingPage.checkButtonsVisible();
      await startFillingPage.checkPageElementsVisible();
    });

    await test.step("Return to room and verify 'Your turn' badge is shown on the file", async () => {
      await page.bringToFront();
      await page.reload({ waitUntil: "load" });
      await filesTable.expectYourTurnBadgeVisible();
    });
  });
});

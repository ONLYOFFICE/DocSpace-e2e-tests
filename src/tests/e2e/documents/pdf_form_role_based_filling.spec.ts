import { Page } from "@playwright/test";
import { test } from "@/src/fixtures";

import MyDocuments from "@/src/objects/files/MyDocuments";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import EditorStartFillingPanel from "@/src/objects/files/EditorStartFillingPanel";
import AssignRoleDialog from "@/src/objects/files/AssignRoleDialog";
import VdrEditorRolesPanel from "@/src/objects/files/VdrEditorRolesPanel";
import VdrStartFillingPage from "@/src/objects/files/VdrStartFillingPage";
import MyRooms from "@/src/objects/rooms/Rooms";
import FilesTable from "@/src/objects/files/FilesTable";
import BaseSelector from "@/src/objects/common/BaseSelector";
import BaseToast from "@/src/objects/common/BaseToast";

const VDR_ROOM_NAME = "VDR Room";
const PDF_FORM_NAME = "PDF Form";

test.describe("My Documents: PDF form role-based filling via editor", () => {
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
    await myDocuments.open();
  });

  test("Owner assigns role via editor and verifies Your turn badge in VDR room", async ({
    api,
  }) => {
    let editorPage: Page;
    let pdfForm: FilesPdfForm;
    let selector: BaseSelector;

    await test.step("Create blank PDF form and open editor", async () => {
      const editor =
        await myDocuments.createPdfFormAndOpenEditor(PDF_FORM_NAME);
      await editor.waitForLoad();
      editorPage = editor.editorPage;
      pdfForm = new FilesPdfForm(editorPage);
      selector = new BaseSelector(editorPage);
    });

    await test.step("Click Start filling in editor", async () => {
      await pdfForm.clickStartFillButton();
    });

    await test.step("Click Recipient role-based filling on the panel", async () => {
      const startFillingPanel = new EditorStartFillingPanel(editorPage);
      await startFillingPanel.clickRoleBasedFilling();
    });

    await test.step("Create new VDR room via room selector", async () => {
      await selector.checkSelectorAddButtonExist();
      await selector.createNewItem();
      await selector.fillNewItemName(VDR_ROOM_NAME);
      await selector.acceptCreate();
    });

    await test.step("Select created room and submit", async () => {
      await selector.selectItemByText(VDR_ROOM_NAME);
      await selector.submitSelection();
    });

    await test.step("Verify file copied to VDR room toast appears", async () => {
      const toast = new BaseToast(editorPage);
      await toast.checkToastMessage(
        `${PDF_FORM_NAME}.pdf successfully copied to ${VDR_ROOM_NAME}`,
      );
    });

    await test.step("Click Assign role - editor reopens with role assignment panel", async () => {
      const assignRoleDialog = new AssignRoleDialog(editorPage);
      await assignRoleDialog.clickAssignRole();
      const rolesPanel = new VdrEditorRolesPanel(editorPage);
      await rolesPanel.checkPanelVisible();
    });

    await test.step("Assign current user as role filler", async () => {
      const rolesPanel = new VdrEditorRolesPanel(editorPage);
      await rolesPanel.checkRoleSelectorVisible();
      await rolesPanel.clickRoleSelector();
      await rolesPanel.selectUserByName("admin-zero admin-zero");
      await rolesPanel.submitRoleSelection();
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
    });

    await test.step("Navigate to VDR room and verify Your turn badge on the form", async () => {
      const rooms = new MyRooms(editorPage, api.portalDomain);
      await rooms.openWithoutEmptyCheck();
      await rooms.roomsTable.openRoomByName(VDR_ROOM_NAME);
      const filesTable = new FilesTable(editorPage);
      await filesTable.checkRowExist(PDF_FORM_NAME);
      await filesTable.expectYourTurnBadgeVisible();
    });
  });
});

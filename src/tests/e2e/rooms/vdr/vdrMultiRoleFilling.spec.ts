import { BrowserContext, Page } from "@playwright/test";
import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import FilesTable from "@/src/objects/files/FilesTable";
import PdfFormEditor from "@/src/objects/files/PdfFormEditor";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import VdrEditorRolesPanel from "@/src/objects/files/VdrEditorRolesPanel";
import VdrStartFillingPage from "@/src/objects/files/VdrStartFillingPage";
import Login from "@/src/objects/common/Login";
import {
  setupIncognitoContext,
  cleanupIncognitoContext,
} from "@/src/utils/helpers/linkTest";
import { formFillingRoomPdfContextMenuOption } from "@/src/utils/constants/files";

// File must be placed at data/rooms/PDF form with multi role.pdf
const MULTI_ROLE_PDF_PATH = "data/rooms/PDF form with multi role.pdf";
const MULTI_ROLE_PDF_NAME = "PDF form with multi role";
const VDR_ROOM_NAME = "VDRMultiRoleFilling";

test.describe("VDR room: multi-role form filling", () => {
  // Multi-user test with form filling flow
  test.describe.configure({ timeout: 300000 });

  let myRooms: MyRooms;
  let user1Name: string;
  let user1Email: string;
  let user1Password: string;

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    const filesTable = new FilesTable(page);
    await login.loginToPortal();

    // Create VDR room via API
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: VDR_ROOM_NAME,
      roomType: "VirtualDataRoom",
    });
    const roomBody = await roomResponse.json();
    const roomId = roomBody.response.id;

    // Create user and add them to the room so they appear in the people selector
    const { response: userResponse, userData } =
      await apiSdk.profiles.addMember("owner", "User");
    user1Name = `${userData.firstName} ${userData.lastName}`;
    user1Email = userData.email;
    user1Password = userData.password;
    const userBody = await userResponse.json();
    const user1Id = userBody.response.id;
    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: user1Id, access: "Editing" }],
      notify: false,
    });

    await apiSdk.files.uploadToFolder("owner", roomId, MULTI_ROLE_PDF_PATH);

    // Navigate to the room in UI and verify file is present
    await myRooms.openWithoutEmptyCheck();
    await myRooms.roomsTable.openRoomByName(VDR_ROOM_NAME);
    await filesTable.checkRowExist(MULTI_ROLE_PDF_NAME);
  });

  test("Owner assigns 3 roles and filling queue passes between users", async ({
    page,
    browser,
    api,
  }) => {
    let editorPage: Page;
    let user1Context: BrowserContext;
    let user1Page: Page;

    await test.step("Click Start filling from file context menu", async () => {
      const pagePromise = page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      const ownerFilesTable = new FilesTable(page);
      await ownerFilesTable.openContextMenuForItem(MULTI_ROLE_PDF_NAME);
      await ownerFilesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      editorPage = await pagePromise;
      await editorPage.waitForLoadState("load");
      const pdfFormEditor = new PdfFormEditor(editorPage);
      await pdfFormEditor.waitForLoad();
    });

    await test.step("Verify role assignment panel is visible", async () => {
      const rolesPanel = new VdrEditorRolesPanel(editorPage);
      await rolesPanel.checkPanelVisible();
      await rolesPanel.checkRoleSelectorVisible();
    });

    await test.step("Assign Anyone to the Anyone role", async () => {
      const rolesPanel = new VdrEditorRolesPanel(editorPage);
      await rolesPanel.clickRoleSelectorForRole("Anyone");
      await rolesPanel.selectUserByName(user1Name);
      await rolesPanel.submitRoleSelection();
    });

    await test.step("Assign current user (owner) to Role2", async () => {
      const rolesPanel = new VdrEditorRolesPanel(editorPage);
      await rolesPanel.clickRoleSelectorForRole("Role2");
      await rolesPanel.selectUserByName("admin-zero admin-zero");
      await rolesPanel.submitRoleSelection();
      await rolesPanel.checkAssignedUserNameByIndex(1, "admin-zero admin-zero");
    });

    await test.step("Assign created user to Role3", async () => {
      const rolesPanel = new VdrEditorRolesPanel(editorPage);
      await rolesPanel.clickRoleSelectorForRole("Role3");
      await rolesPanel.selectUserByName(user1Name);
      await rolesPanel.submitRoleSelection();
      await rolesPanel.checkAssignedUserNameByIndex(2, user1Name);
    });

    await test.step("Click Start to confirm role assignments", async () => {
      const rolesPanel = new VdrEditorRolesPanel(editorPage);
      await rolesPanel.clickStart();
    });

    await test.step("Verify role-based filling started successfully", async () => {
      const startFillingPage = new VdrStartFillingPage(editorPage);
      await startFillingPage.waitForPageLoad();
      await editorPage.waitForTimeout(5000);
    });

    await test.step("Verify start filling page content", async () => {
      const startFillingPage = new VdrStartFillingPage(editorPage);
      await startFillingPage.checkHeading();
      await startFillingPage.checkFillFormButtonNotVisible();
      await startFillingPage.checkCopyLinkButtonVisible();
      await startFillingPage.checkGoToRoomButtonVisible();
      await startFillingPage.checkRoleAssignmentsBlock(user1Name);
    });

    await test.step("Click Go to room and return to room", async () => {
      const startFillingPage = new VdrStartFillingPage(editorPage);
      await startFillingPage.clickGoToRoomButton();
      await editorPage.waitForLoadState("load");
    });

    await test.step("Owner sees In progress badge in room", async () => {
      const ownerFilesTable = new FilesTable(editorPage);
      await ownerFilesTable.expectInProgressBadgeVisible();
    });

    await test.step("User1 logs in and sees Your turn badge (Anyone filler)", async () => {
      ({ context: user1Context, page: user1Page } =
        await setupIncognitoContext(browser));
      const userLogin = new Login(user1Page, api.portalDomain);
      await userLogin.loginWithCredentials(user1Email, user1Password);
      const userRooms = new MyRooms(user1Page, api.portalDomain);
      await userRooms.openWithoutEmptyCheck();
      await userRooms.roomsTable.openRoomByName(VDR_ROOM_NAME);
      const userFilesTable = new FilesTable(user1Page);
      await userFilesTable.expectYourTurnBadgeVisible();
    });

    await test.step("User1 opens and fills form (Anyone role)", async () => {
      const userFilesTable = new FilesTable(user1Page);
      const pagePromise = user1Page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await userFilesTable.openContextMenuForItem(MULTI_ROLE_PDF_NAME);
      await userFilesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.fill,
      );
      const user1FormPage = await pagePromise;
      await user1FormPage.waitForLoadState("load");
      const pdfForm = new FilesPdfForm(user1FormPage);
      const sectionPage = await pdfForm.submitVdrRole();
      await sectionPage.checkSectionCompletedHeading();
      await user1FormPage.close();
    });

    await test.step("Owner sees Your turn badge for Role2", async () => {
      await editorPage.reload({ waitUntil: "load" });
      const ownerFilesTable = new FilesTable(editorPage);
      await ownerFilesTable.expectYourTurnBadgeVisible();
    });

    await test.step("Owner opens and fills form (Role2)", async () => {
      const ownerFilesTable = new FilesTable(editorPage);
      const pagePromise = editorPage
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await ownerFilesTable.openContextMenuForItem(MULTI_ROLE_PDF_NAME);
      await ownerFilesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.fill,
      );
      const ownerFormPage = await pagePromise;
      await ownerFormPage.waitForLoadState("load");
      const pdfForm = new FilesPdfForm(ownerFormPage);
      const sectionPage = await pdfForm.submitVdrRole();
      await sectionPage.checkSectionCompletedHeading();
      await ownerFormPage.close();
    });

    await test.step("User1 sees Your turn badge for Role3", async () => {
      await user1Page.bringToFront();
      await user1Page.reload({ waitUntil: "load" });
      const userFilesTable = new FilesTable(user1Page);
      await userFilesTable.expectYourTurnBadgeVisible();
    });

    await test.step("User1 opens and fills form (Role3)", async () => {
      const userFilesTable = new FilesTable(user1Page);
      const pagePromise = user1Page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await userFilesTable.openContextMenuForItem(MULTI_ROLE_PDF_NAME);
      await userFilesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.fill,
      );
      const user1FormPage2 = await pagePromise;
      await user1FormPage2.waitForLoadState("load");
      const pdfForm = new FilesPdfForm(user1FormPage2);
      const finalPage = await pdfForm.submitVdrRole();
      await finalPage.checkFinalizedHeading();
      await user1FormPage2.close();
    });

    await test.step("User1 sees Complete badge after all roles filled", async () => {
      await user1Page.reload({ waitUntil: "load" });
      const userFilesTable = new FilesTable(user1Page);
      await userFilesTable.expectCompleteBadgeVisible();
    });

    await test.step("Owner sees Complete badge after all roles filled", async () => {
      await editorPage.reload({ waitUntil: "load" });
      const ownerFilesTable = new FilesTable(editorPage);
      await ownerFilesTable.expectCompleteBadgeVisible();
    });

    await cleanupIncognitoContext(user1Context!, user1Page!);
  });
});

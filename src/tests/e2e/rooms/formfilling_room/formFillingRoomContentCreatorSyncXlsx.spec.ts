import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import PdfFormModal from "@/src/objects/rooms/PdfFormModal";
import Login from "@/src/objects/common/Login";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import {
  folderContextMenuOption,
  formFillingRoomPdfContextMenuOption,
  spreadsheetContextMenuOption,
} from "@/src/utils/constants/files";
import { formFillingSystemFolders } from "@/src/utils/constants/rooms";
import { apps } from "@/src/utils/constants/navigation";

// Split out from formFillingRoomContentCreatorPermissions.spec.ts: this is the
// heaviest test there (two full fill+submit PDF editor cycles), so it gets its
// own file to run in a separate Playwright worker instead of serially after
// the other three ContentCreator permission tests.
test.describe("FormFilling room - Content creator Sync XLSX permissions", () => {
  let myRooms: MyRooms;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- tour is temporarily not shown; kept for when it comes back
  let shortTour: ShortTour;
  let login: Login;

  let contentCreatorEmail: string;
  let contentCreatorPassword: string;
  let contentCreatorUserId: string;
  let roomName: string;
  let roomId: number;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    shortTour = new ShortTour(page);
    login = new Login(page, api.portalDomain);

    roomName = "FormFillingRoom_ContentCreator";
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: roomName,
      roomType: "FillingFormsRoom",
    });
    const roomBody = await roomResponse.json();
    roomId = roomBody.response.id;

    const { userData, response: contentCreatorResponse } =
      await apiSdk.profiles.addMember("owner", "User");
    contentCreatorEmail = userData.email;
    contentCreatorPassword = userData.password;
    const contentCreatorBody = await contentCreatorResponse.json();
    contentCreatorUserId = contentCreatorBody.response.id;
  });

  test("Verify Sync responses to XLSX access by ContentCreator role", async ({
    page,
    apiSdk,
  }) => {
    // CC's own form (uploaded from DocSpace templates, not in room yet)
    const CC_FORM = "ONLYOFFICE Resume Sample";
    // Owner's form (uploaded by owner in setup)
    const OWNER_FORM = "PDF from device";

    // Helper: fill and submit a form that is already in filling mode.
    // Opens the editor in a new tab, submits, and closes the tab.
    const fillAndSubmit = async (formName: string) => {
      const pagePromise = page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await myRooms.filesTable.openContextMenuForItem(formName);
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.fill,
      );
      const pdfPage = await pagePromise;
      await pdfPage.waitForLoadState("load");
      const pdfForm = new FilesPdfForm(pdfPage);
      await pdfForm.waitForEditorFrame();
      const completed = await pdfForm.clickSubmitButton();
      await completed.waitForPageLoad();
      await pdfPage.close();
      await page.reload({ waitUntil: "load" });
    };

    // Phase 1: owner adds CC to room and submits own form.
    // After this, "PDF from device" submission folder exists in Complete.
    await test.step("Setup: Owner adds CC to room and submits own form", async () => {
      await apiSdk.files.uploadToFolder(
        "owner",
        roomId,
        "data/rooms/PDF from device.pdf",
      );

      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: contentCreatorUserId, access: "ContentCreator" }],
        notify: false,
      });

      await login.loginToPortal();
      // Form Set rooms live under the Forms app, not the Rooms list

      await myRooms.sidebar.navigate(apps.forms);
      await myRooms.roomsTable.openRoomByName(roomName);
      // Tour is temporarily not shown; may come back later.
      // await shortTour.clickSkipTour();

      // Owner starts filling and submits own form
      await myRooms.filesTable.openContextMenuForItem(OWNER_FORM);
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      await new PdfFormModal(page).close();
      await myRooms.filesTable.expectFillingIconVisible(OWNER_FORM);
      await fillAndSubmit(OWNER_FORM);

      await page.context().clearCookies();
    });

    // Phase 2: CC uploads own form, submits own form, submits owner's form,
    // then verifies syncResponsesToXlsx access in Complete without logging out.
    await test.step("ContentCreator: upload own form and submit both forms", async () => {
      await login.loginWithCredentials(
        contentCreatorEmail,
        contentCreatorPassword,
      );
      await myRooms.sidebar.navigate(apps.forms);
      await myRooms.roomsTable.openRoomByName(roomName);
      // Tour is temporarily not shown; may come back later.
      // await shortTour.clickSkipTour();

      // Upload CC's own form from DocSpace templates
      await myRooms.filesNavigation.openCreateDropdown();
      await myRooms.filesNavigation.contextMenu.clickSubmenuOption(
        "Upload PDF form",
        "From the workspace",
      );
      const selectPanel = new RoomSelectPanel(page);
      await selectPanel.checkSelectorExist();
      await selectPanel.select("documents");
      await selectPanel.selectItemByText(CC_FORM);
      await selectPanel.confirmSelection();
      await page.waitForLoadState("load");
      await expect(page.getByText(CC_FORM)).toBeVisible();

      // CC starts filling and submits own form
      await myRooms.filesTable.openContextMenuForItem(CC_FORM);
      await myRooms.filesTable.contextMenu.clickOption(
        formFillingRoomPdfContextMenuOption.startFilling,
      );
      await new PdfFormModal(page).close();
      await myRooms.filesTable.expectFillingIconVisible(CC_FORM);
      await fillAndSubmit(CC_FORM);

      // CC also submits owner's form (already in filling mode from Phase 1)
      await fillAndSubmit(OWNER_FORM);
    });

    await test.step("Verify Sync responses to XLSX IS visible for CC on own original form", async () => {
      await myRooms.filesTable.openContextMenuForItem(CC_FORM);
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          formFillingRoomPdfContextMenuOption.syncResponsesToXlsx,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Sync responses to XLSX IS visible for CC on owner's original form", async () => {
      await myRooms.filesTable.openContextMenuForItem(OWNER_FORM);
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          formFillingRoomPdfContextMenuOption.syncResponsesToXlsx,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("ContentCreator navigates to Complete folder", async () => {
      await myRooms.filesTable.openContextMenuForItem(
        formFillingSystemFolders.complete,
      );
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.open,
      );
      await expect(
        page.getByRole("heading", {
          name: formFillingSystemFolders.complete,
        }),
      ).toBeVisible();
    });

    await test.step("Verify Sync responses to XLSX IS visible for CC on own form submission folder", async () => {
      await myRooms.filesTable.openContextMenuForItem(CC_FORM);
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.syncResponsesToXlsx,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Verify Sync responses to XLSX IS visible for CC on owner's form submission folder", async () => {
      await myRooms.filesTable.openContextMenuForItem(OWNER_FORM);
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          folderContextMenuOption.syncResponsesToXlsx,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });

    await test.step("Navigate into own form submission folder and verify sync visible on XLSX", async () => {
      await myRooms.filesTable.openContextMenuForItem(CC_FORM);
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.open,
      );
      await expect(page.getByRole("heading", { name: CC_FORM })).toBeVisible();
      await myRooms.filesTable.expectXlsxItemVisible(10000);
      await myRooms.filesTable.openContextMenuForXlsxItem();
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          spreadsheetContextMenuOption.syncResponsesToXlsx,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
      await myRooms.filesNavigation.gotoBack();
    });

    await test.step("Navigate into owner's form submission folder and verify sync visible on XLSX", async () => {
      await myRooms.filesTable.openContextMenuForItem(OWNER_FORM);
      await myRooms.filesTable.contextMenu.clickOption(
        folderContextMenuOption.open,
      );
      await expect(
        page.getByRole("heading", { name: OWNER_FORM }),
      ).toBeVisible();
      await myRooms.filesTable.expectXlsxItemVisible(10000);
      await myRooms.filesTable.openContextMenuForXlsxItem();
      await expect(
        myRooms.filesTable.contextMenu.getItemLocator(
          spreadsheetContextMenuOption.syncResponsesToXlsx,
        ),
      ).toBeVisible();
      await myRooms.filesTable.contextMenu.close();
    });
  });
});

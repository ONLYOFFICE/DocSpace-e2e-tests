import { test } from "@/src/fixtures";
import { expect, Page } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import RoomsCreateDialog from "@/src/objects/rooms/RoomsCreateDialog";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";
import RoomEmptyView from "@/src/objects/rooms/RoomEmptyView";
import FilesPdfForm from "@/src/objects/files/FilesPdfForm";
import RoomPDFCompleted from "@/src/objects/rooms/RoomPDFCompleted";
import FilesTable from "@/src/objects/files/FilesTable";
import {
  roomCreateTitles,
  roomContextMenuOption,
  formFillingSystemFolders,
} from "@/src/utils/constants/rooms";
import Login from "@/src/objects/common/Login";

test.describe("FormFilling room: creation settings", () => {
  let myRooms: MyRooms;
  let createDialog: RoomsCreateDialog;
  let shortTour: ShortTour;
  let selectPanel: RoomSelectPanel;
  let roomEmptyView: RoomEmptyView;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    createDialog = new RoomsCreateDialog(page);
    shortTour = new ShortTour(page);
    selectPanel = new RoomSelectPanel(page);
    roomEmptyView = new RoomEmptyView(page);
    await login.loginToPortal();
    await myRooms.roomsArticle.openCreateDialog();
    await createDialog.openRoomType(roomCreateTitles.formFilling);
  });

  test("Default state: toggles are in correct positions and Go to Integrations link is visible", async () => {
    await test.step("Verify Collect results in XLSX is enabled by default", async () => {
      await createDialog.expectSaveFormAsXlsxChecked(true);
    });

    await test.step("Verify Send form to external DB is disabled by default", async () => {
      await createDialog.expectSendFormToExternalDbChecked(false);
    });

    await test.step("Verify Go to Integrations link is visible", async () => {
      await expect(createDialog.goToIntegrationsLink).toBeVisible();
    });
  });

  test("Go to Integrations link opens Database connection panel", async ({
    page,
  }) => {
    await test.step("Verify Go to Integrations link is visible and has correct href", async () => {
      await expect(createDialog.goToIntegrationsLink).toBeVisible();
      await expect(createDialog.goToIntegrationsLink).toHaveAttribute(
        "href",
        /\/portal-settings\/integration\/third-party-services\?consumer=externaldb/,
      );
    });

    await test.step("Click link and verify Database connection panel opens", async () => {
      await createDialog.goToIntegrationsLink.click();
      await page.waitForURL(
        /\/portal-settings\/integration\/third-party-services\?consumer=externaldb/,
      );
      await expect(page.locator("#modal-header-swipe")).toBeVisible();
      await expect(
        page.locator("#modal-header-swipe").getByText("Database connection"),
      ).toBeVisible();
    });
  });

  // TODO: functionality not yet implemented
  test.skip("Enabling Send form to external DB: setting persists and form submission completes successfully", async ({
    page,
  }) => {
    const roomName = "FormFillingExternalDb";
    let newPage: Page;

    await test.step("Enable Send form to external DB toggle", async () => {
      await createDialog.toggleSendFormToExternalDb(true);
    });

    await test.step("Create the room", async () => {
      await createDialog.fillRoomName(roomName);
      await createDialog.clickRoomDialogSubmit();
      await expect(
        page.getByText("Welcome to the Form Filling Room!"),
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step("Skip short tour", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.close();
    });

    await test.step("Verify toggle is enabled in edit dialog", async () => {
      await myRooms.navigation.openContextMenu();
      await myRooms.navigation.contextMenu.menu
        .getByText(roomContextMenuOption.editRoom)
        .click();
      await myRooms.roomsEditDialog.checkDialogTitleExist();
      await createDialog.expectSendFormToExternalDbChecked(true);
      await myRooms.roomsEditDialog.clickSaveButton();
    });

    await test.step("Upload PDF form from DocSpace", async () => {
      await roomEmptyView.uploadPdfFromDocSpace();
      await selectPanel.checkSelectorExist();
      await selectPanel.select("documents");
      await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
      await selectPanel.confirmSelection();
      await myRooms.infoPanel.close();
      await expect(
        page.getByText("ONLYOFFICE Resume Sample", { exact: true }),
      ).toBeVisible();
    });

    await test.step("Start filling the form", async () => {
      const filesTable = new FilesTable(page);
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Start filling");
      await shortTour.clickModalCloseButton();
    });

    await test.step("Fill and submit the form", async () => {
      const filesTable = new FilesTable(page);
      const pagePromise = page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Fill");
      newPage = await pagePromise;
      await newPage.waitForLoadState("load");
      const pdfForm = new FilesPdfForm(newPage);
      const pdfCompleted = new RoomPDFCompleted(newPage);
      await pdfForm.clickSubmitButton();
      await pdfCompleted.chooseBackToRoom();
      await expect(
        newPage.getByText("ONLYOFFICE Resume Sample", { exact: true }),
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step("Open Complete folder and verify submitted form is present", async () => {
      const filesTable = new FilesTable(newPage);
      await filesTable.openContextMenuForItem(
        formFillingSystemFolders.complete,
      );
      await filesTable.contextMenu.clickOption("Open");
      await expect(
        newPage.getByRole("heading", {
          name: formFillingSystemFolders.complete,
        }),
      ).toBeVisible();
      await expect(
        newPage.getByText("ONLYOFFICE Resume Sample", { exact: true }),
      ).toBeVisible();
    });
  });

  // TODO: Bug 80762
  test.skip("Disabling Collect results in XLSX: no XLSX file appears in Complete folder after form submission", async ({
    page,
  }) => {
    const roomName = "FormFillingNoXlsx";
    let newPage: Page;

    await test.step("Disable Collect results in XLSX toggle", async () => {
      await createDialog.toggleSaveFormAsXlsx(false);
    });

    await test.step("Create the room", async () => {
      await createDialog.fillRoomName(roomName);
      await createDialog.clickRoomDialogSubmit();
      await expect(
        page.getByText("Welcome to the Form Filling Room!"),
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step("Skip short tour", async () => {
      await shortTour.clickSkipTour();
      await myRooms.infoPanel.close();
    });

    await test.step("Verify toggle is disabled in edit dialog", async () => {
      await myRooms.navigation.openContextMenu();
      await myRooms.navigation.contextMenu.menu
        .getByText(roomContextMenuOption.editRoom)
        .click();
      await myRooms.roomsEditDialog.checkDialogTitleExist();
      await createDialog.expectSaveFormAsXlsxChecked(false);
      await myRooms.roomsEditDialog.clickSaveButton();
    });

    await test.step("Upload PDF form from DocSpace", async () => {
      await roomEmptyView.uploadPdfFromDocSpace();
      await selectPanel.checkSelectorExist();
      await selectPanel.select("documents");
      await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
      await selectPanel.confirmSelection();
      await myRooms.infoPanel.close();
      await expect(
        page.getByText("ONLYOFFICE Resume Sample", { exact: true }),
      ).toBeVisible();
    });

    await test.step("Start filling the form", async () => {
      const filesTable = new FilesTable(page);
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Start filling");
      await shortTour.clickModalCloseButton();
    });

    await test.step("Fill and submit the form", async () => {
      const filesTable = new FilesTable(page);
      const pagePromise = page
        .context()
        .waitForEvent("page", { timeout: 30000 });
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Fill");
      newPage = await pagePromise;
      await newPage.waitForLoadState("load");
      const pdfForm = new FilesPdfForm(newPage);
      const pdfCompleted = new RoomPDFCompleted(newPage);
      await pdfForm.clickSubmitButton();
      await pdfCompleted.chooseBackToRoom();
      await expect(
        newPage.getByText("ONLYOFFICE Resume Sample", { exact: true }),
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step("Open Complete folder and verify no XLSX file is present", async () => {
      const filesTable = new FilesTable(newPage);
      await filesTable.openContextMenuForItem(
        formFillingSystemFolders.complete,
      );
      await filesTable.contextMenu.clickOption("Open");
      await expect(
        newPage.getByRole("heading", {
          name: formFillingSystemFolders.complete,
        }),
      ).toBeVisible();
      await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
      await filesTable.contextMenu.clickOption("Open");
      await expect(
        newPage.getByLabel("ONLYOFFICE Resume Sample,"),
      ).not.toBeVisible();
    });
  });
});

test.describe("FormFilling room: creation settings - database connection feature availability by portal role", () => {
  let roomAdminEmail: string;
  let roomAdminPassword: string;
  let docSpaceAdminEmail: string;
  let docSpaceAdminPassword: string;

  test.beforeEach(async ({ apiSdk }) => {
    const [rmResult, dsaResult] = await Promise.all([
      apiSdk.profiles.addMember("owner", "RoomAdmin"),
      apiSdk.profiles.addMember("owner", "DocSpaceAdmin"),
    ]);
    roomAdminEmail = rmResult.userData.email;
    roomAdminPassword = rmResult.userData.password;
    docSpaceAdminEmail = dsaResult.userData.email;
    docSpaceAdminPassword = dsaResult.userData.password;
  });

  test("Room admin: Collect results in XLSX toggle is enabled, Send form to external DB toggle is disabled", async ({
    page,
    api,
  }) => {
    const login = new Login(page, api.portalDomain);
    await login.loginWithCredentials(roomAdminEmail, roomAdminPassword);
    const myRooms = new MyRooms(page, api.portalDomain);
    await myRooms.open();
    await myRooms.roomsArticle.openCreateDialog();
    const createDialog = new RoomsCreateDialog(page);
    await createDialog.openRoomType(roomCreateTitles.formFilling);

    await test.step("Verify Collect results in XLSX toggle is visible and enabled", async () => {
      await createDialog.checkXlsxToggleEnabled();
    });

    await test.step("Verify Send form to external DB toggle is visible but disabled", async () => {
      await createDialog.checkExternalDbToggleDisabled();
      await createDialog.checkExternalDbDisabledDescription();
    });
  });

  test("DocSpace admin: Collect results in XLSX toggle is enabled, Send form to external DB toggle is disabled", async ({
    page,
    api,
  }) => {
    const login = new Login(page, api.portalDomain);
    await login.loginWithCredentials(docSpaceAdminEmail, docSpaceAdminPassword);
    const myRooms = new MyRooms(page, api.portalDomain);
    await myRooms.open();
    await myRooms.roomsArticle.openCreateDialog();
    const createDialog = new RoomsCreateDialog(page);
    await createDialog.openRoomType(roomCreateTitles.formFilling);

    await test.step("Verify Collect results in XLSX toggle is visible and enabled", async () => {
      await createDialog.checkXlsxToggleEnabled();
    });

    await test.step("Verify Send form to external DB toggle is visible but disabled", async () => {
      await createDialog.checkExternalDbToggleDisabled();
    });
  });
});

import { test } from "@/src/fixtures";
import StorageManagement from "@/src/objects/settings/storageManagement/StorageManagement";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import MyRooms from "@/src/objects/rooms/Rooms";
import MyDocuments from "@/src/objects/files/MyDocuments";
import { PaymentApi } from "@/src/api/payment";
import { toastMessages } from "@/src/utils/constants/settings";
import {
  roomCreateTitles,
  roomDialogSource,
} from "@/src/utils/constants/rooms";

test.describe("Storage Management: settings", () => {
  let storageManagement: StorageManagement;

  test.beforeEach(async ({ page, api, login }) => {
    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();
    storageManagement = new StorageManagement(page);
    await login.loginToPortal();
    await storageManagement.open();
  });

  test("Quota toggle, combobox switch and save for all quota types", async ({
    page,
  }) => {
    await test.step("Storage Management Render", async () => {
      await storageManagement.checkStorageManagementRender();
    });

    await test.step("Storage Management guide link", async () => {
      const page1Promise = page.waitForEvent("popup", { timeout: 30000 });
      await storageManagement.storageManagementGuideLink.click();
      const page1 = await page1Promise;
      await page1.waitForURL(
        /https:\/\/helpcenter\.onlyoffice\.com\/docspace\/configuration\/docspace-storage-management-settings\.aspx/,
      );
      await page1.close();
    });

    await test.step("Quota Room Activate", async () => {
      await storageManagement.QuotaRoomActivate();
      await storageManagement.dismissToastSafely(
        toastMessages.roomQuotaEnabled,
      );
    });

    await test.step("Quota User Activate", async () => {
      await storageManagement.QuotaUserActivate();
      await storageManagement.dismissToastSafely(
        toastMessages.userQuotaEnabled,
      );
    });

    await test.step("Quota AI Agent Activate", async () => {
      await storageManagement.QuotaAiAgentActivate();
      await storageManagement.dismissToastSafely(toastMessages.aiQuotaEnabled);
    });
  });

  test("Recalculate button updates the last recalculate date", async () => {
    await test.step("Click Recalculate", async () => {
      await storageManagement.clickRecalculate();
    });

    await test.step("Verify last update date is visible", async () => {
      await storageManagement.expectRecalculateDateVisible();
    });
  });

  test("Room quota cancel does not save changes", async () => {
    await test.step("Enable room quota then cancel", async () => {
      await storageManagement.onOffQuotaRoom.click();
      await storageManagement.textInputRoom.fill("100");
      await storageManagement.cancelButtonRoom.click();
    });

    await test.step("Verify quota is not enabled", async () => {
      await storageManagement.expectQuotaRoomDisabled();
    });
  });
});

test.describe("Storage Management: room quota enforcement", () => {
  let storageManagement: StorageManagement;
  let myRooms: MyRooms;
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();
    storageManagement = new StorageManagement(page);
    myRooms = new MyRooms(page, api.portalDomain);
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("Room with existing files shows quota exceeded warning", async () => {
    await test.step("Create a room and add a document", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.createRoom("Quota Exceed Room");
      await myDocuments.createDocumentFile("Existing Doc");
    });

    await test.step("Set room quota to 1 KB", async () => {
      await storageManagement.open();
      await storageManagement.enableRoomQuota("1", "KB");
      await storageManagement.dismissToastSafely(
        toastMessages.roomQuotaEnabled,
      );
    });

    await test.step("Navigate to the room and verify quota exceeded warning", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName("Quota Exceed Room");
      await storageManagement.expectQuotaExceededWarning();
    });
  });

  test("Upload file to room over quota shows error toast", async () => {
    await test.step("Create a room and add a document", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.createRoom("Upload Quota Room");
      await myDocuments.createDocumentFile("Seed Doc");
    });

    await test.step("Set room quota to 1 KB", async () => {
      await storageManagement.open();
      await storageManagement.enableRoomQuota("1", "KB");
      await storageManagement.dismissToastSafely(
        toastMessages.roomQuotaEnabled,
      );
    });

    await test.step("Navigate to room, upload a file and verify toast", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName("Upload Quota Room");
      await myRooms.filesNavigation.uploadFiles("data/avatars/AvatarPNG.png");
      await storageManagement.expectQuotaExceededToast();
    });
  });

  test("Create document in empty room over quota - document does not persist", async ({
    page,
  }) => {
    await test.step("Create a room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.createRoom("Empty Quota Room");
    });

    await test.step("Set room quota to 1 KB", async () => {
      await storageManagement.open();
      await storageManagement.enableRoomQuota("1", "KB");
      await storageManagement.dismissToastSafely(
        toastMessages.roomQuotaEnabled,
      );
    });

    await test.step("Navigate to room and try to create a document", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName("Empty Quota Room");
      await page.reload({ waitUntil: "load" });
      await myDocuments.createDocumentFile("Ghost Doc", false);
    });

    await test.step("Reload and verify document was not saved", async () => {
      await page.reload({ waitUntil: "load" });
      await myRooms.filesTable.checkRowNotExist("Ghost Doc");
    });
  });
});

test.describe("Storage Management: user quota enforcement", () => {
  let storageManagement: StorageManagement;
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();
    storageManagement = new StorageManagement(page);
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
  });

  // TODO: integrationUITests=true suppresses snackbar, cannot override from test
  test.skip("User quota exceeded shows snackbar in My Documents", async ({
    page,
  }) => {
    await test.step("Create a document to have data in My Documents", async () => {
      await myDocuments.open();
      await myDocuments.createDocumentFile("Fill Space");
    });

    await test.step("Set user quota to 1 KB", async () => {
      await storageManagement.open();
      await storageManagement.enableUserQuota("1", "KB");
      await storageManagement.dismissToastSafely(
        toastMessages.userQuotaEnabled,
      );
    });

    await test.step("Navigate to My Documents and verify snackbar", async () => {
      await myDocuments.open();
      await page.reload({ waitUntil: "load" });
      await storageManagement.expectUserQuotaExceededSnackbar();
    });
  });

  test("User quota exceeded - new document does not persist", async ({
    page,
  }) => {
    await test.step("Create a document to exceed future quota", async () => {
      await myDocuments.open();
      await myDocuments.createDocumentFile("Fill Space");
    });

    await test.step("Set user quota to 1 KB", async () => {
      await storageManagement.open();
      await storageManagement.enableUserQuota("1", "KB");
      await storageManagement.dismissToastSafely(
        toastMessages.userQuotaEnabled,
      );
    });

    await test.step("Navigate to My Documents and try to create a document", async () => {
      await myDocuments.open();
      await myDocuments.createDocumentFile("Quota User Doc", false);
    });

    await test.step("Reload and verify document was not saved", async () => {
      await page.reload({ waitUntil: "load" });
      await myDocuments.filesTable.checkRowNotExist("Quota User Doc");
    });
  });

  test("User quota exceeded - upload file shows error toast", async () => {
    await test.step("Create a document to exceed future quota", async () => {
      await myDocuments.open();
      await myDocuments.createDocumentFile("Fill Space");
    });

    await test.step("Set user quota to 1 KB", async () => {
      await storageManagement.open();
      await storageManagement.enableUserQuota("1", "KB");
      await storageManagement.dismissToastSafely(
        toastMessages.userQuotaEnabled,
      );
    });

    await test.step("Navigate to My Documents and upload a file", async () => {
      await myDocuments.open();
      await myDocuments.filesNavigation.uploadFiles(
        "data/avatars/AvatarPNG.png",
      );
      await storageManagement.expectUserQuotaExceededToast();
    });
  });
});

test.describe("Storage Management: room quota banners", () => {
  let storageManagement: StorageManagement;
  let myRooms: MyRooms;
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    await paymentApi.setupPayment();
    storageManagement = new StorageManagement(page);
    myRooms = new MyRooms(page, api.portalDomain);
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
    await storageManagement.open();
    await storageManagement.enableRoomQuota("500");
    await storageManagement.dismissToastSafely(toastMessages.roomQuotaEnabled);
  });

  test("Quota exceeded room - document opens in view mode with banner", async ({
    page,
  }) => {
    await test.step("Create a room and add a document", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.createRoom("Editor Banner Room");
      await myDocuments.createDocumentFile("Banner Doc");
    });

    await test.step("Set room quota to 1 KB via Details panel", async () => {
      const roomInfoPanel = new RoomInfoPanel(page);
      await roomInfoPanel.open();
      await roomInfoPanel.openTab("Details");
      await roomInfoPanel.setRoomQuota("1", "KB");
    });

    await test.step("Open document and verify view mode with quota banner", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName("Editor Banner Room");
      const editor = await myDocuments.openDocumentInEditor("Banner Doc");
      editor.setupConsoleCapture();
      await editor.waitForLoad();
      await editor.checkViewMode();
      await editor.expectQuotaExceededSnackbar();
      await editor.close();
    });
  });

  test("Quota exceeded room - room shows storage limit warning", async ({
    page,
  }) => {
    await test.step("Create a room and add a document", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.createRoom("Warning Banner Room");
      await myDocuments.createDocumentFile("Fill Doc");
    });

    await test.step("Set room quota to 1 KB via Details panel", async () => {
      const roomInfoPanel = new RoomInfoPanel(page);
      await roomInfoPanel.open();
      await roomInfoPanel.openTab("Details");
      await roomInfoPanel.setRoomQuota("1", "KB");
    });

    await test.step("Navigate to room and verify storage limit warning", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName("Warning Banner Room");
      await myRooms.expectRoomStorageLimitExceeded();
    });
  });

  test("Quota exceeded room - creating new document shows banner in editor", async ({
    page,
  }) => {
    await test.step("Create a room and add a document to fill space", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.createRoom("Quota Create Room");
      await myDocuments.createDocumentFile("Fill Doc");
    });

    await test.step("Set room quota to 1 KB via Details panel", async () => {
      const roomInfoPanel = new RoomInfoPanel(page);
      await roomInfoPanel.open();
      await roomInfoPanel.openTab("Details");
      await roomInfoPanel.setRoomQuota("1", "KB");
    });

    await test.step("Create new document and verify quota banner in editor", async () => {
      const editor = await myDocuments.createDocumentAndOpenEditor("New Doc");
      await editor.waitForFrame();
      await editor.expectQuotaExceededBanner();
      await editor.close();
    });
  });

  test("Quota exceeded room - upload file shows error toast", async ({
    page,
  }) => {
    await test.step("Create a room and add a document to fill space", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.createRoom("Upload Quota Room");
      await myDocuments.createDocumentFile("Fill Doc");
    });

    await test.step("Set room quota to 1 KB via Details panel", async () => {
      const roomInfoPanel = new RoomInfoPanel(page);
      await roomInfoPanel.open();
      await roomInfoPanel.openTab("Details");
      await roomInfoPanel.setRoomQuota("1", "KB");
    });

    await test.step("Upload file and verify quota exceeded toast", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName("Upload Quota Room");
      await myRooms.filesNavigation.uploadFiles("data/avatars/AvatarPNG.png");
      await storageManagement.expectQuotaExceededToast();
    });
  });

  test("No quota option removes storage limit warning", async ({ page }) => {
    await test.step("Create a room and add a document", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.createRoom("No Quota Room");
      await myDocuments.createDocumentFile("Fill Doc");
    });

    await test.step("Set room quota to 1 KB and verify warning", async () => {
      const roomInfoPanel = new RoomInfoPanel(page);
      await roomInfoPanel.open();
      await roomInfoPanel.openTab("Details");
      await roomInfoPanel.setRoomQuota("1", "KB");
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName("No Quota Room");
      await myRooms.expectRoomStorageLimitExceeded();
    });

    await test.step("Set No quota and verify warning is gone", async () => {
      const roomInfoPanel = new RoomInfoPanel(page);
      await roomInfoPanel.open();
      await roomInfoPanel.openTab("Details");
      await roomInfoPanel.selectNoQuota();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName("No Quota Room");
      await myRooms.expectRoomStorageLimitNotExceeded();
    });
  });

  test("Default quota option removes per-room limit", async ({ page }) => {
    await test.step("Create a room and add a document", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.createRoom("Default Quota Room");
      await myDocuments.createDocumentFile("Fill Doc");
    });

    await test.step("Set room quota to 1 KB and verify warning", async () => {
      const roomInfoPanel = new RoomInfoPanel(page);
      await roomInfoPanel.open();
      await roomInfoPanel.openTab("Details");
      await roomInfoPanel.setRoomQuota("1", "KB");
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName("Default Quota Room");
      await myRooms.expectRoomStorageLimitExceeded();
    });

    await test.step("Set Default quota and verify warning is gone", async () => {
      const roomInfoPanel = new RoomInfoPanel(page);
      await roomInfoPanel.open();
      await roomInfoPanel.openTab("Details");
      await roomInfoPanel.selectDefaultQuota();
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName("Default Quota Room");
      await myRooms.expectRoomStorageLimitNotExceeded();
    });
  });
});

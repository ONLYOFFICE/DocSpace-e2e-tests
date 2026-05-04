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

test.describe("Room quota: banners", () => {
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
      await editor.expectQuotaExceededBanner();
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

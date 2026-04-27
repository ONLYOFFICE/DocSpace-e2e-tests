import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import config from "@/config";
import MyDocuments from "@/src/objects/files/MyDocuments";
import MyRooms from "@/src/objects/rooms/Rooms";
import Trash from "@/src/objects/trash/Trash";
import FileVersionHistory from "@/src/objects/files/FileVersionHistory";
import VdrRoomSettings from "@/src/objects/rooms/VdrRoomSettings";
import { Profile } from "@/src/objects/profile/Profile";
import { createMailChecker } from "@/src/utils/helpers/email/createMailChecker";
import { getOwnerConfirmLink } from "@/src/utils/helpers/email/getOwnerConfirmLink";
import {
  roomCreateTitles,
  roomDialogSource,
  roomContextMenuOption,
} from "@/src/utils/constants/rooms";

test.describe("Daily prod check", () => {
  test.skip(
    !process.env.RUN_PROD_CHECK,
    "Runs only in Prod Daily Check workflow",
  );
  test.describe("Rooms", () => {
    let myRooms: MyRooms;

    test.beforeEach(async ({ page, api, login }) => {
      myRooms = new MyRooms(page, api.portalDomain);
      await login.loginToPortal();
    });

    test("Create all room types", async ({ page }) => {
      const vdr = new VdrRoomSettings(page);
      await myRooms.openWithoutEmptyCheck();

      await test.step("Create Collaboration room", async () => {
        await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
        await myRooms.roomsCreateDialog.openRoomType(
          roomCreateTitles.collaboration,
        );
        await myRooms.roomsCreateDialog.createRoom("Collaboration");
        await myRooms.backToRooms();
        await myRooms.roomsTable.checkRowExist("Collaboration");
      });

      await test.step("Create Public room", async () => {
        await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
        await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
        await myRooms.roomsCreateDialog.createRoom("Public");
        await myRooms.backToRooms();
        await myRooms.roomsTable.checkRowExist("Public");
      });

      await test.step("Create Custom room", async () => {
        await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
        await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.custom);
        await myRooms.roomsCreateDialog.createRoom("Custom");
        await myRooms.backToRooms();
        await myRooms.roomsTable.checkRowExist("Custom");
      });

      await test.step("Create Form Filling room", async () => {
        await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
        await myRooms.roomsCreateDialog.openRoomType(
          roomCreateTitles.formFilling,
        );
        await myRooms.roomsCreateDialog.createRoom("FormFilling");
        const tipsModal = page.getByText("Welcome to the Form Filling Room!");
        await expect(tipsModal).toBeVisible({ timeout: 10000 });
        await page.mouse.click(1, 1);
        await myRooms.backToRooms();
        await myRooms.roomsTable.checkRowExist("FormFilling");
      });

      await test.step("Create VDR room", async () => {
        await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
        await myRooms.roomsCreateDialog.openRoomType(
          roomCreateTitles.virtualData,
        );
        await vdr.expectAutomaticIndexingChecked(true);
        await vdr.expectWatermarksChecked(true);
        await myRooms.roomsCreateDialog.createRoom("VDR");
        await myRooms.backToRooms();
        await myRooms.roomsTable.checkRowExist("VDR");
      });
    });

    test("Search rooms", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.createRoom("SearchTarget");
      await myRooms.backToRooms();

      await myRooms.roomsFilter.fillRoomsSearchInputAndCheckRequest(
        "SearchTarget",
      );
      await myRooms.roomsTable.checkRowExist("SearchTarget");
    });

    test("Archive room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
      await myRooms.roomsCreateDialog.createRoom("ArchiveTest");
      await myRooms.backToRooms();

      await myRooms.roomsTable.openContextMenu("ArchiveTest");
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.moveToArchive,
      );
      await myRooms.moveToArchive();
      await myRooms.roomsTable.checkRowNotExist("ArchiveTest");
    });
  });

  test.describe("Documents", () => {
    let myDocuments: MyDocuments;

    test.beforeEach(async ({ page, api, login }) => {
      myDocuments = new MyDocuments(page, api.portalDomain);
      await login.loginToPortal();
      await myDocuments.open();
    });

    test("Render Documents", async () => {
      await myDocuments.filesTable.checkInitialDocsExist();
    });

    test("Create all document types and verify editors open", async () => {
      await test.step("Create document and open editor", async () => {
        const docEditor = await myDocuments.createDocumentAndOpenEditor("Doc");
        await docEditor.waitForLoad();
        await docEditor.close();
      });

      await test.step("Create spreadsheet and open editor", async () => {
        const sheetEditor =
          await myDocuments.createSpreadsheetAndOpenEditor("Sheet");
        await sheetEditor.waitForLoad();
        await sheetEditor.close();
      });

      await test.step("Create presentation and open editor", async () => {
        const slideEditor =
          await myDocuments.createPresentationAndOpenEditor("Slides");
        await slideEditor.waitForLoad();
        await slideEditor.close();
      });

      await test.step("Create PDF form and open editor", async () => {
        const pdfEditor = await myDocuments.createPdfFormAndOpenEditor("PDF");
        await pdfEditor.waitForLoad();
        await pdfEditor.close();
      });
    });

    test("Download file in original format", async () => {
      await myDocuments.createDocumentFile("DownloadDoc");
      await myDocuments.downloadOriginalFile("DownloadDoc", ".docx");
    });

    test("Convert and download file as PDF", async () => {
      await myDocuments.createDocumentFile("ConvertDoc");
      await myDocuments.downloadFileAs(".pdf", "ConvertDoc");
    });

    test("Delete file", async () => {
      await myDocuments.createDocumentFile("DeleteDoc");
      await myDocuments.deleteFile("DeleteDoc");
    });

    test("Search Documents", async () => {
      await myDocuments.createDocumentFile("FindMe");
      await myDocuments.filesFilter.fillFilesSearchInputAndCheckRequest(
        "FindMe",
      );
      await myDocuments.filesTable.checkRowExist("FindMe");
    });

    test("Open editor, edit, and verify new version arrives via WebSocket", async ({
      page,
    }) => {
      const versionHistory = new FileVersionHistory(page);

      await test.step("Create document, type text and save", async () => {
        const editor =
          await myDocuments.createDocumentAndOpenEditor("EditorCheck");
        await editor.editAndClose(
          [
            "Daily production check: editor opens and accepts keyboard input",
            "Document saves correctly and creates a new version via WebSocket",
            "All core features are working: rooms, documents, trash, settings",
            "Automated Playwright test verifying end-to-end document editing flow",
            "This file was created, edited and saved on the production environment",
          ].join("\n"),
        );
      });

      await test.step("Open version history and verify version 2 exists", async () => {
        await myDocuments.openVersionHistory("EditorCheck");
        await versionHistory.checkVersionCount(2, 60000);
      });
    });
  });

  test.describe("Trash", () => {
    let myDocuments: MyDocuments;
    let trash: Trash;

    test.beforeEach(async ({ page, api, login }) => {
      myDocuments = new MyDocuments(page, api.portalDomain);
      trash = new Trash(page);
      await login.loginToPortal();
    });

    test("Delete file from Trash", async () => {
      await myDocuments.open();
      await myDocuments.createDocumentFile("TrashDoc");

      await myDocuments.filesTable.openContextMenuForItem("TrashDoc");
      await myDocuments.filesTable.contextMenu.clickOption("Delete");
      await myDocuments.folderDeleteModal.clickDeleteFolder();
      await myDocuments.removeToast("successfully moved to Trash");

      await trash.open();
      await trash.deleteFileForever("TrashDoc");
    });

    test("Restore file from Trash", async () => {
      await myDocuments.open();
      await myDocuments.createDocumentFile("RestoreDoc");

      await myDocuments.filesTable.openContextMenuForItem("RestoreDoc");
      await myDocuments.filesTable.contextMenu.clickOption("Delete");
      await myDocuments.folderDeleteModal.clickDeleteFolder();
      await myDocuments.removeToast("successfully moved to Trash");

      await trash.open();
      await trash.restoreFileTo("RestoreDoc");
    });
  });

  test.describe("Email", () => {
    const defaultOwnerEmail = config.DOCSPACE_OWNER_EMAIL;

    test.beforeAll(() => {
      config.DOCSPACE_OWNER_EMAIL = defaultOwnerEmail.replace(
        "@",
        "+forgotpassword@",
      );
    });

    test.afterAll(() => {
      config.DOCSPACE_OWNER_EMAIL = defaultOwnerEmail;
    });

    test("Password change notification", async ({ page, api, login }) => {
      const confirmLink = await getOwnerConfirmLink(api.portalDomain);
      await createMailChecker().deleteAllMatchingEmails();
      await page.goto(confirmLink, { waitUntil: "load" });
      await login.loginToPortal();

      const profile = new Profile(page);
      await profile.open();
      await profile.changePassword();

      const email = await createMailChecker().findEmailBySubjectWithPortalLink({
        subject: "Confirm changing your password",
        portalName: api.portalDomain,
        timeoutSeconds: 120,
      });
      expect(email).toBeTruthy();
    });
  });

  test.describe("Auth", () => {
    test("Logout", async ({ login }) => {
      await login.loginToPortal();
      await login.logout();
      await login.loginButtonVisible();
    });
  });

  test.describe("Payment API", () => {
    test("Payment endpoint returns Startup plan", async ({ api }) => {
      const response = await api.apiRequestContext.get(
        `${api.apisystem.portalBaseUrl}/api/2.0/portal/payment/quota`,
        { timeout: 30000 },
      );
      expect(response.ok()).toBe(true);
      const { response: quota } = await response.json();
      expect(quota.title).toBe("Startup");
      expect(quota.free).toBe(true);
    });
  });
});

// TODO: add tests for:
// Third-party storage

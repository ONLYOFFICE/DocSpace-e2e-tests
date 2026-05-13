import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import ProfileFileManagement from "@/src/objects/profile/ProfileFileManagement";
import MyDocuments from "@/src/objects/files/MyDocuments";
import Rooms from "@/src/objects/rooms/Rooms";
import Login from "@/src/objects/common/Login";
import { mapInitialDocNames } from "@/src/utils/constants/files";

test.describe("Profile - Open ONLYOFFICE editor in same tab", () => {
  let profileFileManagement: ProfileFileManagement;
  let myDocuments: MyDocuments;
  let myRooms: Rooms;
  let login: Login;

  test.beforeEach(async ({ page, api }) => {
    profileFileManagement = new ProfileFileManagement(page, api.portalDomain);
    myDocuments = new MyDocuments(page, api.portalDomain);
    myRooms = new Rooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);
    await login.loginToPortal();
    await profileFileManagement.open();
    await profileFileManagement.toggleOpenInSameTab();
    await myDocuments.open();
  });

  test.describe("Creating new files", () => {
    test("New document opens in same tab", async ({ page }) => {
      await test.step("Create document and open editor", async () => {
        await myDocuments.createDocumentAndOpenEditorInSameTab();
      });

      await test.step("Verify editor opened in same tab with no new tabs", async () => {
        await expect(page).toHaveURL(/doceditor/);
        expect(page.context().pages()).toHaveLength(1);
        await page.waitForTimeout(10000);
      });
    });

    test("New spreadsheet opens in same tab", async ({ page }) => {
      await test.step("Create spreadsheet and open editor", async () => {
        await myDocuments.createSpreadsheetAndOpenEditorInSameTab();
      });

      await test.step("Verify editor opened in same tab with no new tabs", async () => {
        await expect(page).toHaveURL(/doceditor/);
        expect(page.context().pages()).toHaveLength(1);
      });
    });

    test("New presentation opens in same tab", async ({ page }) => {
      await test.step("Create presentation and open editor", async () => {
        await myDocuments.createPresentationAndOpenEditorInSameTab();
      });

      await test.step("Verify editor opened in same tab with no new tabs", async () => {
        await expect(page).toHaveURL(/doceditor/);
        expect(page.context().pages()).toHaveLength(1);
      });
    });

    test("New PDF form opens in same tab", async ({ page }) => {
      await test.step("Create PDF form and open editor", async () => {
        await myDocuments.createPdfFormAndOpenEditorInSameTab();
      });

      await test.step("Verify editor opened in same tab with no new tabs", async () => {
        await expect(page).toHaveURL(/doceditor/);
        expect(page.context().pages()).toHaveLength(1);
      });
    });
  });

  test("Setting is personal and does not apply to other users", async ({
    apiSdk,
  }) => {
    await test.step("Logout and login as another user", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      await login.logout();
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("Verify open in same tab is disabled for the other user", async () => {
      await profileFileManagement.open();
      await profileFileManagement.expectOpenInSameTabEnabled(false);
    });
  });

  test("Setting persists after re-login", async ({ page }) => {
    await test.step("Logout and log in again as the same user", async () => {
      await myRooms.openWithoutEmptyCheck();
      await login.logout();
      await login.loginToPortal();
    });

    await test.step("Verify toggle is still enabled", async () => {
      await profileFileManagement.open();
      await profileFileManagement.expectOpenInSameTabEnabled(true);
    });

    await test.step("Open document sample", async () => {
      await myDocuments.open();
      await myDocuments.openDocumentInSameTab(
        mapInitialDocNames.ONLYOFFICE_SAMPLE_DOCUMENT,
      );
    });

    await test.step("Verify editor opened in same tab with no new tabs", async () => {
      await expect(page).toHaveURL(/doceditor/);
      expect(page.context().pages()).toHaveLength(1);
    });
  });

  test("Disabling the setting restores new tab behavior", async ({ page }) => {
    await test.step("Disable open in same tab setting", async () => {
      await profileFileManagement.open();
      await profileFileManagement.disableOpenInSameTab();
    });

    await test.step("Open document sample - editor should open in new tab", async () => {
      await myDocuments.open();
      const editor = await myDocuments.openDocumentInEditor(
        mapInitialDocNames.ONLYOFFICE_SAMPLE_DOCUMENT,
      );
      await editor.waitForLoad();
      await editor.close();
    });

    await test.step("Verify main page stayed on My Documents", async () => {
      await expect(page).toHaveURL(/rooms\/personal/);
    });
  });

  test("File in Collaboration room opens in same tab", async ({
    page,
    apiSdk,
  }) => {
    const ROOM_NAME = "Collaboration Room";
    const FILE_NAME = "Room Document";

    await test.step("Create Collaboration room with a file via API", async () => {
      const roomResponse = await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "EditingRoom",
      });
      const roomBody = await roomResponse.json();
      const roomId = roomBody.response.id;
      await apiSdk.files.createFile("owner", roomId, { title: FILE_NAME });
    });

    await test.step("Navigate to room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    });

    await test.step("Open file in room via context menu", async () => {
      await myRooms.openFileInEditorInSameTab(FILE_NAME);
    });

    await test.step("Verify editor opened in same tab with no new tabs", async () => {
      await expect(page).toHaveURL(/doceditor/);
      expect(page.context().pages()).toHaveLength(1);
    });
  });

  test.describe("Opening existing files", () => {
    test("Document sample opens in same tab", async ({ page }) => {
      await test.step("Open document sample via context menu", async () => {
        await myDocuments.openDocumentInSameTab(
          mapInitialDocNames.ONLYOFFICE_SAMPLE_DOCUMENT,
        );
      });

      await test.step("Verify editor opened in same tab with no new tabs", async () => {
        await expect(page).toHaveURL(/doceditor/);
        expect(page.context().pages()).toHaveLength(1);
      });
    });

    test("Spreadsheet sample opens in same tab", async ({ page }) => {
      await test.step("Open spreadsheet sample via context menu", async () => {
        await myDocuments.openSpreadsheetInSameTab(
          mapInitialDocNames.ONLYOFFICE_SAMPLE_SPREADSHEETS,
        );
      });

      await test.step("Verify editor opened in same tab with no new tabs", async () => {
        await expect(page).toHaveURL(/doceditor/);
        expect(page.context().pages()).toHaveLength(1);
      });
    });

    test("Presentation sample opens in same tab", async ({ page }) => {
      await test.step("Open presentation sample via context menu", async () => {
        await myDocuments.openPresentationInSameTab(
          mapInitialDocNames.ONLYOFFICE_SAMPLE_PRESENTATION,
        );
      });

      await test.step("Verify editor opened in same tab with no new tabs", async () => {
        await expect(page).toHaveURL(/doceditor/);
        expect(page.context().pages()).toHaveLength(1);
      });
    });

    test("PDF form sample opens in same tab", async ({ page }) => {
      await test.step("Open PDF form sample via context menu", async () => {
        await myDocuments.openPdfFormInSameTab(
          mapInitialDocNames.ONLYOFFICE_SAMPLE_FORM,
        );
      });

      await test.step("Verify editor opened in same tab with no new tabs", async () => {
        await expect(page).toHaveURL(/doceditor/);
        expect(page.context().pages()).toHaveLength(1);
      });
    });
  });
});

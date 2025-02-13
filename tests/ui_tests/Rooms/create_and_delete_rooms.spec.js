import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { RoomsApi } from "../../../api_library/files/rooms_api";
import { ArchivePage } from "../../../page_objects/archive_page";
import { RoomsListPage } from "../../../page_objects/room_list_page";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

test.describe("Create and Delete Rooms Tests", () => {
  let apiContext;
  let portalSetup;
  let roomsApi;
  let roomsListPage;
  let portalLoginPage;
  let archivePage;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    const portalData = await portalSetup.setupPortal();
    roomsApi = new RoomsApi(apiContext, portalData.tenant.domain, () =>
      portalSetup.getAuthHeaders(),
    );
  });

  test.beforeEach(async ({ page }) => {
    roomsListPage = new RoomsListPage(page);
    archivePage = new ArchivePage(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });
  
test.afterAll(async () => {
  await portalSetup.deletePortal();
  await apiContext.dispose();
});

  test.describe("Create Collaboration Room Tests", () => {
 test("delete Form Filling room", async ({ page }) => {
      const originalTitle = "Form Filling Room"; // Replace with the desired name
      const newTitle = "New Form Filling Room";
      await roomsApi.createRoom(originalTitle, "form_filling");
      await roomsListPage.openRoomsList();
      await roomsListPage.renameRoom(originalTitle, newTitle);
      const renamedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(renamedRoomLocator).toBeVisible();
            await roomsListPage.renametag(newTitle, "TAG Filling Room");
      const tagLocator = page.locator(`text=TAG Filling Room`);
      await expect(tagLocator).toBeVisible();
      await roomsListPage.uploadPictures(newTitle);
      await roomsListPage.MoveRoomToArchive(newTitle);
      await page.waitForTimeout(5000)
      // Navigate to Archive page
      await archivePage.openArchiveList();
      await archivePage.downloadRoom(newTitle);
      await page.waitForTimeout(5000)
      // Check that the room is downloaded
      const downloadedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(downloadedRoomLocator).toBeVisible();
      const deletedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(deletedRoomLocator).toBeVisible();
      // Delete room from archive
      await archivePage.deleteRoom(newTitle);
      await expect(deletedRoomLocator).not.toBeVisible({ timeout: 10000 });
      // Check that the room is no longer visible
      const toastLocator = page.locator('text=Room removed'); // Replace with the correct toast selector
      await expect(toastLocator).toBeVisible();
    });

test("delete Collaboration room", async ({ page }) => {
      const originalTitle = "Test Room - Collaboration"; // Replace with the desired name
      const newTitle = "New Collaboration Room";
      await roomsApi.createRoom(originalTitle, "collaboration");
      await roomsListPage.openRoomsList();
      await roomsListPage.renameRoom(originalTitle, newTitle);
      const renamedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(renamedRoomLocator).toBeVisible();
      await roomsListPage.renametag(newTitle, "TAG Collaboration Room");
      const tagLocator = page.locator(`text=TAG Collaboration Room`);
      await expect(tagLocator).toBeVisible();
      await roomsListPage.uploadPictures(newTitle);
      await roomsListPage.MoveRoomToArchive(newTitle);
      await page.waitForTimeout(5000)
      // Navigate to Archive page
      await archivePage.openArchiveList();
      await archivePage.downloadRoom(newTitle);
      await page.waitForTimeout(5000)
      // Check that the room is downloaded
      const downloadedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(downloadedRoomLocator).toBeVisible();
      const deletedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(deletedRoomLocator).toBeVisible();
      // Delete room from archive
      await archivePage.deleteRoom(newTitle);
      await expect(deletedRoomLocator).not.toBeVisible({ timeout: 10000 });
      // Check that the room is no longer visible
      const toastLocator = page.locator('text=Room removed'); // Replace with the correct toast selector
      await expect(toastLocator).toBeVisible();
    });

    test("delete Custom room", async ({ page }) => {
      const originalTitle = "Test Room - Custom"; // Replace with the desired name
      const newTitle = "Custom RoomV2";
      await roomsApi.createRoom(originalTitle, "custom");
      await roomsListPage.openRoomsList();
      await roomsListPage.renameRoom(originalTitle, newTitle);
      const renamedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(renamedRoomLocator).toBeVisible();
      await roomsListPage.renametag(newTitle, "TAG Custom Room");
      const tagLocator = page.locator(`text=TAG Custom Room`);
      await expect(tagLocator).toBeVisible();
      await roomsListPage.uploadPictures(newTitle);
      await roomsListPage.MoveRoomToArchive(newTitle);
      await page.waitForTimeout(5000)
      // Navigate to Archive page
      await archivePage.openArchiveList();
      await archivePage.downloadRoom(newTitle);
      await page.waitForTimeout(5000)
      // Check that the room is downloaded
      const downloadedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(downloadedRoomLocator).toBeVisible();
      const deletedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(deletedRoomLocator).toBeVisible();
      // Delete room from archive
      await archivePage.deleteRoom(newTitle);
      await expect(deletedRoomLocator).not.toBeVisible({ timeout: 10000 });
      // Check that the room is no longer visible
      const toastLocator = page.locator('text=Room removed'); // Replace with the correct toast selector
      await expect(toastLocator).toBeVisible();
    });

    test("delete Public room", async ({ page }) => {
      const originalTitle = "Test Room - Public"; // Replace with the desired name
      const newTitle = "New Public Room";
      await roomsApi.createRoom(originalTitle, "public");
      await roomsListPage.openRoomsList();
      await roomsListPage.renameRoom(originalTitle, newTitle);
      const renamedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(renamedRoomLocator).toBeVisible();
      await roomsListPage.renametag(newTitle, "TAG Public Room");
      const tagLocator = page.locator(`text=TAG Public Room`);
      await expect(tagLocator).toBeVisible();
      await roomsListPage.uploadPictures(newTitle);
      await roomsListPage.MoveRoomToArchive(newTitle);
      await page.waitForTimeout(5000)
      // Navigate to Archive page
      await archivePage.openArchiveList();
      await archivePage.downloadRoom(newTitle);
      await page.waitForTimeout(5000)
      // Check that the room is downloaded
      const downloadedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(downloadedRoomLocator).toBeVisible();
      const deletedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(deletedRoomLocator).toBeVisible();
      // Delete room from archive
      await archivePage.deleteRoom(newTitle);
      await expect(deletedRoomLocator).not.toBeVisible({ timeout: 10000 });
      // Check that the room is no longer visible
      const toastLocator = page.locator('text=Room removed'); // Replace with the correct toast selector
      await expect(toastLocator).toBeVisible();
    });

    test("delete Virtual Data room", async ({ page }) => {
      const originalTitle = "Test Room - Virtual Data"; // Replace with the desired name
      const newTitle = "New Virtual Data";
      await roomsApi.createRoom(originalTitle, "virtual_data");
      await roomsListPage.openRoomsList();
      await roomsListPage.renameRoom(originalTitle, newTitle);
      const renamedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(renamedRoomLocator).toBeVisible();
      await roomsListPage.renametag(newTitle, "TAG virtual data Room");
      const tagLocator = page.locator(`text=TAG virtual data Room`);
      await expect(tagLocator).toBeVisible();
      await roomsListPage.uploadPictures(newTitle);
      await roomsListPage.MoveRoomToArchive(newTitle);
      await page.waitForTimeout(5000)
      // Navigate to Archive page
      await archivePage.openArchiveList();
      await archivePage.downloadRoom(newTitle);
      await page.waitForTimeout(5000)
      // Check that the room is downloaded
      const downloadedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(downloadedRoomLocator).toBeVisible();
      const deletedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(deletedRoomLocator).toBeVisible();
      // Delete room from archive
      await archivePage.deleteRoom(newTitle);
      await expect(deletedRoomLocator).not.toBeVisible({ timeout: 10000 });
      // Check that the room is no longer visible
      const toastLocator = page.locator('text=Room removed'); // Replace with the correct toast selector
      await expect(toastLocator).toBeVisible();
    });
  });
});
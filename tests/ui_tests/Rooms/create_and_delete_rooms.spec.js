import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { RoomsApi } from "../../../api_library/files/rooms_api";
import { ArchivePage } from "../../../page_objects/archive_page";
import { RoomsListPage } from "../../../page_objects/room_list_page";
import { PortalLoginPage } from "../../../page_objects/portal_login_page";

test.describe("Create Collaboration Room Tests", () => {
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
      await roomsListPage.MoveRoomToArchive(newTitle);
      await page.waitForTimeout(5000)
      // Navigate to Archive page
      await archivePage.openArchiveList();
      const deletedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(deletedRoomLocator).toBeVisible();
      // Delete room from archive
      await archivePage.deleteRoom(newTitle);
      await page.waitForTimeout(5000)
      await expect(deletedRoomLocator).not.toBeVisible(); // Check that the room is no longer visible
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
      await roomsListPage.MoveRoomToArchive(newTitle);
      await page.waitForTimeout(5000)
      // Navigate to Archive page
      await archivePage.openArchiveList();
      const deletedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(deletedRoomLocator).toBeVisible();
      // Delete room from archive
      await archivePage.deleteRoom(newTitle);
      await page.waitForTimeout(5000)
      await expect(deletedRoomLocator).not.toBeVisible(); // Check that the room is no longer visible
      const toastLocator = page.locator('text=Room removed'); // Replace with the correct toast selector
      await expect(toastLocator).toBeVisible();
    });

    test("delete Custom room", async ({ page }) => {
      const originalTitle = "Test Room - Custom"; // Replace with the desired name
      const newTitle = "Custom Room";
      await roomsApi.createRoom(originalTitle, "custom");
      await roomsListPage.openRoomsList();
      await roomsListPage.renameRoom(originalTitle, newTitle);
      const renamedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(renamedRoomLocator).toBeVisible();
      await roomsListPage.MoveRoomToArchive(newTitle);
      await page.waitForTimeout(5000)
      // Navigate to Archive page
      await archivePage.openArchiveList();
      const deletedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(deletedRoomLocator).toBeVisible();
      // Delete room from archive
      await archivePage.deleteRoom(newTitle);
      await page.waitForTimeout(5000)
      await expect(deletedRoomLocator).not.toBeVisible(); // Check that the room is no longer visible
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
      await roomsListPage.MoveRoomToArchive(newTitle);
      await page.waitForTimeout(5000)
      // Navigate to Archive page
      await archivePage.openArchiveList();
      const deletedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(deletedRoomLocator).toBeVisible();
      // Delete room from archive
      await archivePage.deleteRoom(newTitle);
      await page.waitForTimeout(5000)
      await expect(deletedRoomLocator).not.toBeVisible(); // Check that the room is no longer visible
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
      await roomsListPage.MoveRoomToArchive(newTitle);
      await page.waitForTimeout(5000)
      // Navigate to Archive page
      await archivePage.openArchiveList();
      const deletedRoomLocator = page.locator(`text=${newTitle}`);
      await expect(deletedRoomLocator).toBeVisible();
      // Delete room from archive
      await archivePage.deleteRoom(newTitle);
      await page.waitForTimeout(5000)
      await expect(deletedRoomLocator).not.toBeVisible(); // Check that the room is no longer visible
      const toastLocator = page.locator('text=Room removed'); // Replace with the correct toast selector
      await expect(toastLocator).toBeVisible();
    });
  });
});
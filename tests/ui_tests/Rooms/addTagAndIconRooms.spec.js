import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../api_library/portal_setup";
import { RoomsApi } from "../../../api_library/files/rooms_api";
import { ArchivePage } from "../../../page_objects/Rooms/archivePage";
import { RoomsListPage } from "../../../page_objects/Rooms/roomListPage";
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

  test.describe("Adding icons and tags to rooms", () => {
    test("adding icon and tag to Form Filling room", async ({ page }) => {
      const originalTitle = "Form Filling Room";
      const newTitle = "Form Filling Room";
      await roomsApi.createRoom(originalTitle, "form_filling");
      await roomsListPage.openRoomsList();
      // await roomsListPage.renameRoom(originalTitle, newTitle);
      await roomsListPage.renametag(newTitle, "TAG Filling Room");
      const tagLocator = page.locator(`text=TAG Filling Room`);
      await expect(tagLocator).toBeVisible();
      await roomsListPage.uploadPicturesJPG(newTitle);
    });

    test("Adding icon and tag to Collaboration room", async ({ page }) => {
      const originalTitle = "Test Room - Collaboration";
      const newTitle = "Test Room - Collaboration";
      await roomsApi.createRoom(originalTitle, "collaboration");
      await roomsListPage.openRoomsList();
      // await roomsListPage.renameRoom(originalTitle, newTitle);
      await roomsListPage.renametag(newTitle, "TAG Collaboration Room");
      const tagLocator = page.locator(`text=TAG Collaboration Room`);
      await expect(tagLocator).toBeVisible();
      await roomsListPage.uploadPicturesPNG(newTitle);
    });

    test("Adding icon and tag to Custom room", async ({ page }) => {
      const originalTitle = "Test Room - Custom";
      const newTitle = "Test Room - Custom";
      await roomsApi.createRoom(originalTitle, "custom");
      await roomsListPage.openRoomsList();
      // await roomsListPage.renameRoom(originalTitle, newTitle);
      await roomsListPage.renametag(newTitle, "TAG Custom Room");
      const tagLocator = page.locator(`text=TAG Custom Room`);
      await expect(tagLocator).toBeVisible();
      await roomsListPage.uploadPicturesJPG(newTitle);
    });

    test("Adding icon and tag to Public room", async ({ page }) => {
      const originalTitle = "Test Room - Public";
      const newTitle = "Test Room - Public";
      await roomsApi.createRoom(originalTitle, "public");
      await roomsListPage.openRoomsList();
      // await roomsListPage.renameRoom(originalTitle, newTitle);
      await roomsListPage.renametag(newTitle, "TAG Public Room");
      const tagLocator = page.locator(`text=TAG Public Room`);
      await expect(tagLocator).toBeVisible();
      await roomsListPage.uploadPicturesPNG(newTitle);
    });

    test("Adding icon and tag to Virtual Data room", async ({ page }) => {
      const originalTitle = "Test Room - Virtual Data";
      const newTitle = "Test Room - Virtual Data";
      await roomsApi.createRoom(originalTitle, "virtual_data");
      await roomsListPage.openRoomsList();
      // await roomsListPage.renameRoom(originalTitle, newTitle);
      await roomsListPage.renametag(newTitle, "TAG virtual data Room");
      const tagLocator = page.locator(`text=TAG virtual data Room`);
      await expect(tagLocator).toBeVisible();
      await roomsListPage.uploadPicturesCustomizeCover(newTitle);
    });
  });
});

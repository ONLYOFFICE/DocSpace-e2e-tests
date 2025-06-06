import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../../api_library/portal_setup";
import { RoomsApi } from "../../../../api_library/files/rooms_api";
import { ArchivePage } from "../../../../page_objects/Rooms/archive_page";
import { RoomsListPage } from "../../../../page_objects/Rooms/room_list_page";
import { PortalLoginPage } from "../../../../page_objects/portal_login_page";
import { PublicRoomPage } from "../../../../page_objects/Rooms/publick_room";

test.describe("Public Room: Third Party Storage Tests", () => {
  let portalSetup;
  let roomsListPage;
  let portalLoginPage;
  let apiContext;
  let publicRoomPage;

  test.setTimeout(120000);

  test.beforeAll(async () => {
    apiContext = await test.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    roomsListPage = new RoomsListPage(page);
    portalLoginPage = new PortalLoginPage(page);
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("Check BOX storage connection in public room", async ({ page }) => {
    await test.step("Connect BOX", async () => {
      const roomName = await roomsListPage.CreatePublicRoomFunc("Box");
      await page.waitForTimeout(500);
      const publicRoomPage = new PublicRoomPage(page);
      await publicRoomPage.pubToggleButtonLocator.click();
      await publicRoomPage.BOX();
      await publicRoomPage.CreateButton();
      await roomsListPage.openRoomsList();
      await page.waitForSelector(roomsListPage.roomsListSelector);
      const boxTag = page
        .locator(`div[data-title="${roomName}"]`)
        .first()
        .locator('[data-testid="tags"] .tag[data-tag="Box"]');
      await expect(boxTag).toBeVisible({ timeout: 5000 });
    });
  });

  test("Check Dropbox storage connection in public room", async ({ page }) => {
    await test.step("Connect DROPBOX", async () => {
      const roomName = await roomsListPage.CreatePublicRoomFunc("Dropbox");
      await page.waitForTimeout(500);
      const publicRoomPage = new PublicRoomPage(page);
      await publicRoomPage.pubToggleButtonLocator.click();
      await publicRoomPage.Dropbox();
      await publicRoomPage.CreateButton();
      await roomsListPage.openRoomsList();
      await page.waitForSelector(roomsListPage.roomsListSelector);
      const dropboxTag = page
        .locator(`div[data-title="${roomName}"]`)
        .first()
        .locator('[data-testid="tags"] .tag[data-tag="DropboxV2"]');
      await expect(dropboxTag).toBeVisible({ timeout: 5000 });
    });
  });

  test("Check Nextcloud storage connection in public room", async ({
    page,
  }) => {
    await test.step("Connect Nextcloud", async () => {
      const roomName = await roomsListPage.CreatePublicRoomFunc("Nextcloud");
      await page.waitForTimeout(500);
      const publicRoomPage = new PublicRoomPage(page);
      await publicRoomPage.pubToggleButtonLocator.click();
      await publicRoomPage.ConnectNextcloud();
      await publicRoomPage.CreateButton();
      await roomsListPage.openRoomsList();
      await page.waitForSelector(roomsListPage.roomsListSelector);
      const webDavTag = page
        .locator(`div[data-title="${roomName}"]`)
        .first()
        .locator('[data-testid="tags"] .tag[data-tag="WebDav"]');
      await expect(webDavTag).toBeVisible({ timeout: 5000 });
    });
  });

  test("Check OneDrive storage connection in public room", async ({ page }) => {
    await test.step("Connect OneDrive", async () => {
      const roomName = await roomsListPage.CreatePublicRoomFunc("OneDrive");
      await page.waitForTimeout(500);
      const publicRoomPage = new PublicRoomPage(page);
      await publicRoomPage.pubToggleButtonLocator.click();
      await publicRoomPage.OneDrive();
      await publicRoomPage.CreateButton();
      await roomsListPage.openRoomsList();
      await page.waitForSelector(roomsListPage.roomsListSelector);
      const oneDriveTag = page
        .locator(`div[data-title="${roomName}"]`)
        .first()
        .locator('[data-testid="tags"] .tag[data-tag="OneDrive"]');
      await expect(oneDriveTag).toBeVisible({ timeout: 5000 });
    });
  });
});

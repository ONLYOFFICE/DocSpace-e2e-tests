import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../../../api_library/portal_setup.js";
import { RoomsApi } from "../../../../api_library/files/rooms_api.js";
import { ArchivePage } from "../../../../page_objects/Rooms/archivePage.js";
import { RoomsListPage } from "../../../../page_objects/Rooms/roomListPage.js";
import { PortalLoginPage } from "../../../../page_objects/portal_login_page.js";
import { PublicRoomPage } from "../../../../page_objects/Rooms/publicRoomPage.js";
import { FileGenerator } from "../../../../utils/file_generator.js";

test.describe("Public Room: Third Party Storage Tests", () => {
  let portalSetup;
  let roomsListPage;
  let portalLoginPage;
  let apiContext;
  let publicRoomPage;
  let fileGenerator;

  test.setTimeout(120000);

  test.beforeAll(async () => {
    apiContext = await test.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    await portalSetup.setupPortal();
  });

  test.beforeEach(async ({ page }) => {
    roomsListPage = new RoomsListPage(page);
    portalLoginPage = new PortalLoginPage(page);
    publicRoomPage = new PublicRoomPage(page);
    fileGenerator = new FileGenerator();
    await portalLoginPage.loginToPortal(portalSetup.portalDomain);
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("Check BOX storage connection in public room", async ({
    page,
    browser,
  }) => {
    await test.step("Connect BOX", async () => {
      const roomName = await roomsListPage.CreatePublicRoomFunc("Box");
      await publicRoomPage.enableThirdPartyStorage();
      await publicRoomPage.BOX();
      await publicRoomPage.CreateButton();
      await roomsListPage.openRoomsList();
      await publicRoomPage.verifyStorageTagAndOpenRoom(roomName, "Box");
      await publicRoomPage.uploadAndVerifyFile(
        browser,
        roomName,
        roomsListPage,
      );
    });
  });

  test("Check Dropbox storage connection in public room", async ({
    page,
    browser,
  }) => {
    await test.step("Connect DROPBOX", async () => {
      const roomName = await roomsListPage.CreatePublicRoomFunc("Dropbox");
      await publicRoomPage.enableThirdPartyStorage();
      await publicRoomPage.Dropbox();
      await publicRoomPage.CreateButton();
      await roomsListPage.openRoomsList();
      await publicRoomPage.verifyStorageTagAndOpenRoom(roomName, "DropboxV2");
      await publicRoomPage.uploadAndVerifyFile(
        browser,
        roomName,
        roomsListPage,
      );
    });
  });

  test("Check Nextcloud storage connection in public room", async ({
    page,
    browser,
  }) => {
    await test.step("Connect Nextcloud", async () => {
      const roomName = await roomsListPage.CreatePublicRoomFunc("Nextcloud");
      await publicRoomPage.enableThirdPartyStorage();
      await publicRoomPage.ConnectNextcloud();
      await publicRoomPage.CreateButton();
      await roomsListPage.openRoomsList();
      await publicRoomPage.verifyStorageTagAndOpenRoom(roomName, "WebDav");
      await publicRoomPage.uploadAndVerifyFile(
        browser,
        roomName,
        roomsListPage,
      );
    });
  });

  test("Check OneDrive storage connection in public room", async ({
    page,
    browser,
  }) => {
    await test.step("Connect OneDrive", async () => {
      const roomName = await roomsListPage.CreatePublicRoomFunc("OneDrive");
      await publicRoomPage.enableThirdPartyStorage();
      await publicRoomPage.OneDrive();
      await publicRoomPage.CreateButton();
      await roomsListPage.openRoomsList();
      await publicRoomPage.verifyStorageTagAndOpenRoom(roomName, "OneDrive");
      await publicRoomPage.uploadAndVerifyFile(
        browser,
        roomName,
        roomsListPage,
      );
    });
  });
});

import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import MyDocuments from "@/src/objects/files/MyDocuments";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import BaseEditLink from "@/src/objects/common/BaseLinkSettings";
import { waitForRoomShareLinkResponse } from "@/src/objects/rooms/api";
import {
  roomCreateTitles,
  roomDialogSource,
} from "@/src/utils/constants/rooms";
import { expect, BrowserContext, Page } from "@playwright/test";
import {
  setupIncognitoContext,
  cleanupIncognitoContext,
} from "@/src/utils/helpers/linkTest";

test.describe("Public room - Shared link", () => {
  let myRooms: MyRooms;
  let roomInfoPanel: RoomInfoPanel;
  let linkSettings: BaseEditLink;
  let incognitoContext: BrowserContext | null = null;
  let incognitoPage: Page | null = null;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    roomInfoPanel = new RoomInfoPanel(page);
    linkSettings = new BaseEditLink(page);

    await login.loginToPortal();
    await myRooms.openWithoutEmptyCheck();
    await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
    await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.public);
    await myRooms.roomsCreateDialog.createRoom(roomCreateTitles.public);
  });

  test.afterEach(async () => {
    await cleanupIncognitoContext(incognitoContext, incognitoPage);
    incognitoContext = null;
    incognitoPage = null;
  });

  test("Shared link exists after room creation", async () => {
    await test.step("Open info panel and verify shared link", async () => {
      await roomInfoPanel.checkSharedLinkCreated();
    });
  });

  test("Rename shared link", async () => {
    await test.step("Open link settings", async () => {
      await roomInfoPanel.openLinkSettings();
    });

    await test.step("Change link name and save", async () => {
      await linkSettings.newLinkName("Custom public link");
      await linkSettings.clickSaveButton();
    });
  });

  test("Enable password protection", async () => {
    await test.step("Open link settings", async () => {
      await roomInfoPanel.openLinkSettings();
    });

    await test.step("Enable password and set value", async () => {
      await linkSettings.clickTogglePassword();
      await linkSettings.fillPassword("TestPassword123!");
    });

    await test.step("Save settings", async () => {
      await linkSettings.clickSaveButton();
    });
  });

  test("Generate password for shared link", async () => {
    await test.step("Open link settings", async () => {
      await roomInfoPanel.openLinkSettings();
    });

    await test.step("Enable password and generate", async () => {
      await linkSettings.clickTogglePassword();
      await linkSettings.generatePassword();
    });

    await test.step("Save settings", async () => {
      await linkSettings.clickSaveButton();
    });
  });

  test("Enable restrict download", async () => {
    await test.step("Open link settings", async () => {
      await roomInfoPanel.openLinkSettings();
    });

    await test.step("Enable restrict download toggle", async () => {
      await linkSettings.clickDenyDownloadToggle();
    });

    await test.step("Save settings", async () => {
      await linkSettings.clickSaveButton();
    });
  });

  test("Create additional shared link", async () => {
    await test.step("Open info panel", async () => {
      await roomInfoPanel.checkSharedLinkCreated();
    });

    await test.step("Create one more shared link", async () => {
      await roomInfoPanel.addNewSharedLink();
    });
  });

  test("Revoke shared link", async () => {
    await test.step("Open info panel", async () => {
      await roomInfoPanel.checkSharedLinkCreated();
    });

    await test.step("Revoke link and verify new link created", async () => {
      await roomInfoPanel.revokeRoomLink();
    });
  });

  // TODO: fix shared link extraction from API response
  test.skip("File in public room is visible via shared link", async ({
    page,
    browser,
  }) => {
    await test.step("Create document inside room", async () => {
      const myDocuments = new MyDocuments(page, "");
      await myDocuments.createDocumentFile("TestDocument");
    });

    let sharedLink: string;

    await test.step("Get shared link from API", async () => {
      const linkPromise = waitForRoomShareLinkResponse(page);
      await roomInfoPanel.open();
      await roomInfoPanel.openTab("Contacts");
      sharedLink = await linkPromise;
    });

    await test.step("Open shared link in incognito and verify file is visible", async () => {
      const result = await setupIncognitoContext(browser);
      incognitoContext = result.context;
      incognitoPage = result.page;
      await incognitoPage.goto(sharedLink, { waitUntil: "load" });

      await expect(incognitoPage.getByLabel("TestDocument,")).toBeVisible({
        timeout: 15000,
      });
    });
  });
});

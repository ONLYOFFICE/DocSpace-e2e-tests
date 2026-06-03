import { Page, expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Security from "@/src/objects/settings/security/Security";
import MyDocuments from "@/src/objects/files/MyDocuments";
import FilesTable from "@/src/objects/files/FilesTable";
import MyRooms from "@/src/objects/rooms/Rooms";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import InfoPanel from "@/src/objects/common/InfoPanel";
import { waitForShareLinkResponse } from "@/src/objects/files/api";
import { ApiSDK } from "@/src/services";
import {
  verifyLoginPageInIncognito,
  verifyAccessDeniedInIncognito,
  expectEditorOpensAnonymously,
  expectRoomOpensAnonymously,
} from "@/src/utils/helpers/linkTest";

/**
 * Creates a document in My Documents and a sharing link on it via
 * "Create and copy", leaving the share panel open. When `apiSdk` is given the
 * document is created via API as the owner (robust); otherwise it is created
 * in the UI as the currently logged-in user. The link type reflects the
 * current Access Control settings. Returns the link URL.
 */
async function createSharedLinkOnNewDocument(
  page: Page,
  portalDomain: string,
  docName: string,
  apiSdk?: ApiSDK,
): Promise<string> {
  const myDocuments = new MyDocuments(page, portalDomain);
  const infoPanel = new InfoPanel(page);

  if (apiSdk) {
    await apiSdk.files.createFileInMyDocuments("owner", { title: docName });
    await myDocuments.open();
  } else {
    await myDocuments.open();
    await myDocuments.createDocumentFile(docName);
  }
  await myDocuments.filesTable.checkRowExist(docName);
  await myDocuments.filesTable.openContextMenuForItem(docName);
  await myDocuments.filesTable.contextMenu.clickSubmenuOption(
    "Share",
    "Sharing settings",
  );
  await infoPanel.checkShareExist();

  const linkPromise = waitForShareLinkResponse(page);
  await infoPanel.createFirstSharedLink();
  const link = await linkPromise;
  await myDocuments.dismissToastSafely("Link copied to clipboard");

  return link;
}

type RoomShareEntry = { sharedTo?: { shareLink?: string } };
type RoomShareBody = { response?: RoomShareEntry[] | RoomShareEntry };

/** Extracts all sharing-link URLs from a room share/links response body. */
function extractRoomShareLinks(body: RoomShareBody): string[] {
  const r = body?.response;
  const entries = Array.isArray(r) ? r : r ? [r] : [];
  return entries
    .map((e) => e.sharedTo?.shareLink)
    .filter((l): l is string => Boolean(l));
}

/**
 * Creates a Public room, opens its members/links panel in the UI, and returns
 * its general sharing link captured from the room share response (waiting for
 * the response that actually carries a link).
 */
async function getPublicRoomLink(
  page: Page,
  portalDomain: string,
  apiSdk: ApiSDK,
  roomTitle: string,
): Promise<string> {
  await apiSdk.rooms.createRoom("owner", {
    title: roomTitle,
    roomType: "PublicRoom",
  });

  const myRooms = new MyRooms(page, portalDomain);
  const roomInfoPanel = new RoomInfoPanel(page);

  // Set up the response waiter before the navigation that triggers it.
  const linkResponse = page.waitForResponse(async (resp) => {
    if (
      resp.status() !== 200 ||
      !resp.url().includes("/api/2.0/files/rooms/") ||
      !resp.url().includes("/share")
    ) {
      return false;
    }
    try {
      return extractRoomShareLinks(await resp.json()).length > 0;
    } catch {
      return false;
    }
  }, {});

  await myRooms.openWithoutEmptyCheck();
  await myRooms.roomsTable.openRoomByName(roomTitle);
  await roomInfoPanel.open();
  await roomInfoPanel.openTab("Contacts");

  const links = extractRoomShareLinks(await (await linkResponse).json());
  if (!links.length) throw new Error("room sharing link not found in response");
  return links[0];
}

/**
 * Creates a room with a file inside it (via API), opens the room, and creates
 * an external sharing link on that file via "Copy shared link". Returns the
 * link URL. The link type reflects the current Access Control settings.
 */
async function getRoomFileLink(
  page: Page,
  portalDomain: string,
  apiSdk: ApiSDK,
  roomTitle: string,
  fileName: string,
): Promise<string> {
  const roomResp = await apiSdk.rooms.createRoom("owner", {
    title: roomTitle,
    roomType: "CustomRoom",
  });
  const roomId = (await roomResp.json()).response.id;
  await apiSdk.files.createFile("owner", roomId, { title: fileName });

  const myRooms = new MyRooms(page, portalDomain);
  await myRooms.openWithoutEmptyCheck();
  await myRooms.roomsTable.openRoomByName(roomTitle);

  const filesTable = new FilesTable(page);
  await filesTable.checkRowExist(fileName);

  const linkPromise = waitForShareLinkResponse(page);
  await filesTable.openContextMenuForItem(fileName);
  await filesTable.contextMenu.clickSubmenuOption("Share", "Copy shared link");
  const link = await linkPromise;
  await myRooms.dismissToastSafely("Link copied to clipboard");

  return link;
}

test.describe("Access Control settings UI", () => {
  let security: Security;

  test.beforeEach(async ({ page, login }) => {
    security = new Security(page);
    await login.loginToPortal();
    await security.open();
  });

  test("Selecting Restricted reveals the Applies to and existing-links options", async () => {
    await security.externalSharingRestricted.click();
    await security.expectRestrictionOptionsVisible();
    await security.expectAppliesTo({ documents: true, rooms: true });
  });

  test("Cancel discards unsaved Access Control changes", async () => {
    await security.externalSharingRestricted.click();
    await expect(security.accessControlSaveButton).toBeEnabled();

    await security.accessControlCancelButton.click();
    await security.expectExternalSharing("allowed");
    await expect(security.accessControlSaveButton).toBeDisabled();
  });
});

test.describe("Access Control enforcement", () => {
  let security: Security;

  test.beforeEach(async ({ page, login }) => {
    security = new Security(page);
    await login.loginToPortal();
  });

  test("Restricted + Applies to My documents: new My Documents links can only be DocSpace users only", async ({
    page,
    api,
    apiSdk,
    browser,
  }) => {
    await test.step("Owner restricts external sharing for My documents only", async () => {
      await security.open();
      await security.setExternalSharing("restricted", {
        documents: true,
        rooms: false,
      });
      await security.expectAppliesTo({ documents: true, rooms: false });
    });

    await test.step("A new link in My documents cannot be 'Anyone with the link'", async () => {
      const docLink = await createSharedLinkOnNewDocument(
        page,
        api.portalDomain,
        "AppliesDocsDoc",
        apiSdk,
      );
      await new InfoPanel(page).checkAnyoneWithLinkDisabled();
      await verifyLoginPageInIncognito(browser, docLink);
    });
  });

  test("Restricted + Applies to Rooms: existing public room link is blocked and new external links cannot be created", async ({
    page,
    api,
    apiSdk,
    browser,
  }) => {
    let roomLink: string;

    // New Public Rooms can't be created once Rooms are restricted, so the
    // public room must exist before the restriction is enabled.
    await test.step("Owner creates a public room with a working external link", async () => {
      roomLink = await getPublicRoomLink(
        page,
        api.portalDomain,
        apiSdk,
        "AppliesRoomsRoom",
      );
      await expectRoomOpensAnonymously(browser, roomLink);
    });

    await test.step("Owner restricts external sharing for Rooms only", async () => {
      await security.open();
      await security.setExternalSharing("restricted", {
        documents: false,
        rooms: true,
        existingLinks: "block",
      });
      await security.expectAppliesTo({ documents: false, rooms: true });
    });

    await test.step("The public room link no longer allows external access", async () => {
      await verifyLoginPageInIncognito(browser, roomLink);
    });

    await test.step("New external links can no longer be created in the room", async () => {
      const myRooms = new MyRooms(page, api.portalDomain);
      const roomInfoPanel = new RoomInfoPanel(page);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName("AppliesRoomsRoom");
      await roomInfoPanel.open();
      await roomInfoPanel.openTab("Contacts");

      await roomInfoPanel.expectExternalLinksDisabled();
    });
  });

  test("Restricted + Applies to Rooms: a file inside a room loses external access and new public links cannot be created", async ({
    page,
    api,
    apiSdk,
    browser,
  }) => {
    let fileLink: string;

    await test.step("Owner creates a public link on a file inside a room", async () => {
      fileLink = await getRoomFileLink(
        page,
        api.portalDomain,
        apiSdk,
        "RoomWithFile",
        "RoomFileDoc",
      );
    });

    await test.step("The file link opens anonymously before the restriction", async () => {
      await expectEditorOpensAnonymously(browser, fileLink);
    });

    await test.step("Owner restricts external sharing for Rooms", async () => {
      await security.open();
      await security.setExternalSharing("restricted", {
        documents: false,
        rooms: true,
        existingLinks: "block",
      });
      await security.expectAppliesTo({ documents: false, rooms: true });
    });

    await test.step("The file link no longer opens anonymously", async () => {
      await verifyAccessDeniedInIncognito(browser, fileLink);
    });

    await test.step("New links on the file can only be DocSpace users only", async () => {
      const myRooms = new MyRooms(page, api.portalDomain);
      const filesTable = new FilesTable(page);
      const infoPanel = new InfoPanel(page);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName("RoomWithFile");
      await filesTable.openContextMenuForItem("RoomFileDoc");
      await filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Sharing settings",
      );
      await infoPanel.checkShareExist();
      await infoPanel.checkAnyoneWithLinkDisabled();
    });
  });

  test("Restricted + Block access: an existing public document link stops working", async ({
    page,
    api,
    apiSdk,
    browser,
  }) => {
    let docLink: string;

    await test.step("Owner creates a public link on a document", async () => {
      docLink = await createSharedLinkOnNewDocument(
        page,
        api.portalDomain,
        "BlockAccessDoc",
        apiSdk,
      );
    });

    await test.step("Public link opens anonymously before the restriction", async () => {
      await expectEditorOpensAnonymously(browser, docLink);
    });

    await test.step("Owner restricts external sharing (documents and rooms) with Block access", async () => {
      await security.open();
      await security.setExternalSharing("restricted", {
        existingLinks: "block",
      });
      await security.expectExistingLinksChoice("block");
    });

    await test.step("Previously created link no longer opens anonymously", async () => {
      await verifyAccessDeniedInIncognito(browser, docLink);
    });
  });

  test("Restricted + Allow existing links: an existing public document link keeps working", async ({
    page,
    api,
    apiSdk,
    browser,
  }) => {
    let docLink: string;

    await test.step("Owner creates a public link on a document", async () => {
      docLink = await createSharedLinkOnNewDocument(
        page,
        api.portalDomain,
        "AllowExistingDoc",
        apiSdk,
      );
    });

    await test.step("Owner restricts external sharing (documents and rooms) but allows existing links", async () => {
      await security.open();
      await security.setExternalSharing("restricted", {
        existingLinks: "allow",
      });
      await security.expectExistingLinksChoice("allow");
    });

    await test.step("Previously created link still opens anonymously", async () => {
      await expectEditorOpensAnonymously(browser, docLink);
    });
  });

  test("Default Sharing Link Type 'DocSpace users only' applies to the owner and another user", async ({
    page,
    api,
    apiSdk,
    login,
    browser,
  }) => {
    await test.step("Owner sets the default sharing link type to DocSpace users only", async () => {
      await security.open();
      await security.setDefaultLinkType("docspace");
      await security.expectDefaultLinkType("docspace");
    });

    await test.step("Owner's new link defaults to DocSpace users only", async () => {
      const ownerLink = await createSharedLinkOnNewDocument(
        page,
        api.portalDomain,
        "OwnerDefaultLinkDoc",
        apiSdk,
      );
      await verifyLoginPageInIncognito(browser, ownerLink);
    });

    let userEmail: string;
    let userPassword: string;

    await test.step("Create a second portal user and log in as them", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      userEmail = userData.email;
      userPassword = userData.password;
      await login.logout();
      await login.loginWithCredentials(userEmail, userPassword);
    });

    await test.step("The new user's link also defaults to DocSpace users only", async () => {
      const userLink = await createSharedLinkOnNewDocument(
        page,
        api.portalDomain,
        "UserDefaultLinkDoc",
      );
      await verifyLoginPageInIncognito(browser, userLink);
    });
  });

  test("Disabling the restriction restores public link creation", async ({
    page,
    api,
    apiSdk,
    browser,
  }) => {
    await test.step("Owner restricts external sharing", async () => {
      await security.open();
      await security.setExternalSharing("restricted", {
        existingLinks: "block",
      });
      await security.expectExternalSharing("restricted");
    });

    await test.step("While restricted, a new document link is not public", async () => {
      const restrictedLink = await createSharedLinkOnNewDocument(
        page,
        api.portalDomain,
        "RestrictedThenAllowedDoc",
        apiSdk,
      );
      await verifyLoginPageInIncognito(browser, restrictedLink);
    });

    await test.step("Owner turns external sharing back to Allowed", async () => {
      await security.open();
      await security.setExternalSharing("allowed");
      await security.expectExternalSharing("allowed");
      await security.expectRestrictionOptionsHidden();
    });

    await test.step("A new document link is public again and opens anonymously", async () => {
      const publicLink = await createSharedLinkOnNewDocument(
        page,
        api.portalDomain,
        "ReenabledPublicDoc",
        apiSdk,
      );
      await expectEditorOpensAnonymously(browser, publicLink);
    });
  });
});

import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Security from "@/src/objects/settings/security/Security";
import FilesTable from "@/src/objects/files/FilesTable";
import MyRooms from "@/src/objects/rooms/Rooms";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import InfoPanel from "@/src/objects/common/InfoPanel";
import {
  verifyLoginPageInIncognito,
  verifyAccessDeniedInIncognito,
  expectEditorOpensAnonymously,
  expectRoomOpensAnonymously,
  createSharedLinkOnNewDocument,
  getPublicRoomLink,
  getRoomFileLink,
} from "@/src/utils/helpers/linkTest";

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

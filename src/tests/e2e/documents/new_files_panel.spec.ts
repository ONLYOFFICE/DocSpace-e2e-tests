import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import NewFilesPanel from "@/src/objects/common/NewFilesPanel";
import SharedWithMe from "@/src/objects/files/SharedWithMe";
import Rooms from "@/src/objects/rooms/Rooms";
import MyDocuments from "@/src/objects/files/MyDocuments";
import FilesTable from "@/src/objects/files/FilesTable";
import Login from "@/src/objects/common/Login";

test.describe("New Files Panel", () => {
  test.describe("Shared with me badge", () => {
    const FILE_NAME = "PanelSharedDoc";
    let sharedWithMe: SharedWithMe;
    let newFilesPanel: NewFilesPanel;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: FILE_NAME,
      });
      const fileBody = await fileResponse.json();
      const fileId = fileBody.response.id;

      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 2 }],
        notify: false,
      });

      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userData.email, userData.password);

      sharedWithMe = new SharedWithMe(page, api.portalDomain);
      newFilesPanel = new NewFilesPanel(page);
      await sharedWithMe.open();
    });

    test("Panel opens on badge click and shows shared file and date", async () => {
      await test.step("Click Shared with me badge", async () => {
        await newFilesPanel.openByClickingSharedWithMeBadge();
      });

      await test.step("Verify panel is visible", async () => {
        await newFilesPanel.expectVisible();
      });

      await test.step("Verify file is shown in panel", async () => {
        await newFilesPanel.expectFileItemVisible(FILE_NAME);
      });

      await test.step("Verify date item is visible", async () => {
        await newFilesPanel.expectDateItemVisible();
      });
    });

    test("Mark as read closes panel and removes Shared with me badge and New badge", async () => {
      await test.step("Verify New badge is visible on file in table", async () => {
        await sharedWithMe.filesTable.expectNewBadgeVisible(FILE_NAME);
      });

      await test.step("Click Shared with me badge to open panel", async () => {
        await newFilesPanel.openByClickingSharedWithMeBadge();
        await newFilesPanel.expectVisible();
      });

      await test.step("Click Mark as read", async () => {
        await newFilesPanel.clickMarkAsRead(FILE_NAME);
      });

      await test.step("Verify panel is no longer visible", async () => {
        await newFilesPanel.expectNotVisible();
      });

      await test.step("Verify badge is gone from Shared with me", async () => {
        await newFilesPanel.expectSharedWithMeBadgeVisible(false);
      });

      await test.step("Verify New badge is gone from file in table", async () => {
        await sharedWithMe.filesTable.expectNewBadgeNotVisible(FILE_NAME);
      });
    });

    test("Open location navigates to Shared with me and keeps badge", async ({
      page,
    }) => {
      await test.step("Click Shared with me badge to open panel", async () => {
        await newFilesPanel.openByClickingSharedWithMeBadge();
        await newFilesPanel.expectVisible();
      });

      await test.step("Click open location for the file", async () => {
        await newFilesPanel.clickOpenLocation(FILE_NAME);
      });

      await test.step("Verify panel is closed", async () => {
        await newFilesPanel.expectNotVisible();
      });

      await test.step("Verify URL points to Shared with me", async () => {
        await expect(page).toHaveURL(/shared-with-me/);
      });

      await test.step("Verify Shared with me badge is still visible", async () => {
        await newFilesPanel.expectSharedWithMeBadgeVisible(true);
      });
    });
  });

  test.describe("Rooms badge", () => {
    const FILE_NAME = "PanelRoomDoc";
    const ROOM_NAME = "PanelTestRoom";
    let rooms: Rooms;
    let newFilesPanel: NewFilesPanel;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      const roomResponse = await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "EditingRoom",
      });
      const roomBody = await roomResponse.json();
      const roomId = roomBody.response.id;

      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userId, access: "Editing" }],
        notify: false,
      });

      await apiSdk.files.createFile("owner", roomId, { title: FILE_NAME });

      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userData.email, userData.password);

      rooms = new Rooms(page, api.portalDomain);
      newFilesPanel = new NewFilesPanel(page);
      await rooms.openWithoutEmptyCheck();
    });

    test("Panel opens on badge click and shows file and room name", async () => {
      await test.step("Click Rooms badge", async () => {
        await newFilesPanel.openByClickingRoomsBadge();
      });

      await test.step("Verify panel is visible", async () => {
        await newFilesPanel.expectVisible();
      });

      await test.step("Verify file is shown in panel", async () => {
        await newFilesPanel.expectFileItemVisible(FILE_NAME);
      });

      await test.step("Verify room name is shown in panel", async () => {
        await newFilesPanel.expectRoomTitleVisible(ROOM_NAME);
      });
    });

    test("Mark as read removes New badge on file and Rooms badge", async ({
      page,
    }) => {
      const filesTable = new FilesTable(page);

      await test.step("Open room and verify New badge is visible on file in table", async () => {
        await rooms.openRoom(ROOM_NAME);
        await filesTable.expectNewBadgeVisible(FILE_NAME);
      });

      await test.step("Click Rooms badge to open panel", async () => {
        await newFilesPanel.openByClickingRoomsBadge();
        await newFilesPanel.expectVisible();
      });

      await test.step("Click Mark as read", async () => {
        await newFilesPanel.clickMarkAsRead(FILE_NAME);
      });

      await test.step("Verify panel is no longer visible", async () => {
        await newFilesPanel.expectNotVisible();
      });

      await test.step("Verify New badge is gone from file in table", async () => {
        await filesTable.expectNewBadgeNotVisible(FILE_NAME);
      });

      await test.step("Navigate to Rooms list and verify Rooms badge is gone", async () => {
        await rooms.openWithoutEmptyCheck();
        await newFilesPanel.expectRoomsBadgeVisible(false);
      });
    });

    test("Open location navigates into the room and keeps Rooms badge", async ({
      page,
    }) => {
      await test.step("Click Rooms badge to open panel", async () => {
        await newFilesPanel.openByClickingRoomsBadge();
        await newFilesPanel.expectVisible();
      });

      await test.step("Click open location for the file", async () => {
        await newFilesPanel.clickOpenLocation(FILE_NAME);
      });

      await test.step("Verify panel is closed", async () => {
        await newFilesPanel.expectNotVisible();
      });

      await test.step("Verify URL points inside a room", async () => {
        await expect(page).toHaveURL(/rooms\/shared\/\d+/);
      });

      await test.step("Verify Rooms badge is still visible", async () => {
        await newFilesPanel.expectRoomsBadgeVisible(true);
      });
    });
  });

  test.describe("My Documents badge", () => {
    const FILE_NAME = "PanelMyDocsDoc";
    const FOLDER_NAME = "PanelSharedFolder";
    let myDocuments: MyDocuments;
    let newFilesPanel: NewFilesPanel;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      const myDocsId = await apiSdk.folders.getMyDocumentsFolderId("owner");
      const folderBody = await (
        await apiSdk.folders.createFolder("owner", myDocsId, {
          title: FOLDER_NAME,
        })
      ).json();
      const folderId = folderBody.response.id;

      const { response } = await apiSdk.profiles.addMember("owner", "User");
      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.files.shareFolder("owner", folderId, {
        share: [{ shareTo: userId, access: 1 }],
        notify: false,
      });

      await api.auth.authenticateUser();
      await apiSdk.files.createFile("user", folderId, { title: FILE_NAME });

      const ownerLogin = new Login(page, api.portalDomain);
      await ownerLogin.loginToPortal();

      myDocuments = new MyDocuments(page, api.portalDomain);
      newFilesPanel = new NewFilesPanel(page);
      await myDocuments.open();
    });

    test("Panel opens on badge click and shows new file", async () => {
      await test.step("Click My Documents badge", async () => {
        await newFilesPanel.openByClickingMyDocumentsBadge();
      });

      await test.step("Verify panel is visible", async () => {
        await newFilesPanel.expectVisible();
      });

      await test.step("Verify file is shown in panel", async () => {
        await newFilesPanel.expectFileItemVisible(FILE_NAME);
      });
    });

    test("Open location navigates to My Documents folder and keeps badge", async ({
      page,
    }) => {
      await test.step("Click My Documents badge to open panel", async () => {
        await newFilesPanel.openByClickingMyDocumentsBadge();
        await newFilesPanel.expectVisible();
      });

      await test.step("Click open location for the file", async () => {
        await newFilesPanel.clickOpenLocation(FILE_NAME);
      });

      await test.step("Verify panel is closed", async () => {
        await newFilesPanel.expectNotVisible();
      });

      await test.step("Verify URL points to My Documents section", async () => {
        await expect(page).toHaveURL(/rooms\/personal/);
      });

      await test.step("Verify My Documents badge is still visible", async () => {
        await newFilesPanel.expectMyDocumentsBadgeVisible(true);
      });
    });
  });

  test("More items link appears when multiple files are uploaded to a room", async ({
    page,
    api,
    apiSdk,
  }) => {
    const ROOM_NAME = "PanelMoreItemsRoom";
    const FILE_NAMES = [
      "MoreFile1",
      "MoreFile2",
      "MoreFile3",
      "MoreFile4",
      "MoreFile5",
    ];

    await test.step("Create room, add member and upload multiple files", async () => {
      const roomResponse = await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "EditingRoom",
      });
      const roomBody = await roomResponse.json();
      const roomId = roomBody.response.id;

      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userId, access: "Editing" }],
        notify: false,
      });

      for (const name of FILE_NAMES) {
        await apiSdk.files.createFile("owner", roomId, { title: name });
      }

      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userData.email, userData.password);
    });

    const rooms = new Rooms(page, api.portalDomain);
    const newFilesPanel = new NewFilesPanel(page);

    await test.step("Navigate to Rooms", async () => {
      await rooms.openWithoutEmptyCheck();
    });

    await test.step("Click Rooms badge to open panel", async () => {
      await newFilesPanel.openByClickingRoomsBadge();
      await newFilesPanel.expectVisible();
    });

    await test.step("Verify more items link is visible", async () => {
      await newFilesPanel.expectMoreItemsLinkVisible();
    });
  });
});

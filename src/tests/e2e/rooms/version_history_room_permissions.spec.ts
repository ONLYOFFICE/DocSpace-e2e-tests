import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import Login from "@/src/objects/common/Login";
import FileVersionHistory from "@/src/objects/files/FileVersionHistory";
import {
  documentContextMenuOption,
  pdfFormMoreOptionsSubmenu,
} from "@/src/utils/constants/files";

const FILE_NAME = "test-document";
const ROOM_NAME = "VersionHistoryPermissionsRoom";

test.describe("Version History: room permissions", () => {
  test.describe("Editor", () => {
    let myRooms: MyRooms;
    let login: Login;
    let versionHistory: FileVersionHistory;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      myRooms = new MyRooms(page, api.portalDomain);
      login = new Login(page, api.portalDomain);
      versionHistory = new FileVersionHistory(page);

      const roomResponse = await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "CustomRoom",
      });
      const roomBody = await roomResponse.json();
      const roomId = roomBody.response.id;

      await apiSdk.files.uploadToFolder(
        "owner",
        roomId,
        "data/documents/test-document.docx",
      );

      const { userData, response: userResponse } =
        await apiSdk.profiles.addMember("owner", "User");
      const userBody = await userResponse.json();

      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userBody.response.id, access: "Editing" }],
        notify: false,
      });

      await login.loginWithCredentials(userData.email, userData.password);
      await myRooms.openWithoutEmptyCheck();
    });

    test("Editor can view version history but cannot manage it", async () => {
      await test.step("Navigate into room and open version history", async () => {
        await myRooms.roomsTable.openRoomByName(ROOM_NAME);
        await myRooms.filesTable.openContextMenuForItem(FILE_NAME);
        await myRooms.filesTable.contextMenu.clickSubmenuOption(
          documentContextMenuOption.moreOptions,
          pdfFormMoreOptionsSubmenu.showVersionHistory,
        );
      });

      await test.step("Verify editor sees Open and Download but not management options", async () => {
        const versionIndex = await versionHistory.getEarliestVersionIndex();
        await versionHistory.checkVersionMenuOptions(
          versionIndex,
          ["Open", "Download"],
          ["Edit comment", "Restore", "Delete"],
        );
      });
    });
  });

  test.describe("Viewer", () => {
    let myRooms: MyRooms;
    let login: Login;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      myRooms = new MyRooms(page, api.portalDomain);
      login = new Login(page, api.portalDomain);

      const roomResponse = await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "CustomRoom",
      });
      const roomBody = await roomResponse.json();
      const roomId = roomBody.response.id;

      await apiSdk.files.uploadToFolder(
        "owner",
        roomId,
        "data/documents/test-document.docx",
      );

      const { userData, response: userResponse } =
        await apiSdk.profiles.addMember("owner", "User");
      const userBody = await userResponse.json();

      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userBody.response.id, access: "Read" }],
        notify: false,
      });

      await login.loginWithCredentials(userData.email, userData.password);
      await myRooms.openWithoutEmptyCheck();
    });

    test("Viewer cannot access version history", async () => {
      await test.step("Navigate into room and open file context menu", async () => {
        await myRooms.roomsTable.openRoomByName(ROOM_NAME);
        await myRooms.filesTable.openContextMenuForItem(FILE_NAME);
        await expect(
          myRooms.filesTable.contextMenu.getItemLocator(
            documentContextMenuOption.moreOptions,
          ),
        ).not.toBeVisible();
        await myRooms.filesTable.contextMenu.close();
      });
    });
  });
});

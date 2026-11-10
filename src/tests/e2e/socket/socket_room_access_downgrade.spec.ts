import { test } from "@/src/fixtures";
import Rooms from "@/src/objects/rooms/Rooms";
import { roomToastMessages } from "@/src/utils/constants/rooms";
import { muteSocketEvents } from "@/src/utils/helpers/socket";

// The owner changes rights over the API while the user just sits in the room:
// the tab must pick up the new rights over the socket and stay where it is,
// instead of being reset to the section root.
const ROOM_NAME = "Access Downgrade Room";
const SUBFOLDER_NAME = "Access Downgrade Folder";
const FILE_NAME = "Access Downgrade Doc";
// Big enough batch (~45 MB, many requests) to still be uploading when the
// owner lowers the rights right after it starts.
const UPLOAD_FILE_NAMES = Array.from(
  { length: 30 },
  (_, i) => `Upload ${i + 1}.txt`,
);
const UPLOAD_FILE_SIZE = 1.5 * 1024 * 1024;
const REJECTED_FOLDER_NAME = "Rejected Folder";

test.describe("Socket: room access downgrade keeps the user in the room", () => {
  let rooms: Rooms;
  let roomId: number;
  let subfolderId: number;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    rooms = new Rooms(page, api.portalDomain);

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "CustomRoom",
    });
    roomId = (await roomResponse.json()).response.id;

    const folderResponse = await apiSdk.files.createFolder(
      "owner",
      roomId,
      SUBFOLDER_NAME,
    );
    subfolderId = (await folderResponse.json()).response.id;
    await apiSdk.files.createFile("owner", subfolderId, { title: FILE_NAME });
  });

  test("Content creator lowered to Viewer stays in the room and loses create actions", async ({
    apiSdk,
    login,
  }) => {
    const { userData, userId } = await apiSdk.profiles.addMemberWithId(
      "owner",
      "User",
    );
    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "ContentCreator" }],
      notify: false,
    });

    await test.step("User opens the room as Content creator", async () => {
      await login.loginWithCredentials(userData.email, userData.password);
      await rooms.openWithoutEmptyCheck();
      await rooms.openRoom(ROOM_NAME);
      await rooms.filesTable.checkRowExist(SUBFOLDER_NAME);
      await rooms.navigation.checkAddButtonVisible();
    });

    await test.step("Owner lowers the user to Viewer", async () => {
      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userId, access: "Read" }],
        notify: false,
      });
    });

    await test.step("Create actions disappear without a reload, the room stays open", async () => {
      await rooms.navigation.checkAddButtonHidden();
      await rooms.quickActions.checkPanelHidden();
      await rooms.expectStayedInFolder(roomId);
      await rooms.filesTable.checkRowExist(SUBFOLDER_NAME);
    });
  });

  test("Rights change is applied inside a nested folder of the room", async ({
    apiSdk,
    login,
  }) => {
    const { userData, userId } = await apiSdk.profiles.addMemberWithId(
      "owner",
      "User",
    );
    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "Read" }],
      notify: false,
    });

    await test.step("User opens a folder inside the room as Viewer", async () => {
      await login.loginWithCredentials(userData.email, userData.password);
      await rooms.openWithoutEmptyCheck();
      await rooms.openRoom(ROOM_NAME);
      await rooms.filesTable.openItem(SUBFOLDER_NAME);
      await rooms.filesTable.checkRowExist(FILE_NAME);
      await rooms.navigation.checkAddButtonHidden();
    });

    await test.step("Owner raises the user to Content creator - create actions appear in the folder", async () => {
      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userId, access: "ContentCreator" }],
        notify: false,
      });
      await rooms.navigation.checkAddButtonVisible();
      await rooms.expectStayedInFolder(subfolderId);
    });

    await test.step("Owner lowers the user back to Viewer - create actions go away, the folder stays open", async () => {
      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userId, access: "Read" }],
        notify: false,
      });
      await rooms.navigation.checkAddButtonHidden();
      await rooms.quickActions.checkPanelHidden();
      await rooms.expectStayedInFolder(subfolderId);
      await rooms.filesTable.checkRowExist(FILE_NAME);
    });
  });

  test("Upload interrupted by lowering to Viewer shows one error toast and keeps the folder open", async ({
    apiSdk,
    login,
  }) => {
    const { userData, userId } = await apiSdk.profiles.addMemberWithId(
      "owner",
      "User",
    );
    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "ContentCreator" }],
      notify: false,
    });

    await test.step("Content creator opens a folder inside the room", async () => {
      await login.loginWithCredentials(userData.email, userData.password);
      await rooms.openWithoutEmptyCheck();
      await rooms.openRoom(ROOM_NAME);
      await rooms.filesTable.openItem(SUBFOLDER_NAME);
      await rooms.filesTable.checkRowExist(FILE_NAME);
      await rooms.navigation.checkAddButtonVisible();
    });

    await test.step("User starts a large batch upload", async () => {
      await rooms.filesNavigation.uploadGeneratedFiles(
        UPLOAD_FILE_NAMES,
        UPLOAD_FILE_SIZE,
      );
    });

    await test.step("Owner lowers the user to Viewer while the upload is running", async () => {
      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userId, access: "Read" }],
        notify: false,
      });
    });

    await test.step("Upload stops with a single error toast, the folder stays open", async () => {
      await rooms.toast.checkSingleToastMessage(
        roomToastMessages.uploadingError,
        30000,
      );
      await rooms.navigation.checkAddButtonHidden();
      await rooms.quickActions.checkPanelHidden();
      await rooms.expectStayedInFolder(subfolderId);
      await rooms.filesTable.checkRowExist(FILE_NAME);
    });
  });

  // Without missed socket events the removal itself sends the user to the
  // rooms list at once; the no-access page is the fallback for a stale page
  // whose next request gets 403.
  test("User removed from the room on a stale page gets the no-access page on the next action", async ({
    page,
    apiSdk,
    login,
  }) => {
    const { userData, userId } = await apiSdk.profiles.addMemberWithId(
      "owner",
      "User",
    );
    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "ContentCreator" }],
      notify: false,
    });

    await test.step("Mute socket events so the page misses the removal", async () => {
      await muteSocketEvents(page);
    });

    await test.step("Content creator opens a folder inside the room", async () => {
      await login.loginWithCredentials(userData.email, userData.password);
      await rooms.openWithoutEmptyCheck();
      await rooms.openRoom(ROOM_NAME);
      await rooms.filesTable.openItem(SUBFOLDER_NAME);
      await rooms.filesTable.checkRowExist(FILE_NAME);
      await rooms.navigation.checkAddButtonVisible();
    });

    await test.step("Owner removes the user from the room - the stale page still offers create actions", async () => {
      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userId, access: "None" }],
        notify: false,
      });
      await rooms.navigation.checkAddButtonVisible();
      await rooms.quickActions.checkPanelVisible();
      await rooms.expectStayedInFolder(subfolderId);
    });

    await test.step("Creating a folder is rejected with a single toast", async () => {
      await rooms.createFolderFromAddButton(REJECTED_FOLDER_NAME);
      await rooms.toast.checkSingleToastMessage(
        roomToastMessages.noPermissionToCreate,
      );
    });

    await test.step("Re-read folder shows the no-access page instead of resetting the tab", async () => {
      await rooms.expectNoRoomAccessPage();
      await rooms.navigation.checkAddButtonHidden();
      await rooms.quickActions.checkPanelHidden();
    });

    await test.step("No-access page redirects to the rooms list", async () => {
      await rooms.expectDroppedOutOfRoom(subfolderId);
    });
  });

  test("Lowering the user type shows a reload prompt and keeps the room open", async ({
    apiSdk,
    login,
  }) => {
    const { userData, userId } = await apiSdk.profiles.addMemberWithId(
      "owner",
      "RoomAdmin",
    );
    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "Read" }],
      notify: false,
    });

    await test.step("Room admin opens a folder inside the room", async () => {
      await login.loginWithCredentials(userData.email, userData.password);
      await rooms.openWithoutEmptyCheck();
      await rooms.openRoom(ROOM_NAME);
      await rooms.filesTable.openItem(SUBFOLDER_NAME);
      await rooms.filesTable.checkRowExist(FILE_NAME);
    });

    // Integration UI tests mode hides the top bar where the reload prompt is
    // shown. It is turned off only now: its reload right after login can race
    // the redirect to the home page (seen in Firefox), the folder URL is safe.
    await test.step("Turn off integration UI tests mode and clear the top bar", async () => {
      await rooms.disableIntegrationUITestsMode();
      await rooms.expectStayedInFolder(subfolderId);
      await rooms.filesTable.checkRowExist(FILE_NAME);
      await rooms.closeTopBarSnackbars();
    });

    await test.step("Owner changes the user type from Room admin to User", async () => {
      await apiSdk.profiles.changeUserType("owner", userId, "User");
    });

    await test.step("Reload prompt appears, the open folder is not replaced by the rooms list", async () => {
      await rooms.checkUserTypeChangedSnackbarVisible();
      await rooms.expectStayedInFolder(subfolderId);
      await rooms.filesTable.checkRowExist(FILE_NAME);
    });

    await test.step("Reload page link reloads the folder and hides the prompt", async () => {
      await rooms.reloadFromUserTypeChangedSnackbar();
      await rooms.expectStayedInFolder(subfolderId);
      await rooms.filesTable.checkRowExist(FILE_NAME);
    });
  });
});

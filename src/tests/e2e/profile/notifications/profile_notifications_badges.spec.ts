import { test } from "@/src/fixtures";
import ProfileNotifications from "@/src/objects/profile/ProfileNotifications";
import SharedWithMe from "@/src/objects/files/SharedWithMe";
import Rooms from "@/src/objects/rooms/Rooms";
import MyDocuments from "@/src/objects/files/MyDocuments";
import LeaveRoomDialog from "@/src/objects/rooms/LeaveRoomDialog";
import Login from "@/src/objects/common/Login";
import { Backup } from "@/src/objects/settings/backup/Backup";
import { PaymentApi } from "@/src/api/payment";
import { roomGroupContextMenuOption } from "@/src/utils/constants/rooms";

test.describe("Profile - Notifications - Badges", () => {
  const FILE_NAME = "SharedDocument";

  test("Badge appears on Shared with me when file activity notifications are enabled", async ({
    page,
    api,
    apiSdk,
  }) => {
    let fileId: number;
    let userEmail: string;
    let userPassword: string;

    await test.step("Create file in My Documents via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: FILE_NAME,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;
    });

    await test.step("Create member user and share file with them", async () => {
      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      userEmail = userData.email;
      userPassword = userData.password;

      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 2 }],
        notify: false,
      });
    });

    await test.step("Login as member (toggle is enabled by default)", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);
    });

    await test.step("Navigate to Shared with me", async () => {
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
    });

    await test.step("Verify badge is visible on Shared with me", async () => {
      const profileNotifications = new ProfileNotifications(
        page,
        api.portalDomain,
      );
      await profileNotifications.expectSharedWithMeBadgeVisible(true);
    });
  });

  test("Badge appears on Rooms when a file is uploaded to a room the user is a member of", async ({
    page,
    api,
    apiSdk,
  }) => {
    const ROOM_NAME = "BadgeTestRoom";
    let userEmail: string;
    let userPassword: string;

    await test.step("Create room, add member and upload file via API", async () => {
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
      userEmail = userData.email;
      userPassword = userData.password;

      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userId, access: "Editing" }],
        notify: false,
      });

      await apiSdk.files.createFile("owner", roomId, { title: FILE_NAME });
    });

    await test.step("Login as member (toggle is enabled by default)", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);
    });

    await test.step("Navigate to Rooms", async () => {
      const rooms = new Rooms(page, api.portalDomain);
      await rooms.openWithoutEmptyCheck();
    });

    await test.step("Verify badge is visible on Rooms", async () => {
      const profileNotifications = new ProfileNotifications(
        page,
        api.portalDomain,
      );
      await profileNotifications.expectRoomsBadgeVisible(true);
    });
  });

  test("Badge appears on My Documents when member creates file in shared folder", async ({
    page,
    api,
    apiSdk,
  }) => {
    const FOLDER_NAME = "SharedFolder";

    await test.step("Create folder in My Documents, add member and share folder via API", async () => {
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
    });

    await test.step("Login as owner (toggle is enabled by default)", async () => {
      const ownerLogin = new Login(page, api.portalDomain);
      await ownerLogin.loginToPortal();
    });

    await test.step("Navigate to My Documents", async () => {
      const myDocuments = new MyDocuments(page, api.portalDomain);
      await myDocuments.open();
    });

    await test.step("Verify badge is visible on My Documents", async () => {
      const profileNotifications = new ProfileNotifications(
        page,
        api.portalDomain,
      );
      await profileNotifications.expectMyDocumentsBadgeVisible(true);
    });
  });

  test("Badges do not appear anywhere when file activity notifications are disabled", async ({
    page,
    api,
    apiSdk,
  }) => {
    const ROOM_NAME = "BadgeTestRoom";
    const FOLDER_NAME = "SharedFolder";
    let userEmail: string;
    let userPassword: string;

    await test.step("Setup: create file, room and shared folder via API", async () => {
      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      userEmail = userData.email;
      userPassword = userData.password;
      const userBody = await response.json();
      const userId = userBody.response.id;

      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: FILE_NAME,
      });
      const fileBody = await fileResponse.json();
      await apiSdk.files.shareFile("owner", fileBody.response.id, {
        share: [{ shareTo: userId, access: 2 }],
        notify: false,
      });

      const roomResponse = await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "EditingRoom",
      });
      const roomBody = await roomResponse.json();
      const roomId = roomBody.response.id;
      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userId, access: "Editing" }],
        notify: false,
      });
      await apiSdk.files.createFile("owner", roomId, { title: FILE_NAME });

      const myDocsId = await apiSdk.folders.getMyDocumentsFolderId("owner");
      const folderBody = await (
        await apiSdk.folders.createFolder("owner", myDocsId, {
          title: FOLDER_NAME,
        })
      ).json();
      const folderId = folderBody.response.id;
      await apiSdk.files.shareFolder("owner", folderId, {
        share: [{ shareTo: userId, access: 1 }],
        notify: false,
      });
      await api.auth.authenticateUser();
      await apiSdk.files.createFile("user", folderId, { title: FILE_NAME });
    });

    await test.step("Login as member and disable file activity notifications", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);
      const profileNotifications = new ProfileNotifications(
        page,
        api.portalDomain,
      );
      await profileNotifications.open();
      await profileNotifications.toggleFileActivity();
    });

    await test.step("Verify badge is not visible on Shared with me", async () => {
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
      const profileNotifications = new ProfileNotifications(
        page,
        api.portalDomain,
      );
      await profileNotifications.expectSharedWithMeBadgeVisible(false);
    });

    await test.step("Verify badge is not visible on Rooms", async () => {
      const rooms = new Rooms(page, api.portalDomain);
      await rooms.openWithoutEmptyCheck();
      const profileNotifications = new ProfileNotifications(
        page,
        api.portalDomain,
      );
      await profileNotifications.expectRoomsBadgeVisible(false);
    });

    await test.step("Login as owner and disable file activity notifications", async () => {
      const ownerLogin = new Login(page, api.portalDomain);
      await ownerLogin.logout();
      await ownerLogin.loginToPortal();
      const profileNotifications = new ProfileNotifications(
        page,
        api.portalDomain,
      );
      await profileNotifications.open();
      await profileNotifications.toggleFileActivity();
    });

    await test.step("Verify badge is not visible on My Documents", async () => {
      const myDocuments = new MyDocuments(page, api.portalDomain);
      await myDocuments.open();
      const profileNotifications = new ProfileNotifications(
        page,
        api.portalDomain,
      );
      await profileNotifications.expectMyDocumentsBadgeVisible(false);
    });
  });

  test("Badge appears on Shared with me when shared file is edited", async ({
    page,
    api,
    apiSdk,
  }) => {
    let userEmail: string;
    let userPassword: string;

    await test.step("Upload file, share with member, then edit via API", async () => {
      const uploadedFile = await apiSdk.files.uploadToMyDocuments(
        "owner",
        "data/documents/test-document.docx",
      );

      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      userEmail = userData.email;
      userPassword = userData.password;

      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.files.shareFile("owner", uploadedFile.id, {
        share: [{ shareTo: userId, access: 2 }],
        notify: false,
      });

      await apiSdk.files.createNewVersion(
        "owner",
        uploadedFile.id,
        "data/documents/test-document.docx",
      );
    });

    await test.step("Login as member (toggle is enabled by default)", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);
    });

    await test.step("Navigate to Shared with me", async () => {
      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();
    });

    await test.step("Verify badge is visible on Shared with me", async () => {
      const profileNotifications = new ProfileNotifications(
        page,
        api.portalDomain,
      );
      await profileNotifications.expectSharedWithMeBadgeVisible(true);
    });
  });

  test("Badge appears on Rooms when a file in a room is edited", async ({
    page,
    api,
    apiSdk,
  }) => {
    const ROOM_NAME = "EditBadgeRoom";
    let userEmail: string;
    let userPassword: string;

    await test.step("Create room, add member, upload and edit file via API", async () => {
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
      userEmail = userData.email;
      userPassword = userData.password;

      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userId, access: "Editing" }],
        notify: false,
      });

      const uploadedFile = await apiSdk.files.uploadToFolder(
        "owner",
        roomId,
        "data/documents/test-document.docx",
      );

      await apiSdk.files.createNewVersion(
        "owner",
        uploadedFile.id,
        "data/documents/test-document.docx",
      );
    });

    await test.step("Login as member (toggle is enabled by default)", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);
    });

    await test.step("Navigate to Rooms", async () => {
      const rooms = new Rooms(page, api.portalDomain);
      await rooms.openWithoutEmptyCheck();
    });

    await test.step("Verify badge is visible on Rooms", async () => {
      const profileNotifications = new ProfileNotifications(
        page,
        api.portalDomain,
      );
      await profileNotifications.expectRoomsBadgeVisible(true);
    });
  });

  test("Badge appears on My Documents when member edits file in shared folder", async ({
    page,
    api,
    apiSdk,
  }) => {
    const FOLDER_NAME = "SharedFolderEdit";

    await test.step("Create folder, share with member, upload file and edit via API", async () => {
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

      const uploadedFile = await apiSdk.files.uploadToFolder(
        "owner",
        folderId,
        "data/documents/test-document.docx",
      );

      await api.auth.authenticateUser();
      await apiSdk.files.createNewVersion(
        "user",
        uploadedFile.id,
        "data/documents/test-document.docx",
      );
    });

    await test.step("Login as owner (toggle is enabled by default)", async () => {
      const ownerLogin = new Login(page, api.portalDomain);
      await ownerLogin.loginToPortal();
    });

    await test.step("Navigate to My Documents", async () => {
      const myDocuments = new MyDocuments(page, api.portalDomain);
      await myDocuments.open();
    });

    await test.step("Verify badge is visible on My Documents", async () => {
      const profileNotifications = new ProfileNotifications(
        page,
        api.portalDomain,
      );
      await profileNotifications.expectMyDocumentsBadgeVisible(true);
    });
  });

  test("Rooms badge disappears after user leaves the room", async ({
    page,
    api,
    apiSdk,
  }) => {
    const ROOM_NAME = "BadgeLeaveRoomTest";
    let userEmail: string;
    let userPassword: string;

    await test.step("Create room, add member and upload file via API", async () => {
      const roomResponse = await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "CustomRoom",
      });
      const roomBody = await roomResponse.json();
      const roomId = roomBody.response.id;

      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      userEmail = userData.email;
      userPassword = userData.password;

      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userId, access: "Editing" }],
        notify: false,
      });

      await apiSdk.files.createFile("owner", roomId, { title: FILE_NAME });
    });

    await test.step("Login as member (toggle is enabled by default)", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);
    });

    await test.step("Navigate to My Documents and verify Rooms badge is visible", async () => {
      const myDocuments = new MyDocuments(page, api.portalDomain);
      await myDocuments.open();
      const profileNotifications = new ProfileNotifications(
        page,
        api.portalDomain,
      );
      await profileNotifications.expectRoomsBadgeVisible(true);
    });

    await test.step("Navigate to Rooms and leave the room", async () => {
      const rooms = new Rooms(page, api.portalDomain);
      await rooms.openWithoutEmptyCheck();
      await rooms.roomsTable.openContextMenu(ROOM_NAME);
      await rooms.roomsTable.clickContextMenuOption(
        roomGroupContextMenuOption.leaveRoom,
      );
      const leaveRoomDialog = new LeaveRoomDialog(page);
      await leaveRoomDialog.submit();
    });

    await test.step("Navigate to My Documents and verify Rooms badge is gone", async () => {
      const myDocuments = new MyDocuments(page, api.portalDomain);
      await myDocuments.open();
      const profileNotifications = new ProfileNotifications(
        page,
        api.portalDomain,
      );
      await profileNotifications.expectRoomsBadgeVisible(false);
    });
  });

  test("Rooms badge appears after portal owner creates backup to a room", async ({
    page,
    api,
    apiSdk,
    services,
  }) => {
    const ROOM_NAME = "BackupBadgeRoom";
    let userEmail: string;
    let userPassword: string;

    await test.step("Create room and add member via API", async () => {
      const roomResponse = await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "CustomRoom",
      });
      const roomBody = await roomResponse.json();
      const roomId: number = roomBody.response.id;

      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      userEmail = userData.email;
      userPassword = userData.password;

      const memberBody = await response.json();
      const memberId: string = memberBody.response.id;

      await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: memberId, access: "Editing" }],
        notify: false,
      });
    });

    await test.step("Setup payment, activate backup service, and create backup to room", async () => {
      const paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
      await paymentApi.setupPayment();

      const login = new Login(page, api.portalDomain);
      await login.loginToPortal();
      await services.activateBackupService();

      const backup = new Backup(page);
      await backup.open();
      await backup.createBackupToRoom(ROOM_NAME);

      await login.logout();
    });

    await test.step("Login as member", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);
    });

    await test.step("Navigate to Rooms and verify badge is visible", async () => {
      const rooms = new Rooms(page, api.portalDomain);
      await rooms.openWithoutEmptyCheck();
      const profileNotifications = new ProfileNotifications(
        page,
        api.portalDomain,
      );
      await profileNotifications.expectRoomsBadgeVisible(true);
    });
  });
});

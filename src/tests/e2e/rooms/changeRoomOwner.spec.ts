import { test } from "@/src/fixtures";
import Rooms from "@/src/objects/rooms/Rooms";
import Login from "@/src/objects/common/Login";
import LeaveRoomDialog from "@/src/objects/rooms/LeaveRoomDialog";
import {
  roomGroupContextMenuOption,
  roomToastMessages,
} from "@/src/utils/constants/rooms";
import { documentContextMenuOption } from "@/src/utils/constants/files";
import FolderDeleteModal from "@/src/objects/files/FolderDeleteModal";

const ROOM_NAME = "ChangeRoomOwnerTest";
const OWNER_SELECTOR_INFO_TEXT =
  "Only a room admin or a DocSpace admin can become the owner of the room";

test.describe("Rooms - Change room owner", () => {
  let rooms: Rooms;
  let login: Login;
  let leaveRoomDialog: LeaveRoomDialog;
  let dsaLastName: string;
  let dsaEmail: string;
  let dsaPassword: string;
  let userFirstName: string;
  let guestFirstName: string;
  let ownerFirstName: string;
  let roomId: number;
  let roomAdminFirstName: string;
  let roomAdminEmail: string;
  let roomAdminId: string;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    rooms = new Rooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);
    leaveRoomDialog = new LeaveRoomDialog(page);

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "CustomRoom",
    });
    const roomBody = await roomResponse.json();
    roomId = roomBody.response.id;

    const { userData: dsaUserData, response: dsaResponse } =
      await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    const dsaBody = await dsaResponse.json();
    dsaLastName = dsaBody.response.lastName;
    dsaEmail = dsaUserData.email;
    dsaPassword = dsaUserData.password;

    const { response: userResponse } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    const userBody = await userResponse.json();
    userFirstName = userBody.response.firstName;

    const { response: guestResponse } = await apiSdk.profiles.addMember(
      "owner",
      "Guest",
    );
    const guestBody = await guestResponse.json();
    guestFirstName = guestBody.response.firstName;

    const { userData: roomAdminUserData, response: roomAdminResponse } =
      await apiSdk.profiles.addMember("owner", "RoomAdmin");
    const roomAdminBody = await roomAdminResponse.json();
    roomAdminFirstName = roomAdminBody.response.firstName;
    roomAdminEmail = roomAdminUserData.email;
    roomAdminId = roomAdminBody.response.id;

    const ownerSelfResponse =
      await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerSelfBody = await ownerSelfResponse.json();
    ownerFirstName = ownerSelfBody.response.firstName;

    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [
        { id: dsaBody.response.id, access: "RoomAdmin" },
        { id: userBody.response.id, access: "Editing" },
        { id: guestBody.response.id, access: "Editing" },
        { id: roomAdminId, access: "Read" },
      ],
      notify: false,
    });

    await login.loginToPortal();
    await rooms.roomsTable.checkRowExist(ROOM_NAME);
  });

  test("Owner can assign a new room owner via context menu", async () => {
    await test.step("Open Change room owner panel via More options submenu", async () => {
      await rooms.roomsTable.openContextMenu(ROOM_NAME);
      await rooms.roomsTable.contextMenu.clickSubmenuOption(
        roomGroupContextMenuOption.moreOptions,
        roomGroupContextMenuOption.changeRoomOwner,
      );
      await leaveRoomDialog.checkOwnerSelectorExist();
    });

    await test.step("Select DSA as new owner and submit", async () => {
      await leaveRoomDialog.searchForUser(dsaEmail);
      await leaveRoomDialog.selectUserByEmail(dsaEmail);
      await leaveRoomDialog.submitOwnerSelection();
      await rooms.toast.checkToastMessage(roomToastMessages.leftRoom);
    });

    await test.step("Verify DSA is listed as room owner in info panel", async () => {
      await rooms.infoPanel.open();
      await rooms.roomsTable.selectRow(ROOM_NAME);
      await rooms.infoPanel.openTab("Details");
      await rooms.infoPanel.checkDetailsOwner(dsaLastName);
    });
  });

  test("Owner selector shows only eligible users as potential new owners", async () => {
    await rooms.roomsTable.openContextMenu(ROOM_NAME);
    await rooms.roomsTable.contextMenu.clickSubmenuOption(
      roomGroupContextMenuOption.moreOptions,
      roomGroupContextMenuOption.changeRoomOwner,
    );
    await leaveRoomDialog.checkOwnerSelectorExist();
    await leaveRoomDialog.checkSelectorInfoText(OWNER_SELECTOR_INFO_TEXT);
    await leaveRoomDialog.checkUserVisibleInSelector(dsaEmail);
    await leaveRoomDialog.checkUserNotVisibleInSelector(userFirstName);
    await leaveRoomDialog.checkUserNotVisibleInSelector(guestFirstName);
  });

  test("Portal Room Admin with minimal room access can be assigned as new owner", async () => {
    await test.step("Open Change room owner panel via More options submenu", async () => {
      await rooms.roomsTable.openContextMenu(ROOM_NAME);
      await rooms.roomsTable.contextMenu.clickSubmenuOption(
        roomGroupContextMenuOption.moreOptions,
        roomGroupContextMenuOption.changeRoomOwner,
      );
      await leaveRoomDialog.checkOwnerSelectorExist();
    });

    await test.step("Select portal Room Admin as new owner and submit", async () => {
      await leaveRoomDialog.searchForUser(roomAdminEmail);
      await leaveRoomDialog.selectUserByEmail(roomAdminEmail);
      await leaveRoomDialog.submitOwnerSelection();
      await rooms.toast.checkToastMessage(roomToastMessages.leftRoom);
    });

    await test.step("Verify new owner is shown in Details tab", async () => {
      await rooms.infoPanel.open();
      await rooms.roomsTable.selectRow(ROOM_NAME);
      await rooms.infoPanel.openTab("Details");
      await rooms.infoPanel.checkDetailsOwner(roomAdminFirstName);
    });

    await test.step("Verify new owner is not listed as participant in Contacts tab", async () => {
      await rooms.infoPanel.openTab("Contacts");
      await rooms.infoPanel.checkMemberNotInList(roomAdminFirstName);
    });
  });

  test("Portal owner can take ownership of a room created by DSA", async ({
    api,
    apiSdk,
  }) => {
    const DSA_ROOM_NAME = "DSAOwnedRoom";

    await test.step("Create room as DSA", async () => {
      await api.auth.authenticateDocSpaceAdmin();
      await apiSdk.rooms.createRoom("docSpaceAdmin", {
        title: DSA_ROOM_NAME,
        roomType: "CustomRoom",
      });
    });

    await test.step("Open Change room owner panel on DSA's room", async () => {
      await rooms.openWithoutEmptyCheck();
      await rooms.roomsTable.openContextMenu(DSA_ROOM_NAME);
      await rooms.roomsTable.contextMenu.clickSubmenuOption(
        roomGroupContextMenuOption.moreOptions,
        roomGroupContextMenuOption.changeRoomOwner,
      );
      await leaveRoomDialog.checkOwnerSelectorExist();
    });

    await test.step("Select portal owner as new owner and submit", async () => {
      await leaveRoomDialog.searchForUser(ownerFirstName);
      await leaveRoomDialog.selectUserByName(ownerFirstName);
      await leaveRoomDialog.submitOwnerSelection();
      await rooms.toast.checkToastMessage(roomToastMessages.appointedNewOwner);
    });

    await test.step("Verify portal owner is listed as room owner in Details tab", async () => {
      await rooms.openWithoutEmptyCheck();
      await rooms.infoPanel.open();
      await rooms.roomsTable.selectRow(DSA_ROOM_NAME);
      await rooms.infoPanel.openTab("Details");
      await rooms.infoPanel.checkDetailsOwner(ownerFirstName);
    });
  });

  test("Owner stays as Room manager when footer checkbox is unchecked", async () => {
    await test.step("Open Change room owner panel and verify checkbox is checked by default", async () => {
      await rooms.roomsTable.openContextMenu(ROOM_NAME);
      await rooms.roomsTable.contextMenu.clickSubmenuOption(
        roomGroupContextMenuOption.moreOptions,
        roomGroupContextMenuOption.changeRoomOwner,
      );
      await leaveRoomDialog.checkOwnerSelectorExist();
      await leaveRoomDialog.checkFooterCheckboxIsChecked();
    });

    await test.step("Uncheck checkbox, assign DSA as new owner, and submit", async () => {
      await leaveRoomDialog.toggleFooterCheckbox();
      await leaveRoomDialog.searchForUser(dsaEmail);
      await leaveRoomDialog.selectUserByEmail(dsaEmail);
      await leaveRoomDialog.submitOwnerSelection();
      await rooms.toast.checkToastMessage(roomToastMessages.appointedNewOwner);
      await rooms.roomsTable.checkRowExist(ROOM_NAME);
    });

    await test.step("Verify owner is listed as Room manager in Contacts tab", async () => {
      await rooms.infoPanel.open();
      await rooms.roomsTable.selectRow(ROOM_NAME);
      await rooms.infoPanel.openTab("Contacts");
      await rooms.infoPanel.checkMemberHasRole(ownerFirstName, "Room manager");
    });
  });

  test("Room files, folders, and members are preserved after ownership transfer", async ({
    page,
  }) => {
    const FILE_PATH = "data/avatars/AvatarPNG.png";
    const FILE_NAME = "AvatarPNG";
    const DOC_FILE_PATH = "data/documents/test-document.docx";
    const DOC_FILE_NAME = "test-document";
    const FOLDER_NAME = "ContentTestFolder";

    await test.step("Upload files and create folder inside the room", async () => {
      await rooms.roomsTable.openRoomByName(ROOM_NAME);
      await rooms.filesNavigation.uploadFiles([FILE_PATH, DOC_FILE_PATH]);
      await rooms.filesTable.checkRowExist(FILE_NAME);
      await rooms.filesTable.checkRowExist(DOC_FILE_NAME);
      await rooms.filesNavigation.openActionsDropdown();
      await rooms.filesNavigation.selectCreateAction("Folder");
      await rooms.filesNavigation.modal.fillCreateTextInput(FOLDER_NAME);
      await rooms.filesNavigation.modal.clickCreateButton();
      await rooms.filesTable.checkRowExist(FOLDER_NAME);
      await rooms.backToRooms();
    });

    await test.step("Transfer ownership to DSA, stay in room as Room manager", async () => {
      await rooms.roomsTable.openContextMenu(ROOM_NAME);
      await rooms.roomsTable.contextMenu.clickSubmenuOption(
        roomGroupContextMenuOption.moreOptions,
        roomGroupContextMenuOption.changeRoomOwner,
      );
      await leaveRoomDialog.checkOwnerSelectorExist();
      await leaveRoomDialog.toggleFooterCheckbox();
      await leaveRoomDialog.searchForUser(dsaEmail);
      await leaveRoomDialog.selectUserByEmail(dsaEmail);
      await leaveRoomDialog.submitOwnerSelection();
      await rooms.toast.checkToastMessage(roomToastMessages.appointedNewOwner);
    });

    await test.step("Verify files and folder are preserved in the room", async () => {
      await rooms.roomsTable.openRoomByName(ROOM_NAME);
      await rooms.filesTable.checkRowExist(FILE_NAME);
      await rooms.filesTable.checkRowExist(DOC_FILE_NAME);
      await rooms.filesTable.checkRowExist(FOLDER_NAME);
      await rooms.backToRooms();
    });

    await test.step("Verify ownership transferred and members are preserved", async () => {
      await rooms.infoPanel.open();
      await rooms.roomsTable.selectRow(ROOM_NAME);
      await rooms.infoPanel.openTab("Contacts");
      await rooms.infoPanel.checkMemberHasRole(ownerFirstName, "Room manager");
      await rooms.infoPanel.checkMemberInList(userFirstName);
      await rooms.infoPanel.checkMemberInList(guestFirstName);
    });

    await test.step("DSA can delete file and open document for editing", async () => {
      await login.logout();
      await login.loginWithCredentials(dsaEmail, dsaPassword);
      await rooms.roomsTable.openRoomByName(ROOM_NAME);

      await rooms.filesTable.openContextMenuForItem(FILE_NAME);
      await rooms.filesTable.contextMenu.clickOption(
        documentContextMenuOption.delete,
      );
      const deleteModal = new FolderDeleteModal(page);
      await deleteModal.clickDeleteFolder();
      await rooms.removeToast();
      await rooms.filesTable.checkRowNotExist(FILE_NAME);

      await rooms.filesTable.openContextMenuForItem(DOC_FILE_NAME);
      const [editorPage] = await Promise.all([
        page.context().waitForEvent("page", { timeout: 30000 }),
        rooms.filesTable.contextMenu.clickOption(
          documentContextMenuOption.edit,
        ),
      ]);
      await editorPage.waitForLoadState("load");
      await editorPage.close();
    });
  });
});

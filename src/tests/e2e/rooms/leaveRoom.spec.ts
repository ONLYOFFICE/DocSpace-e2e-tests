import { test } from "@/src/fixtures";
import Rooms from "@/src/objects/rooms/Rooms";
import Login from "@/src/objects/common/Login";
import LeaveRoomDialog from "@/src/objects/rooms/LeaveRoomDialog";
import {
  roomGroupContextMenuOption,
  roomToastMessages,
} from "@/src/utils/constants/rooms";

const ROOM_NAME = "LeaveRoomTest";

test.describe("Rooms - Leave room (User)", () => {
  let rooms: Rooms;
  let login: Login;
  let leaveRoomDialog: LeaveRoomDialog;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    rooms = new Rooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);
    leaveRoomDialog = new LeaveRoomDialog(page);

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "CustomRoom",
    });
    const roomBody = await roomResponse.json();
    const roomId = roomBody.response.id;

    const { userData, response: userResponse } =
      await apiSdk.profiles.addMember("owner", "User");
    const userBody = await userResponse.json();
    const userId = userBody.response.id;

    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "Editing" }],
      notify: false,
    });

    await login.loginWithCredentials(userData.email, userData.password);
    await rooms.openWithoutEmptyCheck();
    await rooms.roomsTable.checkRowExist(ROOM_NAME);
  });

  test("User can leave a room", async () => {
    await rooms.roomsTable.openContextMenu(ROOM_NAME);
    await rooms.roomsTable.clickContextMenuOption(
      roomGroupContextMenuOption.leaveRoom,
    );
    await leaveRoomDialog.checkDialogExist();
    await leaveRoomDialog.submit();
    await rooms.toast.checkToastMessage(roomToastMessages.leftRoom);
    await rooms.roomsTable.checkRowNotExist(ROOM_NAME);
  });

  test("User can cancel leaving a room", async () => {
    await rooms.roomsTable.openContextMenu(ROOM_NAME);
    await rooms.roomsTable.clickContextMenuOption(
      roomGroupContextMenuOption.leaveRoom,
    );
    await leaveRoomDialog.checkDialogExist();
    await leaveRoomDialog.cancel();
    await rooms.roomsTable.checkRowExist(ROOM_NAME);
  });
});

test.describe("Rooms - Leave room (Guest)", () => {
  let rooms: Rooms;
  let login: Login;
  let leaveRoomDialog: LeaveRoomDialog;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    rooms = new Rooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);
    leaveRoomDialog = new LeaveRoomDialog(page);

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "CustomRoom",
    });
    const roomBody = await roomResponse.json();
    const roomId = roomBody.response.id;

    const { userData, response: guestResponse } =
      await apiSdk.profiles.addMember("owner", "Guest");
    const guestBody = await guestResponse.json();
    const guestId = guestBody.response.id;

    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: guestId, access: "Editing" }],
      notify: false,
    });

    await login.loginWithCredentials(userData.email, userData.password);
    await rooms.openWithoutEmptyCheck();
    await rooms.roomsTable.checkRowExist(ROOM_NAME);
  });

  test("Guest can leave a room", async () => {
    await rooms.roomsTable.openContextMenu(ROOM_NAME);
    await rooms.roomsTable.clickContextMenuOption(
      roomGroupContextMenuOption.leaveRoom,
    );
    await leaveRoomDialog.checkDialogExist();
    await leaveRoomDialog.submit();
    await rooms.toast.checkToastMessage(roomToastMessages.leftRoom);
    await rooms.roomsTable.checkRowNotExist(ROOM_NAME);
  });
});

test.describe("Rooms - Leave room (Room Admin invited)", () => {
  let rooms: Rooms;
  let login: Login;
  let leaveRoomDialog: LeaveRoomDialog;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    rooms = new Rooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);
    leaveRoomDialog = new LeaveRoomDialog(page);

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "CustomRoom",
    });
    const roomBody = await roomResponse.json();
    const roomId = roomBody.response.id;

    const { userData, response: raResponse } = await apiSdk.profiles.addMember(
      "owner",
      "RoomAdmin",
    );
    const raBody = await raResponse.json();
    const raId = raBody.response.id;

    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: raId, access: "Editing" }],
      notify: false,
    });

    await login.loginWithCredentials(userData.email, userData.password);
    await rooms.openWithoutEmptyCheck();
    await rooms.roomsTable.checkRowExist(ROOM_NAME);
  });

  test("Room Admin can leave a room they were invited to", async () => {
    await rooms.roomsTable.openContextMenu(ROOM_NAME);
    await rooms.roomsTable.clickContextMenuOption(
      roomGroupContextMenuOption.leaveRoom,
    );
    await leaveRoomDialog.checkDialogExist();
    await leaveRoomDialog.submit();
    await rooms.toast.checkToastMessage(roomToastMessages.leftRoom);
    await rooms.roomsTable.checkRowNotExist(ROOM_NAME);
  });
});

test.describe("Rooms - Leave room (DocSpace Admin)", () => {
  let rooms: Rooms;
  let login: Login;
  let leaveRoomDialog: LeaveRoomDialog;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    rooms = new Rooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);
    leaveRoomDialog = new LeaveRoomDialog(page);

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "CustomRoom",
    });
    const roomBody = await roomResponse.json();
    const roomId = roomBody.response.id;

    const { userData, response: dsaResponse } =
      await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    const dsaBody = await dsaResponse.json();
    const dsaId = dsaBody.response.id;

    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: dsaId, access: "Editing" }],
      notify: false,
    });

    await login.loginWithCredentials(userData.email, userData.password);
    await rooms.openWithoutEmptyCheck();
    await rooms.roomsTable.checkRowExist(ROOM_NAME);
  });

  test("DocSpace Admin can leave a room and still sees it in the list", async () => {
    await rooms.roomsTable.openContextMenu(ROOM_NAME);
    await rooms.roomsTable.clickContextMenuOption(
      roomGroupContextMenuOption.leaveRoom,
    );
    await leaveRoomDialog.checkDialogExist();
    await leaveRoomDialog.submit();
    await rooms.toast.checkToastMessage(roomToastMessages.leftRoom);
    await rooms.roomsTable.checkRowExist(ROOM_NAME);
  });
});

test.describe("Rooms - Leave room with owner reassignment", () => {
  let rooms: Rooms;
  let login: Login;
  let leaveRoomDialog: LeaveRoomDialog;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    rooms = new Rooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);
    leaveRoomDialog = new LeaveRoomDialog(page);

    // Room Admin creates their own room (they become its owner)
    const { userData: roomAdminData } = await apiSdk.profiles.addMember(
      "owner",
      "RoomAdmin",
    );
    await api.auth.authenticateRoomAdmin();

    await apiSdk.rooms.createRoom("roomAdmin", {
      title: ROOM_NAME,
      roomType: "CustomRoom",
    });

    await login.loginWithCredentials(
      roomAdminData.email,
      roomAdminData.password,
    );
    await rooms.openWithoutEmptyCheck();
    await rooms.roomsTable.checkRowExist(ROOM_NAME);
  });

  test("Room creator sees confirmation dialog then owner selector when leaving", async () => {
    await rooms.roomsTable.openContextMenu(ROOM_NAME);
    await rooms.roomsTable.clickContextMenuOption(
      roomGroupContextMenuOption.leaveRoom,
    );
    await leaveRoomDialog.checkDialogExist();
    await leaveRoomDialog.submit();
    await leaveRoomDialog.checkOwnerSelectorExist();
  });

  test("Room creator can cancel from owner selector panel", async () => {
    await rooms.roomsTable.openContextMenu(ROOM_NAME);
    await rooms.roomsTable.clickContextMenuOption(
      roomGroupContextMenuOption.leaveRoom,
    );
    await leaveRoomDialog.checkDialogExist();
    await leaveRoomDialog.submit();
    await leaveRoomDialog.checkOwnerSelectorExist();
    await leaveRoomDialog.cancelOwnerSelection();
    await rooms.roomsTable.checkRowExist(ROOM_NAME);
  });
});

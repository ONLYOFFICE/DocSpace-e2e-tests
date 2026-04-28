import { test } from "@/src/fixtures";
import Rooms from "@/src/objects/rooms/Rooms";
import Login from "@/src/objects/common/Login";
import LeaveRoomDialog from "@/src/objects/rooms/LeaveRoomDialog";
import {
  roomGroupContextMenuOption,
  roomToastMessages,
} from "@/src/utils/constants/rooms";

const ROOM_NAME = "ChangeRoomOwnerTest";

test.describe("Rooms - Change room owner", () => {
  let rooms: Rooms;
  let login: Login;
  let leaveRoomDialog: LeaveRoomDialog;
  let dsaFirstName: string;
  let ownerFirstName: string;

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

    const { userData: dsaData, response: dsaResponse } =
      await apiSdk.profiles.addMember("owner", "DocSpaceAdmin");
    const dsaBody = await dsaResponse.json();
    dsaFirstName = dsaData.firstName;

    const ownerSelfResponse =
      await apiSdk.profiles.returnHimselfInformation("owner");
    const ownerSelfBody = await ownerSelfResponse.json();
    ownerFirstName = ownerSelfBody.response.firstName;

    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: dsaBody.response.id, access: "RoomAdmin" }],
      notify: false,
    });

    await login.loginToPortal();
    await rooms.openWithoutEmptyCheck();
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
      await leaveRoomDialog.searchForUser(dsaFirstName);
      await leaveRoomDialog.selectUserByIndex(0);
      await leaveRoomDialog.submitOwnerSelection();
      await rooms.toast.checkToastMessage(roomToastMessages.leftRoom);
    });

    await test.step("Verify DSA is listed as room owner in info panel", async () => {
      await rooms.infoPanel.open();
      await rooms.roomsTable.selectRow(ROOM_NAME);
      await rooms.infoPanel.openTab("Details");
      await rooms.infoPanel.checkDetailsOwner(dsaFirstName);
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
      await leaveRoomDialog.searchForUser(dsaFirstName);
      await leaveRoomDialog.selectUserByIndex(0);
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
});

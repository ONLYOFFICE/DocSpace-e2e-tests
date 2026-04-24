import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import Login from "@/src/objects/common/Login";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import { roomContextMenuOption } from "@/src/utils/constants/rooms";

// Room created by owner - User is invited to it
const INVITED_ROOM = "OwnerRoom";

test.describe("Rooms - User access", () => {
  let myRooms: MyRooms;
  let login: Login;
  let roomInfoPanel: RoomInfoPanel;
  let invitedRoomId: number;
  let userId: string;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);
    roomInfoPanel = new RoomInfoPanel(page);

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: INVITED_ROOM,
      roomType: "CustomRoom",
    });
    const roomBody = await roomResponse.json();
    invitedRoomId = roomBody.response.id;

    const { userData, response: userResponse } = await apiSdk.profiles.addMember("owner", "User");
    const userBody = await userResponse.json();
    userId = userBody.response.id;

    await apiSdk.rooms.setRoomAccessRights("owner", invitedRoomId, {
      invitations: [{ id: userId, access: "Editing" }],
      notify: false,
    });

    await login.loginWithCredentials(userData.email, userData.password);
    await myRooms.openWithoutEmptyCheck();
  });

  test("User does NOT have create room button", async ({ page }) => {
    await expect(page.locator("#header_add-button")).not.toBeVisible();
  });

  test("User sees invited room", async () => {
    await myRooms.roomsTable.checkRowExist(INVITED_ROOM);
  });

  test("User has Pin to top option for invited room", async () => {
    await myRooms.roomsTable.openContextMenu(INVITED_ROOM);
    await expect(
      myRooms.roomsTable.contextMenu.getItemLocator(roomContextMenuOption.pinToTop),
    ).toBeVisible();
    await myRooms.roomsTable.contextMenu.close();
  });

  test("User does NOT have Edit room option for invited room", async () => {
    await myRooms.roomsTable.openContextMenu(INVITED_ROOM);
    // Anchor: confirm menu is open
    await expect(
      myRooms.roomsTable.contextMenu.getItemLocator(roomContextMenuOption.pinToTop),
    ).toBeVisible();
    await expect(
      myRooms.roomsTable.contextMenu.getItemLocator(roomContextMenuOption.editRoom),
    ).not.toBeVisible();
    await myRooms.roomsTable.contextMenu.close();
  });

  test("User does NOT have Move to archive option for invited room", async () => {
    await myRooms.roomsTable.openContextMenu(INVITED_ROOM);
    // Anchor: confirm menu is open
    await expect(
      myRooms.roomsTable.contextMenu.getItemLocator(roomContextMenuOption.pinToTop),
    ).toBeVisible();
    await expect(
      myRooms.roomsTable.contextMenu.getItemLocator(roomContextMenuOption.moveToArchive),
    ).not.toBeVisible();
    await myRooms.roomsTable.contextMenu.close();
  });

  test.describe("Inside invited room", () => {
    test.beforeEach(async () => {
      await myRooms.roomsTable.openRoomByName(INVITED_ROOM);
    });

    test("User can view Contacts tab in invited room", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await myRooms.infoPanel.checkAccessesExist();
    });

    test("User can view History tab in invited room", async ({ page }) => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("History");
      await expect(page.getByTestId("info_history_tab")).toBeVisible();
      await expect(page.getByText("Today")).toBeVisible();
    });

    test("User can view Details tab in invited room", async ({ page }) => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Details");
      await expect(page.getByTestId("info_details_tab")).toBeVisible();
    });

    test("User cannot manage members in invited room", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await expect(roomInfoPanel.memberContextMenuButtons).toHaveCount(0);
    });
  });
});

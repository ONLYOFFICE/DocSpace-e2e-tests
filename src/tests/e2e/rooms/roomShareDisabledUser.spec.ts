import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Contacts from "@/src/objects/contacts/Contacts";
import MyRooms from "@/src/objects/rooms/Rooms";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import { roomCreateTitles } from "@/src/utils/constants/rooms";

const ROOM_NAME = roomCreateTitles.collaboration;

test.describe("Rooms - Share panel: disabled user", () => {
  let myRooms: MyRooms;
  let contacts: Contacts;
  let userEmail: string;
  let userDisplayName: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    contacts = new Contacts(page, api.portalDomain);

    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    userEmail = userData.email;
    userDisplayName = `${userData.firstName} ${userData.lastName}`;

    await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "EditingRoom",
    });

    await login.loginToPortal();

    await contacts.open();
    await contacts.table.selectRow(userDisplayName);
    await contacts.disableUser();
  });

  test("Disabled user is not shown in the room share panel", async ({
    page,
  }) => {
    const roomInfoPanel = new RoomInfoPanel(page);
    const roomsInviteDialog = new RoomsInviteDialog(page);

    await test.step("Navigate inside the room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    });

    await test.step("Open info panel and navigate to Contacts tab", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
    });

    await test.step("Open invite dialog and switch to member list", async () => {
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
    });

    await test.step("Verify disabled user is not in the list", async () => {
      await roomsInviteDialog.contactsPanel.checkUserNotVisible(userEmail);
    });
  });

  test("Re-enabled user is shown in the room share panel", async ({ page }) => {
    const roomInfoPanel = new RoomInfoPanel(page);
    const roomsInviteDialog = new RoomsInviteDialog(page);

    await test.step("Re-enable the user in Contacts", async () => {
      await contacts.table.selectRow(userDisplayName);
      await contacts.enableUser();
    });

    await test.step("Navigate inside the room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    });

    await test.step("Open info panel and navigate to Contacts tab", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
    });

    await test.step("Open invite dialog and switch to member list", async () => {
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
    });

    await test.step("Verify re-enabled user is visible in the list", async () => {
      await roomsInviteDialog.contactsPanel.checkUserVisible(userEmail);
    });
  });
});

test.describe("Rooms - Share panel: disabled user already in room", () => {
  let myRooms: MyRooms;
  let contacts: Contacts;
  let userEmail: string;
  let userDisplayName: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    contacts = new Contacts(page, api.portalDomain);

    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    userEmail = userData.email;
    userDisplayName = `${userData.firstName} ${userData.lastName}`;

    await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "EditingRoom",
    });

    await login.loginToPortal();

    const roomInfoPanel = new RoomInfoPanel(page);
    const roomsInviteDialog = new RoomsInviteDialog(page);

    await myRooms.openWithoutEmptyCheck();
    await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    await myRooms.infoPanel.open();
    await myRooms.infoPanel.openTab("Contacts");
    await roomInfoPanel.clickAddUser();
    await roomsInviteDialog.fillSearchInviteInput(userEmail);
    await roomsInviteDialog.clickAddUserToInviteList(userEmail);
    await roomsInviteDialog.submitInviteDialog();
    await expect(roomInfoPanel.getMemberByEmail(userEmail)).toBeVisible();

    await contacts.open();
    await contacts.table.selectRow(userDisplayName);
    await contacts.disableUser();
  });

  test("Disabled room member is not shown in room members list", async ({
    page,
  }) => {
    const roomInfoPanel = new RoomInfoPanel(page);

    await test.step("Navigate inside the room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    });

    await test.step("Open info panel and navigate to Contacts tab", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
    });

    await test.step("Verify disabled member is not in the room members list", async () => {
      await expect(roomInfoPanel.getMemberByEmail(userEmail)).not.toBeVisible();
    });
  });

  test("Re-enabled room member is shown in room members list again", async ({
    page,
  }) => {
    const roomInfoPanel = new RoomInfoPanel(page);

    await test.step("Re-enable the user in Contacts", async () => {
      await contacts.table.selectRow(userDisplayName);
      await contacts.enableUser();
    });

    await test.step("Navigate inside the room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    });

    await test.step("Open info panel and navigate to Contacts tab", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
    });

    await test.step("Verify re-enabled member is visible in the room members list", async () => {
      await expect(roomInfoPanel.getMemberByEmail(userEmail)).toBeVisible();
    });
  });
});

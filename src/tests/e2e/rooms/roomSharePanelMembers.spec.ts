import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Contacts from "@/src/objects/contacts/Contacts";
import Login from "@/src/objects/common/Login";
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

test.describe("Rooms - Share panel: add guest via Guests tab", () => {
  let myRooms: MyRooms;
  let guestEmail: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);

    const { userData } = await apiSdk.profiles.addMember("owner", "Guest");
    guestEmail = userData.email;

    await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "EditingRoom",
    });

    await login.loginToPortal();
  });

  test("Add guest to room via Guests tab", async ({ page }) => {
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

    await test.step("Open invite dialog and switch to Guests tab", async () => {
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.switchToGuestsTab();
    });

    await test.step("Select guest and submit", async () => {
      await roomsInviteDialog.contactsPanel.searchContact(guestEmail);
      await roomsInviteDialog.contactsPanel.selectUserByEmail(guestEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.submitInviteDialog();
    });

    await test.step("Verify guest is added to room members", async () => {
      await expect(roomInfoPanel.getMemberByEmail(guestEmail)).toBeVisible();
    });
  });
});

test.describe("Rooms - Share panel: add group via Groups tab", () => {
  const GROUP_NAME = "Test Group";

  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    const contacts = new Contacts(page, api.portalDomain);

    const { userData } = await apiSdk.profiles.addMember("owner", "User");

    await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "EditingRoom",
    });

    await login.loginToPortal();

    await contacts.open();
    await contacts.createGroupWithMembers(GROUP_NAME, [userData.email]);
  });

  test("Add group to room via Groups tab", async ({ page }) => {
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

    await test.step("Open invite dialog and switch to Groups tab", async () => {
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.switchToGroupsTab();
    });

    await test.step("Select group and submit", async () => {
      await roomsInviteDialog.contactsPanel.searchContact(GROUP_NAME);
      await roomsInviteDialog.contactsPanel.selectGroupByName(GROUP_NAME);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.submitInviteDialog();
    });

    await test.step("Verify group is added to room members", async () => {
      await expect(roomInfoPanel.getMemberByName(GROUP_NAME)).toBeVisible();
    });
  });
});

test.describe("Rooms - Share panel: Everyone group grants access", () => {
  let myRooms: MyRooms;
  let loginHelper: Login;
  let userEmail: string;
  let userPassword: string;
  let guestEmail: string;
  let guestPassword: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    loginHelper = login;

    const { userData: user } = await apiSdk.profiles.addMember("owner", "User");
    userEmail = user.email;
    userPassword = user.password;

    const { userData: guest } = await apiSdk.profiles.addMember(
      "owner",
      "Guest",
    );
    guestEmail = guest.email;
    guestPassword = guest.password;

    await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "EditingRoom",
    });

    await login.loginToPortal();
  });

  test("Sharing room with Everyone group grants access to user and guest", async ({
    page,
  }) => {
    const roomInfoPanel = new RoomInfoPanel(page);
    const roomsInviteDialog = new RoomsInviteDialog(page);

    await test.step("Share room with Everyone group", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.switchToGroupsTab();
      await roomsInviteDialog.contactsPanel.searchContact("Everyone");
      await roomsInviteDialog.contactsPanel.selectGroupByName("Everyone");
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.submitInviteDialog();
    });

    await test.step("Verify user can see the room", async () => {
      await loginHelper.logout();
      await loginHelper.loginWithCredentials(userEmail, userPassword);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowExist(ROOM_NAME);
    });

    await test.step("Verify guest can see the room", async () => {
      await loginHelper.logout();
      await loginHelper.loginWithCredentials(guestEmail, guestPassword);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowExist(ROOM_NAME);
    });
  });
});

test.describe("Rooms - Share panel: group members get room access", () => {
  const SHARED_GROUP_NAME = "Shared Group";
  const OTHER_GROUP_NAME = "Other Group";

  let myRooms: MyRooms;
  let loginHelper: Login;
  let sharedGroupMemberEmail: string;
  let sharedGroupMemberPassword: string;
  let otherGroupMemberEmail: string;
  let otherGroupMemberPassword: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    const contacts = new Contacts(page, api.portalDomain);
    loginHelper = login;

    const { userData: sharedMemberData } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    sharedGroupMemberEmail = sharedMemberData.email;
    sharedGroupMemberPassword = sharedMemberData.password;

    const { userData: otherMemberData } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    otherGroupMemberEmail = otherMemberData.email;
    otherGroupMemberPassword = otherMemberData.password;

    await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "EditingRoom",
    });

    await login.loginToPortal();

    await contacts.open();
    await contacts.createGroupWithMembers(SHARED_GROUP_NAME, [
      sharedGroupMemberEmail,
    ]);
    await contacts.createGroupWithMembers(OTHER_GROUP_NAME, [
      otherGroupMemberEmail,
    ]);
  });

  test("Member of shared group gets access, member of other group does not", async ({
    page,
  }) => {
    const roomInfoPanel = new RoomInfoPanel(page);
    const roomsInviteDialog = new RoomsInviteDialog(page);

    await test.step("Share room with shared group via Groups tab", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.switchToGroupsTab();
      await roomsInviteDialog.contactsPanel.searchContact(SHARED_GROUP_NAME);
      await roomsInviteDialog.contactsPanel.selectGroupByName(SHARED_GROUP_NAME);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.submitInviteDialog();
    });

    await test.step("Verify shared group member can see the room", async () => {
      await loginHelper.logout();
      await loginHelper.loginWithCredentials(
        sharedGroupMemberEmail,
        sharedGroupMemberPassword,
      );
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowExist(ROOM_NAME);
    });

    await test.step("Verify other group member cannot see the room", async () => {
      await loginHelper.logout();
      await loginHelper.loginWithCredentials(
        otherGroupMemberEmail,
        otherGroupMemberPassword,
      );
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowNotExist(ROOM_NAME);
    });
  });
});

test.describe("Rooms - Share panel: group membership changes affect access", () => {
  const GROUP_NAME = "Access Group";

  let myRooms: MyRooms;
  let loginHelper: Login;
  let portalDomain: string;
  let memberEmail: string;
  let memberPassword: string;
  let secondMemberEmail: string;
  let secondMemberPassword: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    portalDomain = api.portalDomain;
    myRooms = new MyRooms(page, portalDomain);
    loginHelper = login;
    const contacts = new Contacts(page, portalDomain);

    const { userData: user1 } = await apiSdk.profiles.addMember("owner", "User");
    memberEmail = user1.email;
    memberPassword = user1.password;

    const { userData: user2 } = await apiSdk.profiles.addMember("owner", "User");
    secondMemberEmail = user2.email;
    secondMemberPassword = user2.password;

    await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "EditingRoom",
    });

    await login.loginToPortal();

    await contacts.open();
    await contacts.createGroupWithMembers(GROUP_NAME, [
      memberEmail,
      secondMemberEmail,
    ]);

    const roomInfoPanel = new RoomInfoPanel(page);
    const roomsInviteDialog = new RoomsInviteDialog(page);
    await myRooms.openWithoutEmptyCheck();
    await myRooms.roomsTable.openRoomByName(ROOM_NAME);
    await myRooms.infoPanel.open();
    await myRooms.infoPanel.openTab("Contacts");
    await roomInfoPanel.clickAddUser();
    await roomsInviteDialog.openPeopleList();
    await roomsInviteDialog.contactsPanel.switchToGroupsTab();
    await roomsInviteDialog.contactsPanel.searchContact(GROUP_NAME);
    await roomsInviteDialog.contactsPanel.selectGroupByName(GROUP_NAME);
    await roomsInviteDialog.contactsPanel.clickSelectButton();
    await roomsInviteDialog.submitInviteDialog();
    await expect(roomInfoPanel.getMemberByName(GROUP_NAME)).toBeVisible();
  });

  test("Removing group from room revokes member access", async ({ page }) => {
    const roomInfoPanel = new RoomInfoPanel(page);

    await test.step("Remove group from room members list", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.removeMemberByName(GROUP_NAME);
    });

    await test.step("Verify group member can no longer see the room", async () => {
      await loginHelper.logout();
      await loginHelper.loginWithCredentials(memberEmail, memberPassword);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowNotExist(ROOM_NAME);
    });
  });

  test("Removing user from group revokes their access, remaining member keeps access", async ({
    page,
  }) => {
    const contacts = new Contacts(page, portalDomain);

    await test.step("Remove first user from the group", async () => {
      await contacts.open();
      await contacts.removeUserFromGroup(GROUP_NAME, memberEmail);
    });

    await test.step("Verify removed user can no longer see the room", async () => {
      await loginHelper.logout();
      await loginHelper.loginWithCredentials(memberEmail, memberPassword);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowNotExist(ROOM_NAME);
    });

    await test.step("Verify remaining group member still has access", async () => {
      await loginHelper.logout();
      await loginHelper.loginWithCredentials(secondMemberEmail, secondMemberPassword);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowExist(ROOM_NAME);
    });
  });

  test("Deleting group revokes member access to the room", async ({ page }) => {
    const contacts = new Contacts(page, portalDomain);

    await test.step("Delete the group in Contacts", async () => {
      await contacts.open();
      await contacts.deleteGroupByName(GROUP_NAME);
    });

    await test.step("Verify group member can no longer see the room", async () => {
      await loginHelper.logout();
      await loginHelper.loginWithCredentials(memberEmail, memberPassword);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.checkRowNotExist(ROOM_NAME);
    });
  });
});

import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Contacts from "@/src/objects/contacts/Contacts";
import Login from "@/src/objects/common/Login";
import MyRooms from "@/src/objects/rooms/Rooms";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import FilesTable from "@/src/objects/files/FilesTable";
import { roomCreateTitles } from "@/src/utils/constants/rooms";
import { documentContextMenuOption } from "@/src/utils/constants/files";

const ROOM_NAME = roomCreateTitles.collaboration;
const DOC_NAME = "PermissionTestDoc";

async function verifyCanEdit(filesTable: FilesTable, fileName: string) {
  await filesTable.openContextMenuForItem(fileName);
  await expect(
    filesTable.contextMenu.getItemLocator(documentContextMenuOption.edit),
  ).toBeVisible();
  await filesTable.contextMenu.close();
}

async function verifyCannotEdit(filesTable: FilesTable, fileName: string) {
  await filesTable.openContextMenuForItem(fileName);
  await expect(
    filesTable.contextMenu.getItemLocator(documentContextMenuOption.edit),
  ).not.toBeVisible();
  await filesTable.contextMenu.close();
}

test.describe("Rooms - Share panel: personal role overrides group role", () => {
  const GROUP_NAME = "Role Priority Group";

  let myRooms: MyRooms;
  let loginHelper: Login;
  let userEmail: string;
  let userPassword: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    loginHelper = login;
    const contacts = new Contacts(page, api.portalDomain);

    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    userEmail = userData.email;
    userPassword = userData.password;

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "EditingRoom",
    });
    const roomBody = await roomResponse.json();
    const roomId = roomBody.response.id;

    await apiSdk.files.createFile("owner", roomId, { title: DOC_NAME });

    await login.loginToPortal();

    await contacts.open();
    await contacts.createGroupWithMembers(GROUP_NAME, [userEmail]);
  });

  test("Personal Editor role overrides group Viewer role", async ({ page }) => {
    const roomInfoPanel = new RoomInfoPanel(page);
    const roomsInviteDialog = new RoomsInviteDialog(page);

    await test.step("Add group with Viewer role", async () => {
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
      await roomsInviteDialog.selectRole("viewer");
      await roomsInviteDialog.submitInviteDialog();
    });

    await test.step("Add user directly with Editor role", async () => {
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.fillSearchInviteInput(userEmail);
      await roomsInviteDialog.clickAddUserToInviteList(userEmail);
      await roomsInviteDialog.selectRole("editor");
      await roomsInviteDialog.submitInviteDialog();
    });

    await test.step("Verify user has Editor permissions (can edit files)", async () => {
      await loginHelper.logout();
      await loginHelper.loginWithCredentials(userEmail, userPassword);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await verifyCanEdit(myRooms.filesTable, DOC_NAME);
    });
  });

  test("Personal Viewer role overrides group Editor role", async ({ page }) => {
    const roomInfoPanel = new RoomInfoPanel(page);
    const roomsInviteDialog = new RoomsInviteDialog(page);

    await test.step("Add group with Editor role", async () => {
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
      await roomsInviteDialog.selectRole("editor");
      await roomsInviteDialog.submitInviteDialog();
    });

    await test.step("Add user directly with Viewer role", async () => {
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.fillSearchInviteInput(userEmail);
      await roomsInviteDialog.clickAddUserToInviteList(userEmail);
      await roomsInviteDialog.selectRole("viewer");
      await roomsInviteDialog.submitInviteDialog();
    });

    await test.step("Verify user has Viewer permissions (cannot edit files)", async () => {
      await loginHelper.logout();
      await loginHelper.loginWithCredentials(userEmail, userPassword);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await verifyCannotEdit(myRooms.filesTable, DOC_NAME);
    });
  });
});

test.describe("Rooms - Share panel: user in two groups with different roles", () => {
  const GROUP_EDITOR = "Editor Group";
  const GROUP_VIEWER = "Viewer Group";

  let myRooms: MyRooms;
  let loginHelper: Login;
  let userEmail: string;
  let userPassword: string;

  test.beforeEach(async ({ page, api, login, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    loginHelper = login;
    const contacts = new Contacts(page, api.portalDomain);

    const { userData } = await apiSdk.profiles.addMember("owner", "User");
    userEmail = userData.email;
    userPassword = userData.password;

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: ROOM_NAME,
      roomType: "EditingRoom",
    });
    const roomBody = await roomResponse.json();
    const roomId = roomBody.response.id;

    await apiSdk.files.createFile("owner", roomId, { title: DOC_NAME });

    await login.loginToPortal();

    await contacts.open();
    await contacts.createGroupWithMembers(GROUP_EDITOR, [userEmail]);
    await contacts.createGroupWithMembers(GROUP_VIEWER, [userEmail]);
  });

  test("Higher role applies when user is in two groups with different roles", async ({
    page,
  }) => {
    const roomInfoPanel = new RoomInfoPanel(page);
    const roomsInviteDialog = new RoomsInviteDialog(page);

    await test.step("Add Viewer group to room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.switchToGroupsTab();
      await roomsInviteDialog.contactsPanel.searchContact(GROUP_VIEWER);
      await roomsInviteDialog.contactsPanel.selectGroupByName(GROUP_VIEWER);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.selectRole("viewer");
      await roomsInviteDialog.submitInviteDialog();
    });

    await test.step("Add Editor group to room", async () => {
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.switchToGroupsTab();
      await roomsInviteDialog.contactsPanel.searchContact(GROUP_EDITOR);
      await roomsInviteDialog.contactsPanel.selectGroupByName(GROUP_EDITOR);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.selectRole("editor");
      await roomsInviteDialog.submitInviteDialog();
    });

    await test.step("Verify user gets the higher role (Editor)", async () => {
      await loginHelper.logout();
      await loginHelper.loginWithCredentials(userEmail, userPassword);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(ROOM_NAME);
      await verifyCanEdit(myRooms.filesTable, DOC_NAME);
    });
  });
});

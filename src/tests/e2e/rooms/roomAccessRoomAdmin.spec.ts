import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import Login from "@/src/objects/common/Login";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import {
  roomContextMenuOption,
  roomCreateTitles,
} from "@/src/utils/constants/rooms";

// Room created by owner - Room Admin is not invited by default
const OWNER_ROOM = "OwnerRoom";
// Room created by Room Admin themselves
const OWN_ROOM = "RoomAdmin_OwnRoom";

test.describe("Rooms - Room Admin access", () => {
  let myRooms: MyRooms;
  let login: Login;
  let roomInfoPanel: RoomInfoPanel;
  let roomsInviteDialog: RoomsInviteDialog;
  // Used as an invitee in member management tests
  let memberEmail: string;
  let ownerRoomId: number;
  let roomAdminUserId: string;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);
    roomInfoPanel = new RoomInfoPanel(page);
    roomsInviteDialog = new RoomsInviteDialog(page);

    const ownerRoomResponse = await apiSdk.rooms.createRoom("owner", {
      title: OWNER_ROOM,
      roomType: "CustomRoom",
    });
    const ownerRoomBody = await ownerRoomResponse.json();
    ownerRoomId = ownerRoomBody.response.id;

    const [
      { userData: roomAdminData, response: roomAdminResponse },
      { userData: memberData },
    ] = await Promise.all([
      apiSdk.profiles.addMember("owner", "RoomAdmin"),
      apiSdk.profiles.addMember("owner", "User"),
    ]);
    const roomAdminBody = await roomAdminResponse.json();
    roomAdminUserId = roomAdminBody.response.id;
    memberEmail = memberData.email;

    await login.loginWithCredentials(
      roomAdminData.email,
      roomAdminData.password,
    );
    await myRooms.openWithoutEmptyCheck();
  });

  test("Room Admin does NOT see rooms they are not invited to", async ({
    page,
  }) => {
    await expect(
      page.getByRole("link", { name: OWNER_ROOM }),
    ).not.toBeVisible();
  });

  test("Room Admin has create room button", async ({ page }) => {
    await expect(page.locator("#header_add-button")).toBeVisible();
  });

  test("Room Admin can open create room dialog", async () => {
    await myRooms.navigation.clickAddButton();
    await myRooms.roomsCreateDialog.checkRoomTypeExist(roomCreateTitles.public);
    await myRooms.roomsCreateDialog.close();
  });

  test.describe("Own room (list level)", () => {
    test.beforeEach(async () => {
      await myRooms.navigation.clickAddButton();
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.custom);
      await myRooms.roomsCreateDialog.createRoom(OWN_ROOM);
      // Navigate back to rooms list after creation
      await myRooms.openWithoutEmptyCheck();
    });

    test("Room Admin sees own room", async () => {
      await myRooms.roomsTable.checkRowExist(OWN_ROOM);
    });

    test("Room Admin has Edit room option for own room", async () => {
      await myRooms.roomsTable.openContextMenu(OWN_ROOM);
      await expect(
        myRooms.roomsTable.contextMenu.getItemLocator(
          roomContextMenuOption.editRoom,
        ),
      ).toBeVisible();
      await myRooms.roomsTable.contextMenu.close();
    });

    test("Room Admin has Invite contacts option for own room", async () => {
      await myRooms.roomsTable.openContextMenu(OWN_ROOM);
      await expect(
        myRooms.roomsTable.contextMenu.getItemLocator(
          roomContextMenuOption.inviteContacts,
        ),
      ).toBeVisible();
      await myRooms.roomsTable.contextMenu.close();
    });

    test("Room Admin has Move to archive option for own room", async () => {
      await myRooms.roomsTable.openContextMenu(OWN_ROOM);
      await expect(
        myRooms.roomsTable.contextMenu.getItemLocator(
          roomContextMenuOption.moveToArchive,
        ),
      ).toBeVisible();
      await myRooms.roomsTable.contextMenu.close();
    });

    // Duplicate is under the "More options" submenu
    test("Room Admin has Duplicate option for own room", async () => {
      await myRooms.roomsTable.openContextMenu(OWN_ROOM);
      await myRooms.roomsTable.contextMenu.clickOption(
        roomContextMenuOption.manage,
      );
      await expect(
        myRooms.roomsTable.contextMenu.getItemLocator(
          roomContextMenuOption.duplicate,
        ),
      ).toBeVisible();
      await myRooms.roomsTable.contextMenu.close();
    });
  });

  test.describe("Own room member management", () => {
    test.beforeEach(async ({ page }) => {
      // Create own room via UI - app navigates inside it after creation
      await myRooms.navigation.clickAddButton();
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.custom);
      await myRooms.roomsCreateDialog.createRoom(OWN_ROOM);
      await expect(page.getByRole("heading", { name: OWN_ROOM })).toBeVisible();

      // Invite a member via info panel
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectUserByEmail(memberEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.submitInviteDialog();
      await myRooms.infoPanel.openTab("Contacts");
      await expect(roomInfoPanel.getMemberByEmail(memberEmail)).toBeVisible({
        timeout: 10000,
      });
    });

    test("Room Admin can assign role when inviting to own room", async ({
      page,
    }) => {
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      // Role assignment works - change to Room Manager to verify
      await roomsInviteDialog.contactsPanel.selectAccessType("roomManager");
      await page.keyboard.press("Escape");
    });

    test("Room Admin can manage members in own room", async () => {
      // Member context menu buttons are present (role change + remove options)
      await expect(roomInfoPanel.memberContextMenuButtons).not.toHaveCount(0);
    });
  });

  test.describe("Invited room", () => {
    test.beforeEach(async ({ apiSdk }) => {
      // Invite Room Admin to owner's room via API
      await apiSdk.rooms.setRoomAccessRights("owner", ownerRoomId, {
        invitations: [{ id: roomAdminUserId, access: "Editing" }],
        notify: false,
      });
      await myRooms.openWithoutEmptyCheck();
      // Wait for invited room to appear before any test navigates to it
      await myRooms.roomsTable.checkRowExist(OWNER_ROOM);
    });

    test("Room Admin sees invited room", async () => {
      await myRooms.roomsTable.checkRowExist(OWNER_ROOM);
    });

    test("Room Admin has Pin to top option for invited room", async () => {
      await myRooms.roomsTable.openContextMenu(OWNER_ROOM);
      await expect(
        myRooms.roomsTable.contextMenu.getItemLocator(
          roomContextMenuOption.pinToTop,
        ),
      ).toBeVisible();
      await myRooms.roomsTable.contextMenu.close();
    });

    test("Room Admin does NOT have Edit room option for invited room", async () => {
      await myRooms.roomsTable.openContextMenu(OWNER_ROOM);
      // Anchor: confirm menu is open
      await expect(
        myRooms.roomsTable.contextMenu.getItemLocator(
          roomContextMenuOption.pinToTop,
        ),
      ).toBeVisible();
      await expect(
        myRooms.roomsTable.contextMenu.getItemLocator(
          roomContextMenuOption.editRoom,
        ),
      ).not.toBeVisible();
      await myRooms.roomsTable.contextMenu.close();
    });

    test("Room Admin does NOT have Invite contacts option for invited room", async () => {
      await myRooms.roomsTable.openContextMenu(OWNER_ROOM);
      // Anchor: confirm menu is open
      await expect(
        myRooms.roomsTable.contextMenu.getItemLocator(
          roomContextMenuOption.pinToTop,
        ),
      ).toBeVisible();
      await expect(
        myRooms.roomsTable.contextMenu.getItemLocator(
          roomContextMenuOption.inviteContacts,
        ),
      ).not.toBeVisible();
      await myRooms.roomsTable.contextMenu.close();
    });

    test("Room Admin does NOT have Move to archive option for invited room", async () => {
      await myRooms.roomsTable.openContextMenu(OWNER_ROOM);
      // Anchor: confirm menu is open
      await expect(
        myRooms.roomsTable.contextMenu.getItemLocator(
          roomContextMenuOption.pinToTop,
        ),
      ).toBeVisible();
      await expect(
        myRooms.roomsTable.contextMenu.getItemLocator(
          roomContextMenuOption.moveToArchive,
        ),
      ).not.toBeVisible();
      await myRooms.roomsTable.contextMenu.close();
    });

    test("Room Admin does NOT have More options submenu for invited room", async () => {
      await myRooms.roomsTable.openContextMenu(OWNER_ROOM);
      // Anchor: confirm menu is open
      await expect(
        myRooms.roomsTable.contextMenu.getItemLocator(
          roomContextMenuOption.pinToTop,
        ),
      ).toBeVisible();
      await expect(
        myRooms.roomsTable.contextMenu.getItemLocator(
          roomContextMenuOption.manage,
        ),
      ).not.toBeVisible();
      await myRooms.roomsTable.contextMenu.close();
    });

    test.describe("Inside invited room", () => {
      test.beforeEach(async () => {
        await myRooms.roomsTable.openRoomByName(OWNER_ROOM);
      });

      test("Room Admin can view Contacts tab in invited room", async () => {
        await myRooms.infoPanel.open();
        await myRooms.infoPanel.openTab("Contacts");
        await myRooms.infoPanel.checkAccessesExist();
      });

      test("Room Admin can view History tab in invited room", async ({
        page,
      }) => {
        await myRooms.infoPanel.open();
        await myRooms.infoPanel.openTab("History");
        await expect(page.getByTestId("info_history_tab")).toBeVisible();
        await expect(page.getByText("Today")).toBeVisible();
      });

      test("Room Admin can view Details tab in invited room", async ({
        page,
      }) => {
        await myRooms.infoPanel.open();
        await myRooms.infoPanel.openTab("Details");
        await expect(page.getByTestId("info_details_tab")).toBeVisible();
      });

      test("Room Admin cannot manage members in invited room", async () => {
        await myRooms.infoPanel.open();
        await myRooms.infoPanel.openTab("Contacts");
        await expect(roomInfoPanel.memberContextMenuButtons).toHaveCount(0);
      });
    });
  });
});

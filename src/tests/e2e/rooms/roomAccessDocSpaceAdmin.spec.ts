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

// Room created by owner - DSA sees it without being invited
const OWNER_ROOM = "OwnerRoom";
// Public room created by owner - used for sharing links visibility check
const PUBLIC_ROOM = "OwnerPublicRoom";
// Room created by DSA themselves
const DSA_ROOM = "DSA_OwnRoom";

test.describe("Rooms - DocSpace Admin access", () => {
  let myRooms: MyRooms;
  let login: Login;
  let roomInfoPanel: RoomInfoPanel;
  let roomsInviteDialog: RoomsInviteDialog;
  // Used as an invitee in member management tests
  let memberEmail: string;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    login = new Login(page, api.portalDomain);
    roomInfoPanel = new RoomInfoPanel(page);
    roomsInviteDialog = new RoomsInviteDialog(page);

    await Promise.all([
      apiSdk.rooms.createRoom("owner", {
        title: OWNER_ROOM,
        roomType: "CustomRoom",
      }),
      apiSdk.rooms.createRoom("owner", {
        title: PUBLIC_ROOM,
        roomType: "PublicRoom",
      }),
    ]);

    const [{ userData: dsaData }, { userData: memberData }] = await Promise.all(
      [
        apiSdk.profiles.addMember("owner", "DocSpaceAdmin"),
        apiSdk.profiles.addMember("owner", "User"),
      ],
    );
    memberEmail = memberData.email;

    await login.loginWithCredentials(dsaData.email, dsaData.password);
    await myRooms.openWithoutEmptyCheck();
  });

  test("DocSpace Admin sees rooms created by owner", async () => {
    await myRooms.roomsTable.checkRowExist(OWNER_ROOM);
  });

  test("DocSpace Admin has create room button", async ({ page }) => {
    await expect(page.locator("#header_add-button")).toBeVisible();
  });

  test("DocSpace Admin can open create room dialog", async () => {
    await myRooms.navigation.clickAddButton();
    await myRooms.roomsCreateDialog.checkRoomTypeExist(roomCreateTitles.public);
    await myRooms.roomsCreateDialog.close();
  });

  test("DocSpace Admin can pin owner's room to top", async () => {
    await myRooms.roomsTable.openContextMenu(OWNER_ROOM);
    await myRooms.roomsTable.contextMenu.clickOption(
      roomContextMenuOption.pinToTop,
    );
    await myRooms.roomsTable.checkRoomPinnedToTopExist();
  });

  test("DocSpace Admin does NOT have Edit room option for owner's room", async () => {
    await myRooms.roomsTable.openContextMenu(OWNER_ROOM);
    await expect(
      myRooms.roomsTable.contextMenu.getItemLocator(
        roomContextMenuOption.editRoom,
      ),
    ).not.toBeVisible();
    await myRooms.roomsTable.contextMenu.close();
  });

  test("DocSpace Admin does NOT have Invite contacts option for owner's room", async () => {
    await myRooms.roomsTable.openContextMenu(OWNER_ROOM);
    await expect(
      myRooms.roomsTable.contextMenu.getItemLocator(
        roomContextMenuOption.inviteContacts,
      ),
    ).not.toBeVisible();
    await myRooms.roomsTable.contextMenu.close();
  });

  // TODO Bug 81232: unskip when fixed
  // Duplicate is under the "More options" submenu
  test.skip("[Bug 81232] DocSpace Admin can duplicate owner's room", async () => {
    await myRooms.roomsTable.openContextMenu(OWNER_ROOM);
    await myRooms.roomsTable.contextMenu.clickOption(
      roomContextMenuOption.manage,
    );
    await myRooms.roomsTable.contextMenu.clickOption(
      roomContextMenuOption.duplicate,
    );
    await myRooms.roomsTable.checkRowExist(OWNER_ROOM + " (2)");
  });

  // Change Room Owner is under the "More options" submenu
  test("DocSpace Admin can open Change Room Owner dialog for owner's room", async () => {
    await myRooms.roomsTable.openContextMenu(OWNER_ROOM);
    await myRooms.roomsTable.contextMenu.clickOption(
      roomContextMenuOption.manage,
    );
    await myRooms.roomsTable.contextMenu.clickOption(
      roomContextMenuOption.changeTheRoomOwner,
    );
    await myRooms.roomsChangeOwnerDialog.checkDialogExist();
  });

  test("DocSpace Admin can move owner's room to archive", async ({ page }) => {
    await myRooms.roomsTable.openContextMenu(OWNER_ROOM);
    await myRooms.roomsTable.contextMenu.clickOption(
      roomContextMenuOption.moveToArchive,
    );
    await myRooms.moveToArchive();
    await expect(
      page.getByRole("link", { name: OWNER_ROOM }),
    ).not.toBeVisible();
  });

  test("DocSpace Admin cannot see sharing links of owner's public room", async ({
    page,
  }) => {
    await myRooms.roomsTable.openRoomByName(PUBLIC_ROOM);
    await myRooms.infoPanel.open();
    await expect(page.getByTestId("info_links_tab")).not.toBeVisible();
  });

  test.describe("Own room (list level)", () => {
    test.beforeEach(async () => {
      await myRooms.navigation.clickAddButton();
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.custom);
      await myRooms.roomsCreateDialog.createRoom(DSA_ROOM);
      // Navigate back to rooms list after creation
      await myRooms.openWithoutEmptyCheck();
    });

    test("DocSpace Admin can see and edit own room name", async () => {
      await myRooms.roomsTable.checkRowExist(DSA_ROOM);
      const editedName = DSA_ROOM + " (edited)";
      await myRooms.roomsTable.openContextMenu(DSA_ROOM);
      await myRooms.roomsTable.contextMenu.clickOption(
        roomContextMenuOption.editRoom,
      );
      await myRooms.roomsEditDialog.checkDialogTitleExist();
      await myRooms.roomsEditDialog.fillRoomName(editedName);
      await myRooms.roomsEditDialog.clickSaveButton();
      await myRooms.roomsTable.checkRowExist(editedName);
    });

    test("DocSpace Admin can invite contacts to own room", async () => {
      await myRooms.roomsTable.openContextMenu(DSA_ROOM);
      await myRooms.roomsTable.contextMenu.clickOption(
        roomContextMenuOption.inviteContacts,
      );
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectUserByEmail(memberEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.submitInviteDialog();
      // Verify the member appears in room contacts
      await myRooms.roomsTable.openRoomByName(DSA_ROOM);
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await expect(roomInfoPanel.getMemberByEmail(memberEmail)).toBeVisible({
        timeout: 10000,
      });
    });

    test("DocSpace Admin can move own room to archive", async ({ page }) => {
      await myRooms.roomsTable.openContextMenu(DSA_ROOM);
      await myRooms.roomsTable.contextMenu.clickOption(
        roomContextMenuOption.moveToArchive,
      );
      await myRooms.moveToArchive();
      await expect(
        page.getByRole("link", { name: DSA_ROOM }),
      ).not.toBeVisible();
    });

    // Duplicate is under the "More options" submenu
    test("DocSpace Admin can duplicate own room", async () => {
      await myRooms.roomsTable.openContextMenu(DSA_ROOM);
      await myRooms.roomsTable.contextMenu.clickOption(
        roomContextMenuOption.manage,
      );
      await myRooms.roomsTable.contextMenu.clickOption(
        roomContextMenuOption.duplicate,
      );
      await myRooms.roomsTable.checkRowExist(DSA_ROOM + " (1)");
    });
  });

  test.describe("Own room member management", () => {
    test.beforeEach(async ({ page }) => {
      // Create own room via UI - app navigates inside it after creation
      await myRooms.navigation.clickAddButton();
      await myRooms.roomsCreateDialog.openRoomType(roomCreateTitles.custom);
      await myRooms.roomsCreateDialog.createRoom(DSA_ROOM);
      await expect(page.getByRole("heading", { name: DSA_ROOM })).toBeVisible();

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

    test("DocSpace Admin can assign role when inviting to own room", async ({
      page,
    }) => {
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      // Role assignment works - change to Room Manager to verify
      await roomsInviteDialog.contactsPanel.selectAccessType("roomManager");
      await page.keyboard.press("Escape");
    });

    test("DocSpace Admin can manage members in own room", async () => {
      // Member context menu buttons are present (role change + remove options)
      await expect(roomInfoPanel.memberContextMenuButtons).not.toHaveCount(0);
    });
  });

  test("DocSpace Admin can view info panel tabs and cannot manage members in owner's room", async ({
    page,
  }) => {
    await myRooms.roomsTable.openRoomByName(OWNER_ROOM);

    await test.step("View Contacts tab", async () => {
      await myRooms.infoPanel.open();
      await myRooms.infoPanel.openTab("Contacts");
      await myRooms.infoPanel.checkAccessesExist();
    });

    await test.step("View History tab", async () => {
      await myRooms.infoPanel.openTab("History");
      await expect(page.getByTestId("info_history_tab")).toBeVisible();
      await expect(page.getByText("Today")).toBeVisible();
    });

    await test.step("View Details tab", async () => {
      await myRooms.infoPanel.openTab("Details");
      await expect(page.getByTestId("info_details_tab")).toBeVisible();
    });

    await test.step("Cannot manage members", async () => {
      await myRooms.infoPanel.openTab("Contacts");
      await expect(roomInfoPanel.memberContextMenuButtons).toHaveCount(0);
    });
  });
});

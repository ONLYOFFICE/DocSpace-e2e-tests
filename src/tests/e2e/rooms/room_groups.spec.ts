import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import MyRooms from "@/src/objects/rooms/Rooms";
import ProfileFileManagement from "@/src/objects/profile/ProfileFileManagement";
import {
  roomContextMenuOption,
  roomGroupContextMenuOption,
  roomToastMessages,
} from "@/src/utils/constants/rooms";

const ROOM1_NAME = "Group Test Room 1";
const ROOM2_NAME = "Group Test Room 2";
const GROUP_NAME = "My Test Group";
const GROUP_NAME_2 = "My Test Group 2";

test.describe("Rooms: Group Tags", () => {
  let myRooms: MyRooms;
  let profileFileManagement: ProfileFileManagement;

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    profileFileManagement = new ProfileFileManagement(page, api.portalDomain);

    await apiSdk.rooms.createRoom("owner", {
      title: ROOM1_NAME,
      roomType: "EditingRoom",
    });
    await apiSdk.rooms.createRoom("owner", {
      title: ROOM2_NAME,
      roomType: "EditingRoom",
    });

    await login.loginToPortal();
  });

  test("Create room group from group-tags row and verify it shows the room", async () => {
    await test.step("Create group from the group-tags row", async () => {
      await myRooms.roomsGroupTags.createGroup(GROUP_NAME, ROOM1_NAME);
    });

    await test.step("Verify group tag is visible and select it", async () => {
      await myRooms.roomsGroupTags.checkGroupTagVisible(GROUP_NAME);
      await myRooms.roomsGroupTags.selectGroupTag(GROUP_NAME);
    });

    await test.step("Check one room is shown in the group", async () => {
      await myRooms.roomsTable.checkRowExist(ROOM1_NAME);
      await expect(myRooms.roomsTable.tableRows).toHaveCount(1);
    });
  });

  test("Create second group from settings panel and verify it shows the room", async () => {
    await test.step("Create first group to open settings panel", async () => {
      await myRooms.roomsGroupTags.createGroup(GROUP_NAME, ROOM1_NAME);
    });

    await test.step("Open group settings and create second group with second room", async () => {
      await myRooms.roomsGroupTags.openGroupSettings(GROUP_NAME);
      await myRooms.roomsGroupTags.createGroupFromSettings(
        GROUP_NAME_2,
        ROOM2_NAME,
      );
    });

    await test.step("Select second group tag and verify the room is visible", async () => {
      await myRooms.roomsGroupTags.selectGroupTag(GROUP_NAME_2);
      await myRooms.roomsTable.checkRowExist(ROOM2_NAME);
    });
  });

  test("Create group via room context menu and add second room via submenu", async () => {
    await test.step("Create group via context menu on first room", async () => {
      await myRooms.roomsTable.openContextMenuByRoomName(ROOM1_NAME);
      await myRooms.roomsTable.clickContextMenuOption(
        roomGroupContextMenuOption.createGroup,
      );
      await myRooms.roomsGroupTags.fillGroupNameAndCreate(GROUP_NAME);
    });

    await test.step("Verify group tag is visible", async () => {
      await myRooms.roomsGroupTags.checkGroupTagVisible(GROUP_NAME);
    });

    await test.step("Add second room to group via context menu submenu", async () => {
      await myRooms.roomsTable.openContextMenuByRoomName(ROOM2_NAME);
      await myRooms.roomsTable.clickContextMenuSubmenuOption(
        roomGroupContextMenuOption.addToGroup,
        GROUP_NAME,
      );
    });

    await test.step("Select group and verify both rooms are visible", async () => {
      await myRooms.roomsGroupTags.selectGroupTag(GROUP_NAME);
      await myRooms.roomsTable.checkRowExist(ROOM1_NAME);
      await myRooms.roomsTable.checkRowExist(ROOM2_NAME);
    });
  });

  test("Remove room from group via context menu", async () => {
    await test.step("Create group with first room", async () => {
      await myRooms.roomsGroupTags.createGroup(GROUP_NAME, ROOM1_NAME);
    });

    await test.step("Select group and remove room via context menu", async () => {
      await myRooms.roomsGroupTags.selectGroupTag(GROUP_NAME);
      await myRooms.roomsTable.openContextMenuByRoomName(ROOM1_NAME);
      await myRooms.roomsTable.clickContextMenuOption(
        roomContextMenuOption.removeFromGroup,
      );
    });

    await test.step("Verify toast and empty group view with manage-groups button", async () => {
      await myRooms.toast.dismissToastSafely(
        roomToastMessages.removedFromGroup(GROUP_NAME),
      );
      await myRooms.roomsGroupTags.checkEmptyGroupView();
      await myRooms.roomsGroupTags.checkManageGroupsButtonVisible();
    });
  });

  // Skipped: no stable locators for edit/delete group icons (CSS module class names with hash suffixes)
  test.skip("Edit room group name and delete the group", async () => {
    const GROUP_NAME_EDITED = "My Test Group Edited";

    await test.step("Create group from the group-tags row", async () => {
      await myRooms.roomsGroupTags.createGroup(GROUP_NAME, ROOM1_NAME);
    });

    await test.step("Open group settings", async () => {
      await myRooms.roomsGroupTags.openGroupSettings(GROUP_NAME);
    });

    await test.step("Edit group name", async () => {
      await myRooms.roomsGroupTags.editGroupName(GROUP_NAME, GROUP_NAME_EDITED);
      await myRooms.roomsGroupTags.checkGroupTagVisible(GROUP_NAME_EDITED);
    });

    await test.step("Delete the group and verify it is removed from the group-tags row", async () => {
      await myRooms.roomsGroupTags.deleteGroup(GROUP_NAME_EDITED);
      await myRooms.roomsGroupTags.checkGroupTagNotVisible(GROUP_NAME_EDITED);
    });
  });

  test("Disable grouping via toggle and verify group-tags row disappears", async () => {
    await test.step("Create group from the group-tags row", async () => {
      await myRooms.roomsGroupTags.createGroup(GROUP_NAME, ROOM1_NAME);
    });

    await test.step("Navigate to profile file management and disable grouping", async () => {
      await profileFileManagement.open();
      await profileFileManagement.toggleRoomGrouping();
      await myRooms.toast.dismissToastSafely(
        roomToastMessages.roomGroupingDisabled,
      );
    });

    await test.step("Navigate back to rooms and verify group-tags row is no longer visible", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsGroupTags.checkGroupTagsRowNotVisible();
    });
  });

  test("Groups persist after disabling and re-enabling grouping", async () => {
    await test.step("Create group from the group-tags row", async () => {
      await myRooms.roomsGroupTags.createGroup(GROUP_NAME, ROOM1_NAME);
    });

    await test.step("Disable grouping and verify group-tags row disappears", async () => {
      await profileFileManagement.open();
      await profileFileManagement.toggleRoomGrouping();
      await myRooms.toast.dismissToastSafely(
        roomToastMessages.roomGroupingDisabled,
      );
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsGroupTags.checkGroupTagsRowNotVisible();
    });

    await test.step("Re-enable grouping and verify group-tags row reappears with the old group", async () => {
      await profileFileManagement.open();
      await profileFileManagement.toggleRoomGrouping();
      await myRooms.toast.dismissToastSafely(
        roomToastMessages.roomGroupingEnabled,
      );
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsGroupTags.checkGroupTagsRowVisible();
      await myRooms.roomsGroupTags.checkGroupTagVisible(GROUP_NAME);
    });
  });

  test("Regular user does not see groups created by owner", async ({
    apiSdk,
    login,
    page,
  }) => {
    await test.step("Create group as owner", async () => {
      await myRooms.roomsGroupTags.createGroup(GROUP_NAME, ROOM1_NAME);
    });

    await test.step("Create regular user and log in as them", async () => {
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      await page.context().clearCookies();
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("Verify owner's group-tags row is not visible to regular user", async () => {
      await myRooms.roomsGroupTags.checkGroupTagsRowNotVisible();
    });
  });
});

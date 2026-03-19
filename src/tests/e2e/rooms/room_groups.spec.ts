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

  test("Create group from settings panel and verify it shows the room", async () => {
    await test.step("Open group management panel and create group", async () => {
      await myRooms.roomsGroupTags.openGroupManagementPanel();
      await myRooms.roomsGroupTags.createGroupFromSettings(
        GROUP_NAME,
        ROOM1_NAME,
      );
    });

    await test.step("Select group tag and verify the room is visible", async () => {
      await myRooms.roomsGroupTags.selectGroupTag(GROUP_NAME);
      await myRooms.roomsTable.checkRowExist(ROOM1_NAME);
    });
  });

  test("Cancel group creation does not create a group", async () => {
    await test.step("Start group creation and cancel at the name dialog", async () => {
      await myRooms.roomsGroupTags.clickCreateGroup();
      await myRooms.roomsGroupTags.selectRoomInSelector(ROOM1_NAME);
      await myRooms.roomsGroupTags.submitSelector();
      await myRooms.roomsGroupTags.cancelGroupCreation(GROUP_NAME);
    });

    await test.step("Verify no group tag was created", async () => {
      await myRooms.roomsGroupTags.checkGroupTagNotVisible(GROUP_NAME);
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
      await myRooms.roomsGroupTags.checkGroupTagVisible(GROUP_NAME);
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

  test("Edit room group name", async () => {
    const GROUP_NAME_EDITED = "My Test Group Edited";

    await test.step("Create group from the group-tags row", async () => {
      await myRooms.roomsGroupTags.createGroup(GROUP_NAME, ROOM1_NAME);
      await myRooms.roomsGroupTags.checkGroupTagVisible(GROUP_NAME);
    });

    await test.step("Open group settings, edit group name and verify tag is updated", async () => {
      await myRooms.roomsGroupTags.openGroupSettings(GROUP_NAME);
      await myRooms.roomsGroupTags.editGroupName(GROUP_NAME, GROUP_NAME_EDITED);
      await myRooms.roomsGroupTags.closePanel();
      await myRooms.roomsGroupTags.checkGroupTagVisible(GROUP_NAME_EDITED);
    });
  });

  test("Delete the group", async () => {
    await test.step("Create group from the group-tags row", async () => {
      await myRooms.roomsGroupTags.createGroup(GROUP_NAME, ROOM1_NAME);
      await myRooms.roomsGroupTags.checkGroupTagVisible(GROUP_NAME);
    });

    await test.step("Delete the group and verify it is removed from the group-tags row", async () => {
      await myRooms.roomsGroupTags.openGroupManagementPanel();
      await myRooms.roomsGroupTags.deleteGroup(GROUP_NAME);
      await myRooms.roomsGroupTags.checkGroupTagNotVisible(GROUP_NAME);
    });
  });

  test("Disable grouping via toggle and verify group-tags row disappears", async () => {
    await test.step("Navigate to profile file management and disable grouping", async () => {
      await profileFileManagement.open();
      await profileFileManagement.toggleRoomGrouping();
      await myRooms.toast.dismissToastSafely(
        roomToastMessages.roomGroupingDisabled,
      );
    });

    await test.step("Navigate back to rooms and verify group-tags row is no longer visible", async () => {
      await myRooms.navigateToArticle("Rooms");
      await myRooms.roomsGroupTags.checkGroupTagsRowNotVisible();
    });
  });

  test("Groups persist after disabling and re-enabling grouping", async () => {
    await test.step("Create group from the group-tags row", async () => {
      await myRooms.roomsGroupTags.createGroup(GROUP_NAME, ROOM1_NAME);
      await myRooms.roomsGroupTags.checkGroupTagVisible(GROUP_NAME);
    });

    await test.step("Disable grouping via profile settings", async () => {
      await profileFileManagement.open();
      await profileFileManagement.toggleRoomGrouping();
      await myRooms.toast.dismissToastSafely(
        roomToastMessages.roomGroupingDisabled,
      );
    });

    await test.step("Re-enable grouping and verify group-tags row reappears with the old group", async () => {
      await profileFileManagement.open();
      await profileFileManagement.toggleRoomGrouping();
      await myRooms.toast.dismissToastSafely(
        roomToastMessages.roomGroupingEnabled,
      );
      await myRooms.navigateToArticle("Rooms");
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

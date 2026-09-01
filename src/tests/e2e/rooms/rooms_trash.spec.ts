import Trash from "@/src/objects/files/trash/Trash";
import Rooms from "@/src/objects/rooms/Rooms";
import Files from "@/src/objects/files/Files";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import RoomsInviteDialog from "@/src/objects/rooms/RoomsInviteDialog";
import { DOC_ACTIONS } from "@/src/utils/constants/files";
import { test } from "@/src/fixtures";
import { getPortalUrl } from "@/config";

test.describe("Rooms trash", () => {
  let trash: Trash;
  let rooms: Rooms;
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    trash = new Trash(page);
    rooms = new Rooms(page, api.portalDomain);
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("Filter trash by room", async ({ apiSdk }) => {
    const roomA = "TrashRoomA";
    const roomB = "TrashRoomB";

    await test.step("Create two rooms, add a file to each, delete both to trash", async () => {
      const roomAResponse = await apiSdk.rooms.createRoom("owner", {
        title: roomA,
        roomType: "CustomRoom",
      });
      const roomAId = (await roomAResponse.json()).response.id as number;
      const fileAResponse = await apiSdk.files.createFile("owner", roomAId, {
        title: "RoomFileA",
      });
      await apiSdk.files.deleteFile(
        "owner",
        (await fileAResponse.json()).response.id as number,
      );

      const roomBResponse = await apiSdk.rooms.createRoom("owner", {
        title: roomB,
        roomType: "CustomRoom",
      });
      const roomBId = (await roomBResponse.json()).response.id as number;
      const fileBResponse = await apiSdk.files.createFile("owner", roomBId, {
        title: "RoomFileB",
      });
      await apiSdk.files.deleteFile(
        "owner",
        (await fileBResponse.json()).response.id as number,
      );
    });

    await test.step("Open Rooms trash and verify both files exist", async () => {
      await trash.openRoomsTrash();
      await trash.trashTable.checkRowExist("RoomFileA");
      await trash.trashTable.checkRowExist("RoomFileB");
    });

    await test.step("Filter by room A and verify only its file is shown", async () => {
      await trash.filter.openFilterDialog();
      await trash.filter.selectRoomFilter(roomA);
      await trash.filter.filterApplyButton.click();
      await trash.trashTable.checkRowExist("RoomFileA");
      await trash.trashTable.checkRowNotExist("RoomFileB");
    });

    await test.step("Clear filter and verify both files are shown again", async () => {
      await trash.filter.openFilterDialog();
      await trash.filter.clearFilterDialog();
      await trash.filter.filterApplyButton.click();
      await trash.trashTable.checkRowExist("RoomFileA");
      await trash.trashTable.checkRowExist("RoomFileB");
    });
  });

  test("Filter trash by author: file created by room manager appears when filtering by their name", async ({
    page,
    apiSdk,
    login,
  }) => {
    let memberName: string;
    let memberEmail: string;
    let memberPassword: string;
    let roomId: number;
    const roomInfoPanel = new RoomInfoPanel(page);
    const roomsInviteDialog = new RoomsInviteDialog(page);

    await test.step("Setup: create room and user via API", async () => {
      const roomResponse = await apiSdk.rooms.createRoom("owner", {
        title: "AuthorFilterRoom",
        roomType: "CustomRoom",
      });
      if (!roomResponse.ok()) {
        throw new Error(
          `createRoom failed: ${roomResponse.status()} - ${await roomResponse.text()}`,
        );
      }
      roomId = (await roomResponse.json()).response.id as number;

      const { response: memberResponse, userData: memberData } =
        await apiSdk.profiles.addMember("owner", "RoomAdmin");
      if (!memberResponse.ok()) {
        throw new Error(
          `addMember failed: ${memberResponse.status()} - ${await memberResponse.text()}`,
        );
      }
      const memberBody = await memberResponse.json();
      memberName = `${memberBody.response.firstName} ${memberBody.response.lastName}`;
      memberEmail = memberData.email;
      memberPassword = memberData.password;
    });

    await test.step("Owner opens room and adds member as Room Manager via UI", async () => {
      await rooms.openWithoutEmptyCheck();
      await rooms.roomsTable.checkRowExist("AuthorFilterRoom");
      await rooms.roomsTable.openRoomByName("AuthorFilterRoom");
      await rooms.infoPanel.open();
      await rooms.infoPanel.openTab("Contacts");
      await roomInfoPanel.clickAddUser();
      await roomsInviteDialog.openPeopleList();
      await roomsInviteDialog.contactsPanel.selectAccessType("roomManager");
      await roomsInviteDialog.contactsPanel.selectUserByEmail(memberEmail);
      await roomsInviteDialog.contactsPanel.clickSelectButton();
      await roomsInviteDialog.verifyUserRole(memberEmail, "Room admin");
      await roomsInviteDialog.submitInviteDialog();
      await rooms.infoPanel.openTab("Contacts");
      await rooms.infoPanel.checkMemberInList(memberName);
      await rooms.infoPanel.checkMemberHasRole(memberName, "Room manager");
    });

    await test.step("Room manager logs in and creates a file in the room via UI", async () => {
      await login.logout();
      await login.loginWithCredentials(memberEmail, memberPassword);
      await page.goto(
        `${getPortalUrl(login.portalDomain)}/rooms/shared/${roomId}/filter?folder=${roomId}`,
        { waitUntil: "load" },
      );
      await rooms.filesNavigation.openCreateDropdown();
      await rooms.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_DOCUMENT,
      );
      await rooms.filesNavigation.modal.checkModalExist();
      await rooms.filesNavigation.modal.fillCreateTextInput("RoomManagerFile");
      const [editorPage] = await Promise.all([
        page.context().waitForEvent("page", { timeout: 5000 }),
        rooms.filesNavigation.modal.clickCreateButton(),
      ]).catch(() => [null]);
      await editorPage?.close();
      await rooms.filesTable.checkRowExist("RoomManagerFile");
      await login.logout();
      await login.loginToPortal();
    });

    await test.step("Owner opens room and deletes the room manager's file via UI", async () => {
      await rooms.openWithoutEmptyCheck();
      await rooms.roomsTable.checkRowExist("AuthorFilterRoom");
      await rooms.roomsTable.openRoomByName("AuthorFilterRoom");
      await rooms.filesTable.checkRowExist("RoomManagerFile");
      await rooms.filesTable.openContextMenuForItem("RoomManagerFile");
      await rooms.filesTable.contextMenu.clickOption("Delete");
      await files.folderDeleteModal.clickDeleteFolder();
      await files.removeToast("successfully moved to Trash");
    });

    await test.step("Open trash and filter by room manager as Other author", async () => {
      await trash.openRoomsTrash();
      await trash.trashTable.checkRowExist("RoomManagerFile");
      await trash.filter.openFilterDialog();
      await trash.filter.authorOtherTag.click();
      const userPickerModal = trash.filter.page.locator("#modal-dialog");
      await userPickerModal
        .getByText(memberName, { exact: true })
        .click({ force: true });
      await userPickerModal
        .getByRole("button", { name: "Select", exact: true })
        .click({ force: true });
      await trash.filter.filterApplyButton.click();
    });

    await test.step("Verify the room manager's file appears after filtering by their name", async () => {
      await trash.trashTable.checkRowExist("RoomManagerFile");
    });
  });
});

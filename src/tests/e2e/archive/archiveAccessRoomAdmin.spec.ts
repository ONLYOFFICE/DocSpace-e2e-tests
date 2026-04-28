import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyArchive from "@/src/objects/archive/Archive";
import Login from "@/src/objects/common/Login";

// Room created by owner - Room Admin is NOT invited (should not appear in archive)
const OWNER_ROOM = "OwnerArchivedRoom";
// Room created by Room Admin themselves - they are the room owner
const OWN_ROOM = "RoomAdmin_ArchivedRoom";

test.describe("Archive - Room Admin access", () => {
  let myArchive: MyArchive;
  let login: Login;
  let ownerRoomId: number;
  let ownRoomId: number;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myArchive = new MyArchive(page, api.portalDomain);
    login = new Login(page, api.portalDomain);

    const ownerRoomResponse = await apiSdk.rooms.createRoom("owner", {
      title: OWNER_ROOM,
      roomType: "CustomRoom",
    });
    const ownerRoomBody = await ownerRoomResponse.json();
    ownerRoomId = ownerRoomBody.response.id;

    const { userData: roomAdminData } = await apiSdk.profiles.addMember(
      "owner",
      "RoomAdmin",
    );

    // Authenticate as Room Admin to get API token for creating their own room
    await api.auth.authenticateRoomAdmin();

    // Room Admin creates and archives their own room
    const ownRoomResponse = await apiSdk.rooms.createRoom("roomAdmin", {
      title: OWN_ROOM,
      roomType: "CustomRoom",
    });
    const ownRoomBody = await ownRoomResponse.json();
    ownRoomId = ownRoomBody.response.id;

    await apiSdk.rooms.archiveRoom("owner", ownerRoomId);
    await apiSdk.rooms.archiveRoom("roomAdmin", ownRoomId);

    await login.loginWithCredentials(
      roomAdminData.email,
      roomAdminData.password,
    );
    await myArchive.open();
    await myArchive.archiveTable.checkRowExist(OWN_ROOM);
  });

  test("Room Admin does NOT see archived rooms they were not invited to", async ({
    page,
  }) => {
    await expect(
      page.getByRole("link", { name: OWNER_ROOM }),
    ).not.toBeVisible();
  });

  test("Room Admin sees own archived room", async () => {
    await myArchive.archiveTable.checkRowExist(OWN_ROOM);
  });

  test("Room Admin can restore own archived room", async () => {
    await myArchive.restoreSingleRoom(OWN_ROOM);
    await myArchive.archiveTable.checkRowNotExist(OWN_ROOM);
  });

  test("Room Admin can delete own archived room", async () => {
    await myArchive.deleteSingleRoom(OWN_ROOM);
    await myArchive.archiveTable.checkRowNotExist(OWN_ROOM);
  });
});

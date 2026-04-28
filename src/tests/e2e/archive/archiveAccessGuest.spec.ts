import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyArchive from "@/src/objects/archive/Archive";
import Login from "@/src/objects/common/Login";

// Room created by owner - Guest is NOT invited (should not appear in archive)
const OWNER_ROOM = "OwnerArchivedRoom";
// Room created by owner - Guest is invited as editor
const INVITED_ROOM = "InvitedArchivedRoom";

test.describe("Archive - Guest access", () => {
  let myArchive: MyArchive;
  let login: Login;
  let ownerRoomId: number;
  let invitedRoomId: number;
  let guestId: string;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myArchive = new MyArchive(page, api.portalDomain);
    login = new Login(page, api.portalDomain);

    const [ownerRoomResponse, invitedRoomResponse] = await Promise.all([
      apiSdk.rooms.createRoom("owner", {
        title: OWNER_ROOM,
        roomType: "CustomRoom",
      }),
      apiSdk.rooms.createRoom("owner", {
        title: INVITED_ROOM,
        roomType: "CustomRoom",
      }),
    ]);

    const [ownerRoomBody, invitedRoomBody] = await Promise.all([
      ownerRoomResponse.json(),
      invitedRoomResponse.json(),
    ]);
    ownerRoomId = ownerRoomBody.response.id;
    invitedRoomId = invitedRoomBody.response.id;

    const { userData, response: guestResponse } =
      await apiSdk.profiles.addMember("owner", "Guest");
    const guestBody = await guestResponse.json();
    guestId = guestBody.response.id;

    await apiSdk.rooms.setRoomAccessRights("owner", invitedRoomId, {
      invitations: [{ id: guestId, access: "Editing" }],
      notify: false,
    });

    await apiSdk.rooms.archiveRoom("owner", ownerRoomId);
    await apiSdk.rooms.archiveRoom("owner", invitedRoomId);

    await login.loginWithCredentials(userData.email, userData.password);
    await myArchive.open();
    await myArchive.archiveTable.checkRowExist(INVITED_ROOM);
  });

  test("Guest does NOT see archived rooms they were not invited to", async ({
    page,
  }) => {
    await expect(
      page.getByRole("link", { name: OWNER_ROOM }),
    ).not.toBeVisible();
  });

  test("Guest sees invited archived room", async () => {
    await myArchive.archiveTable.checkRowExist(INVITED_ROOM);
  });

  test("Guest can view info panel for invited archived room", async ({
    page,
  }) => {
    await test.step("Open info panel", async () => {
      await myArchive.infoPanel.open();
      await myArchive.infoPanel.checkInfoPanelExist();
    });

    await myArchive.archiveTable.selectRow(INVITED_ROOM);

    await test.step("View History tab", async () => {
      await myArchive.infoPanel.openTab("History");
      await expect(page.getByTestId("info_history_tab")).toBeVisible();
    });

    await test.step("View Details tab", async () => {
      await myArchive.infoPanel.openTab("Details");
      await expect(page.getByTestId("info_details_tab")).toBeVisible();
    });
  });
});

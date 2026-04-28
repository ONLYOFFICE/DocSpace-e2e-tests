import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import MyArchive from "@/src/objects/archive/Archive";
import Login from "@/src/objects/common/Login";

// Room created by owner - DSA can see it without being invited
const OWNER_ROOM = "OwnerArchivedRoom";

test.describe("Archive - DocSpace Admin access", () => {
  let myArchive: MyArchive;
  let login: Login;
  let ownerRoomId: number;

  test.beforeEach(async ({ page, api, apiSdk }) => {
    myArchive = new MyArchive(page, api.portalDomain);
    login = new Login(page, api.portalDomain);

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: OWNER_ROOM,
      roomType: "CustomRoom",
    });
    const roomBody = await roomResponse.json();
    ownerRoomId = roomBody.response.id;

    const { userData: dsaData } = await apiSdk.profiles.addMember(
      "owner",
      "DocSpaceAdmin",
    );

    await apiSdk.rooms.archiveRoom("owner", ownerRoomId);

    await login.loginWithCredentials(dsaData.email, dsaData.password);
    await myArchive.open();
    await myArchive.archiveTable.checkRowExist(OWNER_ROOM);
  });

  test("DocSpace Admin sees archived rooms not invited to", async () => {
    await myArchive.archiveTable.checkRowExist(OWNER_ROOM);
  });

  test("DocSpace Admin can restore owner's archived room", async () => {
    await myArchive.restoreSingleRoom(OWNER_ROOM);
    await myArchive.archiveTable.checkRowNotExist(OWNER_ROOM);
  });

  test("DocSpace Admin can delete owner's archived room", async () => {
    await myArchive.deleteSingleRoom(OWNER_ROOM);
    await myArchive.archiveTable.checkRowNotExist(OWNER_ROOM);
  });

  test("DocSpace Admin can view info panel for archived room", async ({
    page,
  }) => {
    await test.step("Open info panel", async () => {
      await myArchive.infoPanel.open();
      await myArchive.infoPanel.checkInfoPanelExist();
    });

    await myArchive.archiveTable.selectRow(OWNER_ROOM);

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

import Trash from "@/src/objects/files/trash/Trash";
import { test } from "@/src/fixtures";

test.describe("Rooms trash", () => {
  let trash: Trash;

  test.beforeEach(async ({ page, login }) => {
    trash = new Trash(page);
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
});

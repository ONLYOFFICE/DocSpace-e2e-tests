import MyRooms from "@/src/objects/rooms/Rooms";
import RoomsFavorites from "@/src/objects/rooms/RoomsFavorites";
import { test } from "@/src/fixtures";

const ROOM_NAME = "Favorite Test Room";
const FILE_NAME = "RoomFavoriteDoc";

test.describe("Rooms: Favorites", () => {
  let myRooms: MyRooms;
  let roomsFavorites: RoomsFavorites;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    roomsFavorites = new RoomsFavorites(page);
    await login.loginToPortal();
    await myRooms.openWithoutEmptyCheck();
  });

  test("Favorites section shows empty view", async () => {
    await roomsFavorites.openFromNavigation();
    await roomsFavorites.checkNoFavoriteFilesTextExist();
  });

  test("Add a room file to Favorites", async ({ apiSdk }) => {
    await test.step("Create a room with a file via API", async () => {
      const roomRes = await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "EditingRoom",
      });
      const roomId = (await roomRes.json()).response.id;
      await apiSdk.files.createFile("owner", roomId, {
        title: `${FILE_NAME}.docx`,
      });
    });

    await test.step("Mark the file as favorite from the room", async () => {
      // Refresh the rooms list so the API-created room shows up before opening it.
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openRoom(ROOM_NAME);
      await myRooms.filesTable.markAsFavorite(FILE_NAME);
    });

    await test.step("Verify the file appears in Favorites", async () => {
      await roomsFavorites.openFromNavigation();
      await roomsFavorites.filesTable.checkRowExist(FILE_NAME);
    });
  });

  test("Remove a room file from Favorites", async ({ apiSdk }) => {
    await test.step("Create a room with a file via API", async () => {
      const roomRes = await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "EditingRoom",
      });
      const roomId = (await roomRes.json()).response.id;
      await apiSdk.files.createFile("owner", roomId, {
        title: `${FILE_NAME}.docx`,
      });
    });

    await test.step("Mark the file as favorite from the room", async () => {
      // Refresh the rooms list so the API-created room shows up before opening it.
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openRoom(ROOM_NAME);
      await myRooms.filesTable.markAsFavorite(FILE_NAME);
    });

    await test.step("Remove the file from Favorites", async () => {
      await roomsFavorites.openFromNavigation();
      await roomsFavorites.filesTable.checkRowExist(FILE_NAME);
      await roomsFavorites.removeFromFavorites(FILE_NAME);
      await roomsFavorites.filesTable.checkRowNotExist(FILE_NAME);
    });
  });
});

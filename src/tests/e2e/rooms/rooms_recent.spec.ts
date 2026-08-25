import MyRooms from "@/src/objects/rooms/Rooms";
import RoomsRecent from "@/src/objects/rooms/RoomsRecent";
import { test } from "@/src/fixtures";

const ROOM_NAME = "Recent Test Room";
const FILE_NAME = "RoomRecentDoc";

test.describe("Rooms: Recent", () => {
  let myRooms: MyRooms;
  let roomsRecent: RoomsRecent;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    roomsRecent = new RoomsRecent(page);
    await login.loginToPortal();
    await myRooms.openWithoutEmptyCheck();
  });

  test("Recent section shows empty view", async () => {
    await roomsRecent.openFromNavigation();
    await roomsRecent.checkNoRecentFilesTextExist();
  });

  test("File appears in Recent after opening", async ({ apiSdk }) => {
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

    await test.step("Open the file in the editor from the room", async () => {
      // Refresh the rooms list so the API-created room shows up before opening it.
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openRoom(ROOM_NAME);
      const editor = await myRooms.filesTable.openInEditor(FILE_NAME);
      await editor.close();
    });

    await test.step("Verify the file appears in Recent", async () => {
      await roomsRecent.openFromNavigation();
      await roomsRecent.filesTable.checkRowExist(FILE_NAME);
    });
  });
});

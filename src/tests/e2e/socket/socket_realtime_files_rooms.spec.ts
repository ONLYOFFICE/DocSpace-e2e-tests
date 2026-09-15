import { test } from "@/src/fixtures";
import Rooms from "@/src/objects/rooms/Rooms";
import Files from "@/src/objects/files/Files";

// Changes are made over the API while the page just sits there: anything that
// shows up (or goes away) got there over the socket, without a reload.
const ROOM_NAME = "Socket Room";
const FILE_NAME = "Socket Doc";
const FOLDER_NAME = "Socket Folder";

test.describe("Socket: real-time files and rooms", () => {
  test("Room created and deleted over the API updates the rooms list", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const rooms = new Rooms(page, api.portalDomain);
    await login.loginToPortal();

    await test.step("Open the empty rooms list", async () => {
      await rooms.open();
    });

    let roomId = 0;
    await test.step("Room created over the API shows up in the list", async () => {
      const response = await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "CustomRoom",
      });
      roomId = (await response.json()).response.id;
      await rooms.roomsTable.checkRowExist(ROOM_NAME);
    });

    await test.step("Deleting it over the API removes it from the list", async () => {
      await apiSdk.rooms.deleteRoom("owner", roomId);
      await rooms.roomsTable.checkRowNotExist(ROOM_NAME);
    });
  });

  test("Files created and deleted over the API update My Documents", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const files = new Files(page, api.portalDomain);
    await login.loginToPortal();

    await test.step("Open My Documents", async () => {
      await files.open();
      await files.filesTable.checkTableExist();
    });

    await test.step("File created over the API shows up in the list", async () => {
      await apiSdk.files.createFileInMyDocuments("owner", {
        title: FILE_NAME,
      });
      await files.filesTable.checkRowExist(FILE_NAME);
    });

    await test.step("Folder created over the API shows up in the list", async () => {
      const myDocumentsId =
        await apiSdk.folders.getMyDocumentsFolderId("owner");
      await apiSdk.files.createFolder("owner", myDocumentsId, FOLDER_NAME);
      await files.filesTable.checkRowExist(FOLDER_NAME);
    });

    await test.step("Deleting the file over the API removes it from the list", async () => {
      const fileId = await apiSdk.files.getFileIdByTitle("owner", FILE_NAME);
      await apiSdk.files.deleteFile("owner", fileId);
      await files.filesTable.checkRowNotExist(FILE_NAME);
    });
  });

  test("Deleting the room a user is viewing drops them out of it", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const rooms = new Rooms(page, api.portalDomain);
    await login.loginToPortal();

    let roomId = 0;
    await test.step("Create a room and open it", async () => {
      const response = await apiSdk.rooms.createRoom("owner", {
        title: ROOM_NAME,
        roomType: "CustomRoom",
      });
      roomId = (await response.json()).response.id;

      await rooms.openWithoutEmptyCheck();
      await rooms.roomsTable.checkRowExist(ROOM_NAME);
      await rooms.openRoom(ROOM_NAME);
      await rooms.filesTable.checkTableExist();
    });

    await test.step("Deleting the room drops the viewer out of it", async () => {
      await apiSdk.rooms.deleteRoom("owner", roomId);
      await rooms.expectDroppedOutOfRoom(roomId);
    });
  });
});

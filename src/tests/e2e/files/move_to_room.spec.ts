import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import MyRooms from "@/src/objects/rooms/Rooms";
import {
  roomCreateTitles,
  TRoomCreateTitles,
} from "@/src/utils/constants/rooms";

test.describe("Move file to room", () => {
  let files: Files;
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
    await files.open();
    await files.deleteAllDocs();
  });

  async function moveFileToRoom(roomType: TRoomCreateTitles, roomName: string) {
    await test.step("Create document file", async () => {
      await files.createDocumentFile();
    });

    await test.step(`Move file to new ${roomType}`, async () => {
      await files.moveFileToNewRoom("Document", roomType, roomName);
      await files.filesSelectPanel.confirmSelection();
      await files.filesTable.checkRowNotExist("Document");
    });

    await test.step("Verify file is in the room", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openRoom(roomName);
      await myRooms.filesTable.checkRowExist("Document");
    });
  }

  test("Move file to Public room", async () => {
    await moveFileToRoom(roomCreateTitles.public, "PublicRoom");
  });

  test("Move file to Collaboration room", async () => {
    await moveFileToRoom(roomCreateTitles.collaboration, "CollaborationRoom");
  });

  test("Move file to Virtual Data room", async () => {
    await moveFileToRoom(roomCreateTitles.virtualData, "VirtualDataRoom");
  });

  test("Move file to Custom room", async () => {
    await moveFileToRoom(roomCreateTitles.custom, "CustomRoom");
  });

  test("Move non-PDF file to Form Filling room shows alert", async () => {
    await files.createDocumentFile();
    await files.moveFileToNewRoom(
      "Document",
      roomCreateTitles.formFilling,
      "FormFillingRoom",
    );
    await files.filesSelectPanel.checkIncompatibleFileAlertVisible();
    await files.filesSelectPanel.checkConfirmButtonDisabled();
    await files.filesSelectPanel.close();
    await files.filesTable.checkRowExist("Document");
  });
});

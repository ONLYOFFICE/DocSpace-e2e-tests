import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import MyDocuments from "@/src/objects/files/MyDocuments";
import MyRooms from "@/src/objects/rooms/Rooms";
import {
  roomCreateTitles,
  TRoomCreateTitles,
} from "@/src/utils/constants/rooms";


test.describe("Move file to room", () => {
  let myDocuments: MyDocuments;
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    myRooms = new MyRooms(page, api.portalDomain);

    await login.loginToPortal();
    await myDocuments.open();
    await myDocuments.deleteAllDocs();
  });

  async function moveFileToRoom(roomType: TRoomCreateTitles, roomName: string) {
    await test.step("Create document file", async () => {
      await myDocuments.createDocumentFile();
    });

    await test.step(`Move file to new ${roomType}`, async () => {
      await myDocuments.moveFileToNewRoom("Document", roomType, roomName);
      await myDocuments.filesSelectPanel.confirmSelection();
      if (roomType === roomCreateTitles.public) {
        await myDocuments.confirmMoveToPublicRoom();
      }
      await myDocuments.filesTable.checkRowNotExist("Document");
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

  test("Move non-PDF file to Form Filling room shows alert", async ({
    page,
  }) => {
    await myDocuments.createDocumentFile();
    await myDocuments.moveFileToNewRoom(
      "Document",
      roomCreateTitles.formFilling,
      "FormFillingRoom",
    );
    await expect(
      page.getByText(
        "The file cannot be moved to this room. Please try to move the ONLYOFFICE PDF form.",
      ),
    ).toBeVisible();
    await myDocuments.filesSelectPanel.close();
    await myDocuments.filesTable.checkRowExist("Document");
  });
});

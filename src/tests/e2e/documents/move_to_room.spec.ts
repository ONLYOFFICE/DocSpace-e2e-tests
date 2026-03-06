import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import MyDocuments from "@/src/objects/files/MyDocuments";
import MyRooms from "@/src/objects/rooms/Rooms";
import {
  roomCreateTitles,
  TRoomCreateTitles,
} from "@/src/utils/constants/rooms";

const roomTypes: { type: TRoomCreateTitles; name: string }[] = [
  { type: roomCreateTitles.public, name: "PublicRoom" },
  { type: roomCreateTitles.collaboration, name: "CollaborationRoom" },
  { type: roomCreateTitles.virtualData, name: "VirtualDataRoom" },
  { type: roomCreateTitles.custom, name: "CustomRoom" },
];

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

  for (const { type, name } of roomTypes) {
    test(`Move file to ${type}`, async () => {
      await test.step("Create document file", async () => {
        await myDocuments.createDocumentFile();
      });

      await test.step(`Move file to new ${type}`, async () => {
        await myDocuments.moveFileToNewRoom("Document", type, name);
        await myDocuments.filesSelectPanel.confirmSelection();
        if (type === roomCreateTitles.public) {
          await myDocuments.confirmMoveToPublicRoom();
        }
        await myDocuments.filesTable.checkRowNotExist("Document");
      });

      await test.step("Verify file is in the room", async () => {
        await myRooms.openWithoutEmptyCheck();
        await myRooms.openRoom(name);
        await myRooms.filesTable.checkRowExist("Document");
      });
    });
  }

  test("Move non-PDF file to Form Filling room shows alert", async ({
    page,
  }) => {
    await test.step("Create document file", async () => {
      await myDocuments.createDocumentFile();
    });

    await test.step("Open Move to selector and navigate to Form Filling room", async () => {
      await myDocuments.moveFileToNewRoom(
        "Document",
        roomCreateTitles.formFilling,
        "FormFillingRoom",
      );
    });

    await test.step("Verify alert is shown and Move here is disabled", async () => {
      await expect(
        page.getByText(
          "The file cannot be moved to this room. Please try to move the ONLYOFFICE PDF form.",
        ),
      ).toBeVisible();
    });

    await test.step("Close selector and verify file is still in My Documents", async () => {
      await myDocuments.filesSelectPanel.close();
      await myDocuments.filesTable.checkRowExist("Document");
    });
  });
});

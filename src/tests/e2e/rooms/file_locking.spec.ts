import MyRooms from "@/src/objects/rooms/Rooms";
import {
  roomCreateTitles,
  roomDialogSource,
} from "@/src/utils/constants/rooms";
import {
  documentContextMenuOption,
  DOC_ACTIONS,
} from "@/src/utils/constants/files";
import { test } from "@/src/fixtures";

test.describe.only("File locking", () => {
  let myRooms: MyRooms;

  const fileName = "Document";

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("Lock file", async ({ page }) => {
    await test.step("Precondition: create room and file", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.createRoom(
        roomCreateTitles.collaboration,
      );

      await myRooms.filesNavigation.openCreateDropdown();
      await myRooms.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_DOCUMENT,
      );
      await myRooms.filesNavigation.modal.fillCreateTextInput(fileName);
      const [newPage] = await Promise.all([
        page.context().waitForEvent("page", { timeout: 5000 }),
        myRooms.filesNavigation.modal.clickCreateButton(),
      ]).catch(() => [null]);
      await newPage?.close();
      await myRooms.filesTable.checkRowExist(fileName);
    });

    await myRooms.filesTable.openContextMenuForItem(fileName);
    await myRooms.filesTable.contextMenu.clickOption(
      documentContextMenuOption.blockVersion,
    );
    await myRooms.infoPanel.open();
    await myRooms.filesTable.selectDocxFile();
    await myRooms.infoPanel.openTab("History");
    await myRooms.infoPanel.checkHistoryExist("File locked.");
    await myRooms.infoPanel.close();
  });

  test("Unlock file", async ({ page }) => {
    await test.step("Precondition: create room, file and lock it", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.openCreateRoomDialog(roomDialogSource.navigation);
      await myRooms.roomsCreateDialog.openRoomType(
        roomCreateTitles.collaboration,
      );
      await myRooms.roomsCreateDialog.createRoom(
        roomCreateTitles.collaboration,
      );

      await myRooms.filesNavigation.openCreateDropdown();
      await myRooms.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_DOCUMENT,
      );
      await myRooms.filesNavigation.modal.fillCreateTextInput(fileName);
      const [newPage] = await Promise.all([
        page.context().waitForEvent("page", { timeout: 5000 }),
        myRooms.filesNavigation.modal.clickCreateButton(),
      ]).catch(() => [null]);
      await newPage?.close();
      await myRooms.filesTable.checkRowExist(fileName);

      await myRooms.filesTable.openContextMenuForItem(fileName);
      await myRooms.filesTable.contextMenu.clickOption(
        documentContextMenuOption.blockVersion,
      );
      await myRooms.infoPanel.open();
      await myRooms.filesTable.selectDocxFile();
      await myRooms.infoPanel.openTab("History");
      await myRooms.infoPanel.checkHistoryExist("File locked.");
      await myRooms.infoPanel.close();
    });

    await myRooms.filesTable.openContextMenuForItem(fileName);
    await myRooms.filesTable.contextMenu.clickOption(
      documentContextMenuOption.blockVersion,
    );
    await myRooms.infoPanel.open();
    await myRooms.filesTable.selectDocxFile();
    await myRooms.infoPanel.openTab("History");
    await myRooms.infoPanel.checkHistoryExist("File unlocked.");
    await myRooms.infoPanel.close();
  });
});

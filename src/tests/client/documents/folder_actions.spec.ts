import Folder from "@/src/objects/files/Folder";
import Rooms from "@/src/objects/rooms/Rooms";
import { roomCreateTitles } from "@/src/utils/constants/rooms";
import { DOC_ACTIONS } from "@/src/utils/constants/files";
import { test } from "@/src/fixtures";

test.describe("Folder", () => {
  let folder: Folder;
  let myRooms: Rooms;

  const baseFolder = `BaseTestFolder`;
  const folderToMove = `TestFolderToMove`;
  const folderToCopy = `TestFolderToCopy`;
  const renamedFolder = `${baseFolder}-renamed`;

  test.beforeEach(async ({ page, api, login }) => {
    folder = new Folder(page, api.portalDomain);
    myRooms = new Rooms(page, api.portalDomain);

    await login.loginToPortal();
    await folder.open();
  });

  test("Folder actions", async () => {
    await test.step("Create folder", async () => {
      await folder.filesNavigation.openCreateDropdown();
      await folder.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_FOLDER,
      );
      await folder.filesNavigation.modal.checkModalExist();
      await folder.filesNavigation.modal.checkModalTitleExist("New folder");
      await folder.filesNavigation.modal.fillCreateTextInput(baseFolder);
      await folder.filesNavigation.modal.clickCreateButton();
      await folder.expectFolderVisible(baseFolder);
    });

    await test.step("Open folder", async () => {
      await folder.filesTable.openContextMenuForItem(baseFolder);
      await folder.filesTable.contextMenu.clickOption("Open");
      await folder.filesNavigation.gotoBack();
    });

    await test.step("Create room", async () => {
      await folder.open();
      await folder.filesTable.openContextMenuForItem(baseFolder);
      await folder.filesTable.contextMenu.clickSubmenuOption(
        "Share",
        "Create room",
      );
      await folder.createRoomFromFolder(roomCreateTitles.public);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsFilter.fillRoomsSearchInputAndCheckRequest(baseFolder);
      await myRooms.roomsTable.checkRowExist(baseFolder);
    });

    await test.step("Move folder into another folder", async () => {
      await folder.open();
      await folder.createNew(folderToMove);

      await folder.filesTable.openContextMenuForItem(folderToMove);
      await folder.filesTable.contextMenu.clickSubmenuOption(
        "Move or copy",
        "Move to",
      );
      await folder.filesSelectPanel.checkFileSelectPanelExist();
      await folder.filesSelectPanel.selectItemByText(baseFolder);
      await folder.filesSelectPanel.confirmSelection();
      // TODO: Re-enable this check after the IO bug is fixed;
      // await folder.expectFolderNotVisible(folderToMove);
    });

    await test.step("Copy", async () => {
      await folder.createNew(folderToCopy);

      await folder.filesTable.openContextMenuForItem(folderToCopy);
      await folder.filesTable.contextMenu.clickSubmenuOption(
        "Move or copy",
        "Copy",
      );
      await folder.filesSelectPanel.checkFileSelectPanelExist();
      await folder.filesSelectPanel.selectItemByText(baseFolder);
      await folder.filesSelectPanel.confirmSelection();

      await folder.filesTable.openContextMenuForItem(baseFolder);
      await folder.filesTable.contextMenu.clickOption("Open");
      await folder.expectFolderVisible(folderToCopy);
    });

    await test.step("RenameFolder", async () => {
      await folder.open();
      await folder.filesTable.openContextMenuForItem(baseFolder);
      await folder.filesTable.contextMenu.clickOption("Rename");
      await folder.filesNavigation.modal.checkModalExist();
      await folder.filesNavigation.modal.fillCreateTextInput(renamedFolder);
      await folder.filesNavigation.modal.clickCreateButton();
      await folder.removeToast(
        `The folder '${baseFolder}' is renamed to '${renamedFolder}'`,
      );
      await folder.expectFolderRenamed(baseFolder, renamedFolder);
    });

    await test.step("Delete", async () => {
      await folder.filesTable.openContextMenuForItem(renamedFolder);
      await folder.filesTable.contextMenu.clickOption("Delete");
      await folder.folderDeleteModal.clickDeleteFolder();
      await folder.removeToast(
        `The folder ${renamedFolder} successfully moved to Trash`,
      );
      await folder.expectFolderNotVisible(renamedFolder);
    });
  });
});

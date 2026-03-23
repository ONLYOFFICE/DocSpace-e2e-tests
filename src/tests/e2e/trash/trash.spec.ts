import MyDocuments from "@/src/objects/files/MyDocuments";
import Trash from "@/src/objects/trash/Trash";
import { DOC_ACTIONS } from "@/src/utils/constants/files";
import { test } from "@/src/fixtures";

test.describe("Trash", () => {
  let myDocuments: MyDocuments;
  let trash: Trash;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    trash = new Trash(page);

    await login.loginToPortal();
    await myDocuments.open();
    await myDocuments.deleteAllDocs();
  });

  test("Delete all files from trash forever", async () => {
    await test.step("Create files and delete them to trash", async () => {
      await myDocuments.createDocumentFile("TrashFile1");
      await myDocuments.createDocumentFile("TrashFile2");
      await myDocuments.createDocumentFile("TrashFile3");
      await myDocuments.bulkDeleteFiles([
        "TrashFile1",
        "TrashFile2",
        "TrashFile3",
      ]);
    });

    await test.step("Open trash and verify files exist", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("TrashFile1");
      await trash.trashTable.checkRowExist("TrashFile2");
      await trash.trashTable.checkRowExist("TrashFile3");
    });

    await test.step("Delete all files forever", async () => {
      await trash.deleteForever();
    });

    await test.step("Verify trash is empty", async () => {
      await trash.trashEmptyView.checkNoDocsTextExist();
    });
  });

  test("Delete single file from trash forever", async () => {
    await test.step("Create files and delete them to trash", async () => {
      await myDocuments.createDocumentFile("KeepFile");
      await myDocuments.createDocumentFile("DeleteFile");
      await myDocuments.bulkDeleteFiles(["KeepFile", "DeleteFile"]);
    });

    await test.step("Open trash and permanently delete one file", async () => {
      await trash.open();
      await trash.deleteFileForever("DeleteFile");
    });

    await test.step("Verify only the other file remains", async () => {
      await trash.trashTable.checkRowExist("KeepFile");
      await trash.trashTable.checkRowNotExist("DeleteFile");
    });
  });

  test("Restore single file from trash to Documents", async () => {
    await test.step("Create file and delete to trash", async () => {
      await myDocuments.createDocumentFile("RestoreMe");
      await myDocuments.deleteFile("RestoreMe");
    });

    await test.step("Restore file from trash", async () => {
      await trash.open();
      await trash.restoreFileTo("RestoreMe");
    });

    await test.step("Verify file is back in My Documents", async () => {
      await myDocuments.open();
      await myDocuments.filesTable.checkRowExist("RestoreMe");
    });
  });

  test("Restore all files from trash via header menu", async () => {
    await test.step("Create files and delete them to trash", async () => {
      await myDocuments.createDocumentFile("RestoreAll1");
      await myDocuments.createDocumentFile("RestoreAll2");
      await myDocuments.deleteFile("RestoreAll1");
      await myDocuments.deleteFile("RestoreAll2");
    });

    await test.step("Open trash and restore all via header", async () => {
      await trash.open();
      await trash.restoreAllToDocuments();
      await trash.trashEmptyView.checkNoDocsTextExist();
    });

    await test.step("Verify files are restored to My Documents", async () => {
      await myDocuments.open();
      await myDocuments.filesTable.checkRowExist("RestoreAll1");
      await myDocuments.filesTable.checkRowExist("RestoreAll2");
    });
  });

  test("Deleted folder appears in trash", async () => {
    await test.step("Create folder", async () => {
      await myDocuments.filesNavigation.openCreateDropdown();
      await myDocuments.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_FOLDER,
      );
      await myDocuments.filesNavigation.modal.fillCreateTextInput(
        "TrashFolder",
      );
      await myDocuments.filesNavigation.modal.clickCreateButton();
      await myDocuments.filesTable.checkRowExist("TrashFolder");
    });

    await test.step("Delete folder", async () => {
      await myDocuments.filesTable.openContextMenuForItem("TrashFolder");
      await myDocuments.filesTable.contextMenu.clickOption("Delete");
      await myDocuments.folderDeleteModal.clickDeleteFolder();
      await myDocuments.removeToast("successfully moved to Trash");
    });

    await test.step("Verify folder is in trash", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("TrashFolder");
    });
  });

  test("Restore folder from trash to Documents", async () => {
    await test.step("Create folder and delete to trash", async () => {
      await myDocuments.filesNavigation.openCreateDropdown();
      await myDocuments.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_FOLDER,
      );
      await myDocuments.filesNavigation.modal.fillCreateTextInput(
        "RestoreFolder",
      );
      await myDocuments.filesNavigation.modal.clickCreateButton();
      await myDocuments.filesTable.checkRowExist("RestoreFolder");

      await myDocuments.filesTable.openContextMenuForItem("RestoreFolder");
      await myDocuments.filesTable.contextMenu.clickOption("Delete");
      await myDocuments.folderDeleteModal.clickDeleteFolder();
      await myDocuments.removeToast("successfully moved to Trash");
    });

    await test.step("Restore folder from trash", async () => {
      await trash.open();
      await trash.restoreFileTo("RestoreFolder");
    });

    await test.step("Verify folder is back in My Documents", async () => {
      await myDocuments.open();
      await myDocuments.filesTable.checkRowExist("RestoreFolder");
    });
  });
});

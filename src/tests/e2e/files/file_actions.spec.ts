import Files from "@/src/objects/files/Files";
import Trash from "@/src/objects/files/trash/Trash";
import { DOC_ACTIONS } from "@/src/utils/constants/files";
import { test } from "@/src/fixtures";

test.describe("File actions", () => {
  let files: Files;
  let trash: Trash;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    trash = new Trash(page);

    await login.loginToPortal();
    await files.open();
    await files.deleteAllDocs();
  });

  test("Delete file to trash", async () => {
    await test.step("Create file", async () => {
      await files.createDocumentFile();
    });

    await test.step("Delete file via context menu", async () => {
      await files.deleteFile("Document");
    });

    await test.step("Verify file appears in trash", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("Document");
    });
  });

  test("Restore file from trash", async () => {
    await test.step("Create and delete file", async () => {
      await files.createDocumentFile();
      await files.deleteFile("Document");
    });

    await test.step("Restore file to My Documents", async () => {
      await trash.open();
      await trash.restoreFileTo("Document");
    });

    await test.step("Verify file is back in My Documents", async () => {
      await files.open();
      await files.filesTable.checkRowExist("Document");
    });
  });

  test("Permanent delete from trash", async () => {
    await test.step("Create and delete file", async () => {
      await files.createDocumentFile();
      await files.deleteFile("Document");
    });

    await test.step("Permanently delete file from trash", async () => {
      await trash.open();
      await trash.deleteFileForever("Document");
    });
  });

  test("Move file to folder", async () => {
    const targetFolder = "TargetFolder";

    await test.step("Create file and target folder", async () => {
      await files.createDocumentFile();
      await files.filesNavigation.openCreateDropdown();
      await files.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_FOLDER);
      await files.filesNavigation.modal.fillCreateTextInput(targetFolder);
      await files.filesNavigation.modal.clickCreateButton();
      await files.filesTable.checkRowExist(targetFolder);
    });

    await test.step("Move file to folder", async () => {
      await files.moveFileTo("Document", targetFolder);
    });
  });

  test("Copy file to folder", async () => {
    const targetFolder = "TargetFolder";

    await test.step("Create file and target folder", async () => {
      await files.createDocumentFile();
      await files.filesNavigation.openCreateDropdown();
      await files.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_FOLDER);
      await files.filesNavigation.modal.fillCreateTextInput(targetFolder);
      await files.filesNavigation.modal.clickCreateButton();
      await files.filesTable.checkRowExist(targetFolder);
    });

    await test.step("Copy file to folder", async () => {
      await files.copyFileTo("Document", targetFolder);
    });

    await test.step("Verify copy exists in target folder", async () => {
      await files.filesTable.openContextMenuForItem(targetFolder);
      await files.filesTable.contextMenu.clickOption("Open");
      await files.filesTable.checkRowExist("Document");
    });
  });

  test("Duplicate file", async () => {
    await test.step("Create file", async () => {
      await files.createDocumentFile();
    });

    await test.step("Duplicate file", async () => {
      await files.duplicateFile("Document");
    });
  });
});

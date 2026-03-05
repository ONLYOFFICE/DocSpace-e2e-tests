import MyDocuments from "@/src/objects/files/MyDocuments";
import Trash from "@/src/objects/trash/Trash";
import { DOC_ACTIONS } from "@/src/utils/constants/files";
import { test } from "@/src/fixtures";

test.describe("File actions", () => {
  let myDocuments: MyDocuments;
  let trash: Trash;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    trash = new Trash(page);

    await login.loginToPortal();
    await myDocuments.open();
    await myDocuments.deleteAllDocs();
  });

  test("Delete file to trash", async () => {
    await test.step("Create file", async () => {
      await myDocuments.createDocumentFile();
    });

    await test.step("Delete file via context menu", async () => {
      await myDocuments.deleteFile("Document");
    });

    await test.step("Verify file appears in trash", async () => {
      await trash.open();
      await trash.trashTable.checkRowExist("Document");
    });
  });

  test("Restore file from trash", async () => {
    await test.step("Create and delete file", async () => {
      await myDocuments.createDocumentFile();
      await myDocuments.deleteFile("Document");
    });

    await test.step("Restore file to My Documents", async () => {
      await trash.open();
      await trash.restoreFileTo("Document");
    });

    await test.step("Verify file is back in My Documents", async () => {
      await myDocuments.open();
      await myDocuments.filesTable.checkRowExist("Document");
    });
  });

  test("Permanent delete from trash", async () => {
    await test.step("Create and delete file", async () => {
      await myDocuments.createDocumentFile();
      await myDocuments.deleteFile("Document");
    });

    await test.step("Permanently delete file from trash", async () => {
      await trash.open();
      await trash.deleteFileForever("Document");
    });
  });

  test("Move file to folder", async () => {
    const targetFolder = "TargetFolder";

    await test.step("Create file and target folder", async () => {
      await myDocuments.createDocumentFile();
      await myDocuments.filesNavigation.openCreateDropdown();
      await myDocuments.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_FOLDER);
      await myDocuments.filesNavigation.modal.fillCreateTextInput(targetFolder);
      await myDocuments.filesNavigation.modal.clickCreateButton();
      await myDocuments.filesTable.checkRowExist(targetFolder);
    });

    await test.step("Move file to folder", async () => {
      await myDocuments.moveFileTo("Document", targetFolder);
    });
  });

  test("Copy file to folder", async () => {
    const targetFolder = "TargetFolder";

    await test.step("Create file and target folder", async () => {
      await myDocuments.createDocumentFile();
      await myDocuments.filesNavigation.openCreateDropdown();
      await myDocuments.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_FOLDER);
      await myDocuments.filesNavigation.modal.fillCreateTextInput(targetFolder);
      await myDocuments.filesNavigation.modal.clickCreateButton();
      await myDocuments.filesTable.checkRowExist(targetFolder);
    });

    await test.step("Copy file to folder", async () => {
      await myDocuments.copyFileTo("Document", targetFolder);
    });

    await test.step("Verify copy exists in target folder", async () => {
      await myDocuments.filesTable.openContextMenuForItem(targetFolder);
      await myDocuments.filesTable.contextMenu.clickOption("Open");
      await myDocuments.filesTable.checkRowExist("Document");
    });
  });

  test("Duplicate file", async () => {
    await test.step("Create file", async () => {
      await myDocuments.createDocumentFile();
    });

    await test.step("Duplicate file", async () => {
      await myDocuments.duplicateFile("Document");
    });
  });
});

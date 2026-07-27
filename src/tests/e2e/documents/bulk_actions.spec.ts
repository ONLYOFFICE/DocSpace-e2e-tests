import Files from "@/src/objects/files/Files";
import Trash from "@/src/objects/files/trash/Trash";
import { DOC_ACTIONS } from "@/src/utils/constants/files";
import { test } from "@/src/fixtures";

test.describe("My Documents: Bulk actions", () => {
  let files: Files;
  let trash: Trash;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    trash = new Trash(page);
    await login.loginToPortal();
    await files.open();
    await files.deleteAllDocs();
  });

  test("Select multiple files", async () => {
    await test.step("Create files", async () => {
      await files.createDocumentFile("File1");
      await files.createDocumentFile("File2");
      await files.createDocumentFile("File3");
    });

    await test.step("Select two files and verify checkboxes", async () => {
      await files.filesTable.selectMultipleRows(["File1", "File2"]);
      await files.filesTable.expectRowIsChecked(
        await files.filesTable.getRowByTitle("File1"),
      );
      await files.filesTable.expectRowIsChecked(
        await files.filesTable.getRowByTitle("File2"),
      );
    });

    await test.step("Deselect with Escape", async () => {
      await files.filesTable.resetSelect();
    });
  });

  test("Bulk delete files", async () => {
    await test.step("Create files", async () => {
      await files.createDocumentFile("File1");
      await files.createDocumentFile("File2");
      await files.createDocumentFile("File3");
    });

    await test.step("Bulk delete File1 and File2", async () => {
      await files.bulkDeleteFiles(["File1", "File2"]);
    });

    await test.step("Verify deleted files are in trash, File3 remains", async () => {
      await files.filesTable.checkRowExist("File3");
      await trash.open();
      await trash.trashTable.checkRowExist("File1");
      await trash.trashTable.checkRowExist("File2");
    });
  });

  test("Bulk move files to folder", async () => {
    const targetFolder = "TargetFolder";

    await test.step("Create files and target folder", async () => {
      await files.createDocumentFile("File1");
      await files.createDocumentFile("File2");
      await files.filesNavigation.openCreateDropdown();
      await files.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_FOLDER);
      await files.filesNavigation.modal.fillCreateTextInput(targetFolder);
      await files.filesNavigation.modal.clickCreateButton();
      await files.filesTable.checkRowExist(targetFolder);
    });

    await test.step("Bulk move File1 and File2 to TargetFolder", async () => {
      await files.bulkMoveTo(["File1", "File2"], targetFolder);
    });

    await test.step("Verify files appear inside the folder", async () => {
      await files.filesTable.openContextMenuForItem(targetFolder);
      await files.filesTable.contextMenu.clickOption("Open");
      await files.filesTable.checkRowExist("File1");
      await files.filesTable.checkRowExist("File2");
    });
  });

  test("Bulk copy files to folder", async () => {
    const targetFolder = "TargetFolder";

    await test.step("Create files and target folder", async () => {
      await files.createDocumentFile("File1");
      await files.createDocumentFile("File2");
      await files.filesNavigation.openCreateDropdown();
      await files.filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_FOLDER);
      await files.filesNavigation.modal.fillCreateTextInput(targetFolder);
      await files.filesNavigation.modal.clickCreateButton();
      await files.filesTable.checkRowExist(targetFolder);
    });

    await test.step("Bulk copy File1 and File2 to TargetFolder", async () => {
      await files.bulkCopyTo(["File1", "File2"], targetFolder);
    });

    await test.step("Verify originals remain and copies exist in folder", async () => {
      await files.filesTable.checkRowExist("File1");
      await files.filesTable.checkRowExist("File2");
      await files.filesTable.openContextMenuForItem(targetFolder);
      await files.filesTable.contextMenu.clickOption("Open");
      await files.filesTable.checkRowExist("File1");
      await files.filesTable.checkRowExist("File2");
    });
  });

  test("Bulk download files as zip", async () => {
    await test.step("Create files", async () => {
      await files.createDocumentFile("File1");
      await files.createDocumentFile("File2");
    });

    await test.step("Bulk download File1 and File2", async () => {
      await files.bulkDownload(["File1", "File2"]);
    });
  });
});

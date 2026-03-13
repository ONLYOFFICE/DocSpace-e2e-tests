import MyDocuments from "@/src/objects/files/MyDocuments";
import Trash from "@/src/objects/trash/Trash";
import { DOC_ACTIONS } from "@/src/utils/constants/files";
import { test } from "@/src/fixtures";

test.describe("My Documents: Bulk actions", () => {
  let myDocuments: MyDocuments;
  let trash: Trash;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    trash = new Trash(page);
    await login.loginToPortal();
    await myDocuments.open();
    await myDocuments.deleteAllDocs();
  });

  test("Select multiple files", async () => {
    await test.step("Create files", async () => {
      await myDocuments.createDocumentFile("File1");
      await myDocuments.createDocumentFile("File2");
      await myDocuments.createDocumentFile("File3");
    });

    await test.step("Select two files and verify checkboxes", async () => {
      await myDocuments.filesTable.selectMultipleRows(["File1", "File2"]);
      await myDocuments.filesTable.expectRowIsChecked(
        await myDocuments.filesTable.getRowByTitle("File1"),
      );
      await myDocuments.filesTable.expectRowIsChecked(
        await myDocuments.filesTable.getRowByTitle("File2"),
      );
    });

    await test.step("Deselect with Escape", async () => {
      await myDocuments.filesTable.resetSelect();
    });
  });

  test("Bulk delete files", async () => {

    await test.step("Create files", async () => {
      await myDocuments.createDocumentFile("File1");
      await myDocuments.createDocumentFile("File2");
      await myDocuments.createDocumentFile("File3");
    });

    await test.step("Bulk delete File1 and File2", async () => {
      await myDocuments.bulkDeleteFiles(["File1", "File2"]);
    });

    await test.step("Verify deleted files are in trash, File3 remains", async () => {
      await myDocuments.filesTable.checkRowExist("File3");
      await trash.open();
      await trash.trashTable.checkRowExist("File1");
      await trash.trashTable.checkRowExist("File2");
    });
  });

  test("Bulk move files to folder", async () => {
    const targetFolder = "TargetFolder";

    await test.step("Create files and target folder", async () => {
      await myDocuments.createDocumentFile("File1");
      await myDocuments.createDocumentFile("File2");
      await myDocuments.filesNavigation.openCreateDropdown();
      await myDocuments.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_FOLDER,
      );
      await myDocuments.filesNavigation.modal.fillCreateTextInput(targetFolder);
      await myDocuments.filesNavigation.modal.clickCreateButton();
      await myDocuments.filesTable.checkRowExist(targetFolder);
    });

    await test.step("Bulk move File1 and File2 to TargetFolder", async () => {
      await myDocuments.bulkMoveTo(["File1", "File2"], targetFolder);
    });

    await test.step("Verify files appear inside the folder", async () => {
      await myDocuments.filesTable.openContextMenuForItem(targetFolder);
      await myDocuments.filesTable.contextMenu.clickOption("Open");
      await myDocuments.filesTable.checkRowExist("File1");
      await myDocuments.filesTable.checkRowExist("File2");
    });
  });

  test("Bulk copy files to folder", async () => {
    const targetFolder = "TargetFolder";

    await test.step("Create files and target folder", async () => {
      await myDocuments.createDocumentFile("File1");
      await myDocuments.createDocumentFile("File2");
      await myDocuments.filesNavigation.openCreateDropdown();
      await myDocuments.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_FOLDER,
      );
      await myDocuments.filesNavigation.modal.fillCreateTextInput(targetFolder);
      await myDocuments.filesNavigation.modal.clickCreateButton();
      await myDocuments.filesTable.checkRowExist(targetFolder);
    });

    await test.step("Bulk copy File1 and File2 to TargetFolder", async () => {
      await myDocuments.bulkCopyTo(["File1", "File2"], targetFolder);
    });

    await test.step("Verify originals remain and copies exist in folder", async () => {
      await myDocuments.filesTable.checkRowExist("File1");
      await myDocuments.filesTable.checkRowExist("File2");
      await myDocuments.filesTable.openContextMenuForItem(targetFolder);
      await myDocuments.filesTable.contextMenu.clickOption("Open");
      await myDocuments.filesTable.checkRowExist("File1");
      await myDocuments.filesTable.checkRowExist("File2");
    });
  });

  test("Bulk download files as zip", async () => {
    await test.step("Create files", async () => {
      await myDocuments.createDocumentFile("File1");
      await myDocuments.createDocumentFile("File2");
    });

    await test.step("Bulk download File1 and File2", async () => {
      await myDocuments.bulkDownload(["File1", "File2"]);
    });
  });
});

import { test } from "@/src/fixtures";
import MyDocuments from "@/src/objects/files/MyDocuments";
import {
  legacyDocFile,
  legacyXlsFile,
  legacyPptFile,
} from "@/src/utils/constants/files";

/**
 * Legacy Office formats (.doc, .xls, .ppt) trigger an explicit conversion
 * dialog when uploaded via the UI. After the user confirms, DocSpace keeps
 * both the original file (shown with its extension, e.g. "file.doc") and
 * creates a converted OOXML copy (shown without extension, e.g. "file").
 *
 * These tests cover the full UI flow:
 *   upload → ConvertDialog confirm → both files visible → converted extension verified.
 */
test.describe("My Documents: legacy format auto-conversion on upload", () => {
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
    await myDocuments.open();
  });

  test("Upload .doc — conversion dialog shown, both .doc and .docx appear", async () => {
    await test.step("Upload .doc file via file picker", async () => {
      await myDocuments.filesNavigation.uploadFiles(legacyDocFile.path);
    });

    await test.step("Conversion dialog is shown", async () => {
      await myDocuments.convertDialog.checkDialogVisible();
    });

    await test.step("Confirm conversion", async () => {
      await myDocuments.convertDialog.confirm();
    });

    await test.step("Original .doc file is present in the table", async () => {
      await myDocuments.filesTable.checkRowExist(legacyDocFile.originalName);
    });

    await test.step("Converted file is present in the table", async () => {
      await myDocuments.filesTable.checkRowExist(legacyDocFile.name);
    });
  });

  test("Upload .xls — conversion dialog shown, both .xls and .xlsx appear", async () => {
    await test.step("Upload .xls file via file picker", async () => {
      await myDocuments.filesNavigation.uploadFiles(legacyXlsFile.path);
    });

    await test.step("Conversion dialog is shown", async () => {
      await myDocuments.convertDialog.checkDialogVisible();
    });

    await test.step("Confirm conversion", async () => {
      await myDocuments.convertDialog.confirm();
    });

    await test.step("Original .xls file is present in the table", async () => {
      await myDocuments.filesTable.checkRowExist(legacyXlsFile.originalName);
    });

    await test.step("Converted file is present in the table", async () => {
      await myDocuments.filesTable.checkRowExist(legacyXlsFile.name);
    });
  });

  test("Upload .ppt — conversion dialog shown, both .ppt and .pptx appear", async () => {
    await test.step("Upload .ppt file via file picker", async () => {
      await myDocuments.filesNavigation.uploadFiles(legacyPptFile.path);
    });

    await test.step("Conversion dialog is shown", async () => {
      await myDocuments.convertDialog.checkDialogVisible();
    });

    await test.step("Confirm conversion", async () => {
      await myDocuments.convertDialog.confirm();
    });

    await test.step("Original .ppt file is present in the table", async () => {
      await myDocuments.filesTable.checkRowExist(legacyPptFile.originalName);
    });

    await test.step("Converted file is present in the table", async () => {
      await myDocuments.filesTable.checkRowExist(legacyPptFile.name);
    });
  });
});

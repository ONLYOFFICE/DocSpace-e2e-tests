import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import MyDocuments from "@/src/objects/files/MyDocuments";
import {
  legacyDocFile,
  legacyXlsFile,
  legacyPptFile,
  legacyEpubFile,
  legacyOdtFile,
  legacyRtfFile,
  legacyOdsFile,
  legacyFb2File,
  legacyHtmlFile,
  legacyOttFile,
  legacyOtsFile,
  legacyOdpFile,
  legacyOtpFile,
} from "@/src/utils/constants/files";

/**
 * All formats that trigger the ConvertDialog on UI upload. After confirmation
 * DocSpace keeps both the original file and a converted OOXML copy. Both entries
 * share the same base name in the DOM (extension is CSS-only), so the table must
 * show exactly 2 rows with that name.
 *
 * doc/xls/ppt → docx/xlsx/pptx (legacy MS Office)
 * epub/odt/rtf/fb2/html/ott → docx (word-family auto-convert)
 * ods/ots/odp/otp → xlsx/xlsx/pptx/pptx (cell/slide auto-convert)
 */
test.describe("My Documents: legacy format auto-conversion on upload", () => {
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
    await myDocuments.open();
  });

  async function verifyConversionFlow(
    filePath: string,
    fileName: string,
    extLabel: string,
  ) {
    await test.step(`Upload ${extLabel} file via file picker`, async () => {
      await myDocuments.filesNavigation.uploadFiles(filePath);
    });

    await test.step("Conversion dialog is shown", async () => {
      await myDocuments.convertDialog.checkDialogVisible();
    });

    await test.step("Confirm conversion", async () => {
      await myDocuments.convertDialog.confirm();
    });

    await test.step("Both original and converted files appear in the table", async () => {
      await expect(
        await myDocuments.filesTable.getRowByTitle(fileName),
      ).toHaveCount(2);
    });
  }

  test("Upload .doc — conversion dialog shown, two rows appear", async () => {
    await verifyConversionFlow(legacyDocFile.path, legacyDocFile.name, ".doc");
  });

  test("Upload .xls — conversion dialog shown, two rows appear", async () => {
    await verifyConversionFlow(legacyXlsFile.path, legacyXlsFile.name, ".xls");
  });

  test("Upload .ppt — conversion dialog shown, two rows appear", async () => {
    await verifyConversionFlow(legacyPptFile.path, legacyPptFile.name, ".ppt");
  });

  test("Upload .epub — conversion dialog shown, two rows appear", async () => {
    await verifyConversionFlow(
      legacyEpubFile.path,
      legacyEpubFile.name,
      ".epub",
    );
  });

  test("Upload .odt — conversion dialog shown, two rows appear", async () => {
    await verifyConversionFlow(legacyOdtFile.path, legacyOdtFile.name, ".odt");
  });

  test("Upload .rtf — conversion dialog shown, two rows appear", async () => {
    await verifyConversionFlow(legacyRtfFile.path, legacyRtfFile.name, ".rtf");
  });

  test("Upload .ods — conversion dialog shown, two rows appear", async () => {
    await verifyConversionFlow(legacyOdsFile.path, legacyOdsFile.name, ".ods");
  });

  test("Upload .fb2 — conversion dialog shown, two rows appear", async () => {
    await verifyConversionFlow(legacyFb2File.path, legacyFb2File.name, ".fb2");
  });

  test("Upload .html — conversion dialog shown, two rows appear", async () => {
    await verifyConversionFlow(
      legacyHtmlFile.path,
      legacyHtmlFile.name,
      ".html",
    );
  });

  test("Upload .ott — conversion dialog shown, two rows appear", async () => {
    await verifyConversionFlow(legacyOttFile.path, legacyOttFile.name, ".ott");
  });

  test("Upload .ots — conversion dialog shown, two rows appear", async () => {
    await verifyConversionFlow(legacyOtsFile.path, legacyOtsFile.name, ".ots");
  });

  test("Upload .odp — conversion dialog shown, two rows appear", async () => {
    await verifyConversionFlow(legacyOdpFile.path, legacyOdpFile.name, ".odp");
  });

  test("Upload .otp — conversion dialog shown, two rows appear", async () => {
    await verifyConversionFlow(legacyOtpFile.path, legacyOtpFile.name, ".otp");
  });
});

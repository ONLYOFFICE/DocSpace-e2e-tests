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

test.describe("My Documents: legacy format auto-conversion on upload", () => {
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
    await myDocuments.open();
  });

  test("Upload .doc — conversion dialog shown, two rows appear", async () => {
    await myDocuments.uploadAndVerifyConversion(
      legacyDocFile.path,
      legacyDocFile.name,
    );
  });

  test("Upload .xls — conversion dialog shown, two rows appear", async () => {
    await myDocuments.uploadAndVerifyConversion(
      legacyXlsFile.path,
      legacyXlsFile.name,
    );
  });

  test("Upload .ppt — conversion dialog shown, two rows appear", async () => {
    await myDocuments.uploadAndVerifyConversion(
      legacyPptFile.path,
      legacyPptFile.name,
    );
  });

  test("Upload .epub — conversion dialog shown, two rows appear", async () => {
    await myDocuments.uploadAndVerifyConversion(
      legacyEpubFile.path,
      legacyEpubFile.name,
    );
  });

  test("Upload .odt — conversion dialog shown, two rows appear", async () => {
    await myDocuments.uploadAndVerifyConversion(
      legacyOdtFile.path,
      legacyOdtFile.name,
    );
  });

  test("Upload .rtf — conversion dialog shown, two rows appear", async () => {
    await myDocuments.uploadAndVerifyConversion(
      legacyRtfFile.path,
      legacyRtfFile.name,
    );
  });

  test("Upload .ods — conversion dialog shown, two rows appear", async () => {
    await myDocuments.uploadAndVerifyConversion(
      legacyOdsFile.path,
      legacyOdsFile.name,
    );
  });

  test("Upload .fb2 — conversion dialog shown, two rows appear", async () => {
    await myDocuments.uploadAndVerifyConversion(
      legacyFb2File.path,
      legacyFb2File.name,
    );
  });

  test("Upload .html — conversion dialog shown, two rows appear", async () => {
    await myDocuments.uploadAndVerifyConversion(
      legacyHtmlFile.path,
      legacyHtmlFile.name,
    );
  });

  test("Upload .ott — conversion dialog shown, two rows appear", async () => {
    await myDocuments.uploadAndVerifyConversion(
      legacyOttFile.path,
      legacyOttFile.name,
    );
  });

  test("Upload .ots — conversion dialog shown, two rows appear", async () => {
    await myDocuments.uploadAndVerifyConversion(
      legacyOtsFile.path,
      legacyOtsFile.name,
    );
  });

  test("Upload .odp — conversion dialog shown, two rows appear", async () => {
    await myDocuments.uploadAndVerifyConversion(
      legacyOdpFile.path,
      legacyOdpFile.name,
    );
  });

  test("Upload .otp — conversion dialog shown, two rows appear", async () => {
    await myDocuments.uploadAndVerifyConversion(
      legacyOtpFile.path,
      legacyOtpFile.name,
    );
  });
});

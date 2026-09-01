import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
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
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
    await files.open();
  });

  test("Upload .doc — conversion dialog shown, two rows appear", async () => {
    await files.uploadAndVerifyConversion(
      legacyDocFile.path,
      legacyDocFile.name,
    );
  });

  test("Upload .xls — conversion dialog shown, two rows appear", async () => {
    await files.uploadAndVerifyConversion(
      legacyXlsFile.path,
      legacyXlsFile.name,
    );
  });

  test("Upload .ppt — conversion dialog shown, two rows appear", async () => {
    await files.uploadAndVerifyConversion(
      legacyPptFile.path,
      legacyPptFile.name,
    );
  });

  test("Upload .epub — conversion dialog shown, two rows appear", async () => {
    await files.uploadAndVerifyConversion(
      legacyEpubFile.path,
      legacyEpubFile.name,
    );
  });

  test("Upload .odt — conversion dialog shown, two rows appear", async () => {
    await files.uploadAndVerifyConversion(
      legacyOdtFile.path,
      legacyOdtFile.name,
    );
  });

  test("Upload .rtf — conversion dialog shown, two rows appear", async () => {
    await files.uploadAndVerifyConversion(
      legacyRtfFile.path,
      legacyRtfFile.name,
    );
  });

  test("Upload .ods — conversion dialog shown, two rows appear", async () => {
    await files.uploadAndVerifyConversion(
      legacyOdsFile.path,
      legacyOdsFile.name,
    );
  });

  test("Upload .fb2 — conversion dialog shown, two rows appear", async () => {
    await files.uploadAndVerifyConversion(
      legacyFb2File.path,
      legacyFb2File.name,
    );
  });

  test("Upload .html — conversion dialog shown, two rows appear", async () => {
    await files.uploadAndVerifyConversion(
      legacyHtmlFile.path,
      legacyHtmlFile.name,
    );
  });

  test("Upload .ott — conversion dialog shown, two rows appear", async () => {
    await files.uploadAndVerifyConversion(
      legacyOttFile.path,
      legacyOttFile.name,
    );
  });

  test("Upload .ots — conversion dialog shown, two rows appear", async () => {
    await files.uploadAndVerifyConversion(
      legacyOtsFile.path,
      legacyOtsFile.name,
    );
  });

  test("Upload .odp — conversion dialog shown, two rows appear", async () => {
    await files.uploadAndVerifyConversion(
      legacyOdpFile.path,
      legacyOdpFile.name,
    );
  });

  test("Upload .otp — conversion dialog shown, two rows appear", async () => {
    await files.uploadAndVerifyConversion(
      legacyOtpFile.path,
      legacyOtpFile.name,
    );
  });
});

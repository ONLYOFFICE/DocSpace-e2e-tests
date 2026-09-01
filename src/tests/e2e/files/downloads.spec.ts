import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import { DOCUMENT_DOWNLOAD_FORMATS } from "@/src/constants/downloadFormats";

test.describe("My documents: Downloads", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);

    await login.loginToPortal();
    await files.open();

    await files.deleteAllDocs();
    await files.createFiles();
  });

  test("Download files and folder in original formats", async () => {
    await test.step("Download Document in original format (.docx)", async () => {
      await files.downloadOriginalFile("Document", ".docx");
    });

    await test.step("Download Spreadsheet in original format (.xlsx)", async () => {
      await files.downloadOriginalFile("Spreadsheet", ".xlsx");
    });

    await test.step("Download Presentation in original format (.pptx)", async () => {
      await files.downloadOriginalFile("Presentation", ".pptx");
    });

    await test.step("Download Blank in original format (.pdf)", async () => {
      await files.downloadOriginalFile("Blank", ".pdf");
    });

    await test.step("Download folder as archive", async () => {
      await files.downloadFolderAsArchive("Folder");
    });
  });

  test("Download files in conversion formats", async () => {
    const formats = DOCUMENT_DOWNLOAD_FORMATS;

    await test.step("Download Document as .bmp", async () => {
      await files.downloadFileAs(formats.BMP, "Document", ".zip");
    });

    await test.step("Download Document as .docm", async () => {
      await files.downloadFileAs(formats.DOCM, "Document");
    });

    await test.step("Download Document as .dotm", async () => {
      await files.downloadFileAs(formats.DOTM, "Document");
    });

    await test.step("Download Document as .dotx", async () => {
      await files.downloadFileAs(formats.DOTX, "Document");
    });

    await test.step("Download Document as .epub", async () => {
      await files.downloadFileAs(formats.EPUB, "Document");
    });

    await test.step("Download Document as .fb2", async () => {
      await files.downloadFileAs(formats.FB2, "Document");
    });

    await test.step("Download Document as .gif", async () => {
      await files.downloadFileAs(formats.GIF, "Document", ".zip");
    });

    await test.step("Download Document as .html", async () => {
      await files.downloadFileAs(formats.HTML, "Document");
    });

    await test.step("Download Document as .jpg", async () => {
      await files.downloadFileAs(formats.JPG, "Document", ".zip");
    });

    await test.step("Download Document as .md", async () => {
      await files.downloadFileAs(formats.MD, "Document");
    });

    await test.step("Download Document as .odt", async () => {
      await files.downloadFileAs(formats.ODT, "Document");
    });

    await test.step("Download Document as .ott", async () => {
      await files.downloadFileAs(formats.OTT, "Document");
    });

    await test.step("Download Document as .pdf", async () => {
      await files.downloadFileAs(formats.PDF, "Document");
    });

    await test.step("Download Document as .pdfa", async () => {
      await files.downloadFileAs(formats.PDFA, "Document");
    });

    await test.step("Download Document as .png", async () => {
      await files.downloadFileAs(formats.PNG, "Document", ".zip");
    });

    await test.step("Download Document as .rtf", async () => {
      await files.downloadFileAs(formats.RTF, "Document");
    });

    await test.step("Download Document as .txt", async () => {
      await files.downloadFileAs(formats.TXT, "Document");
    });

    await test.step("Download Spreadsheet as .csv", async () => {
      await files.downloadFileAs(formats.CSV, "Spreadsheet");
    });

    await test.step("Download Spreadsheet as .ods", async () => {
      await files.downloadFileAs(formats.ODS, "Spreadsheet");
    });

    await test.step("Download Spreadsheet as .ots", async () => {
      await files.downloadFileAs(formats.OTS, "Spreadsheet");
    });

    await test.step("Download Spreadsheet as .tsv", async () => {
      await files.downloadFileAs(formats.TSV, "Spreadsheet");
    });

    await test.step("Download Spreadsheet as .xlsm", async () => {
      await files.downloadFileAs(formats.XLSM, "Spreadsheet");
    });

    await test.step("Download Spreadsheet as .xltm", async () => {
      await files.downloadFileAs(formats.XLTM, "Spreadsheet");
    });

    await test.step("Download Spreadsheet as .xltx", async () => {
      await files.downloadFileAs(formats.XLTX, "Spreadsheet");
    });

    await test.step("Download Presentation as .odp", async () => {
      await files.downloadFileAs(formats.ODP, "Presentation");
    });

    await test.step("Download Presentation as .otp", async () => {
      await files.downloadFileAs(formats.OTP, "Presentation");
    });

    await test.step("Download Presentation as .potm", async () => {
      await files.downloadFileAs(formats.POTM, "Presentation");
    });

    await test.step("Download Presentation as .potx", async () => {
      await files.downloadFileAs(formats.POTX, "Presentation");
    });

    await test.step("Download Presentation as .ppsm", async () => {
      await files.downloadFileAs(formats.PPSM, "Presentation");
    });

    await test.step("Download Presentation as .ppsx", async () => {
      await files.downloadFileAs(formats.PPSX, "Presentation");
    });

    await test.step("Download Presentation as .pptm", async () => {
      await files.downloadFileAs(formats.PPTM, "Presentation");
    });

    await test.step("Download Presentation as .txt", async () => {
      await files.downloadFileAs(formats.TXT, "Presentation");
    });

    await test.step("Download Blank as .docx", async () => {
      await files.downloadFileAs(formats.DOCX, "Blank");
    });

    await test.step("Download Blank as .md", async () => {
      await files.downloadFileAs(formats.MD, "Blank");
    });
  });
});

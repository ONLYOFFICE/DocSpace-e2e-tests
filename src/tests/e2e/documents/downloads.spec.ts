import { test } from "@/src/fixtures";
import MyDocuments from "@/src/objects/files/MyDocuments";
import { DOCUMENT_DOWNLOAD_FORMATS } from "@/src/constants/downloadFormats";

test.describe("My documents: Downloads", () => {
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);

    await login.loginToPortal();
    await myDocuments.open();

    await myDocuments.deleteAllDocs();
    await myDocuments.filesArticle.createFiles();
  });

  test("Download files and folder in original formats", async () => {
    await test.step("Download Document in original format (.docx)", async () => {
      await myDocuments.downloadOriginalFile("Document", ".docx");
    });

    await test.step("Download Spreadsheet in original format (.xlsx)", async () => {
      await myDocuments.downloadOriginalFile("Spreadsheet", ".xlsx");
    });

    await test.step("Download Presentation in original format (.pptx)", async () => {
      await myDocuments.downloadOriginalFile("Presentation", ".pptx");
    });

    await test.step("Download Blank in original format (.pdf)", async () => {
      await myDocuments.downloadOriginalFile("Blank", ".pdf");
    });

    await test.step("Download folder as archive", async () => {
      await myDocuments.downloadFolderAsArchive("Folder");
    });
  });

  test("Download files in conversion formats", async () => {
    const formats = DOCUMENT_DOWNLOAD_FORMATS;

    await test.step("Download Document as .bmp", async () => {
      await myDocuments.downloadFileAs(formats.BMP, "Document", ".zip");
    });

    await test.step("Download Document as .docm", async () => {
      await myDocuments.downloadFileAs(formats.DOCM, "Document");
    });

    await test.step("Download Document as .dotm", async () => {
      await myDocuments.downloadFileAs(formats.DOTM, "Document");
    });

    await test.step("Download Document as .dotx", async () => {
      await myDocuments.downloadFileAs(formats.DOTX, "Document");
    });

    await test.step("Download Document as .epub", async () => {
      await myDocuments.downloadFileAs(formats.EPUB, "Document");
    });

    await test.step("Download Document as .fb2", async () => {
      await myDocuments.downloadFileAs(formats.FB2, "Document");
    });

    await test.step("Download Document as .gif", async () => {
      await myDocuments.downloadFileAs(formats.GIF, "Document", ".zip");
    });

    await test.step("Download Document as .html", async () => {
      await myDocuments.downloadFileAs(formats.HTML, "Document");
    });

    await test.step("Download Document as .jpg", async () => {
      await myDocuments.downloadFileAs(formats.JPG, "Document", ".zip");
    });

    await test.step("Download Document as .md", async () => {
      await myDocuments.downloadFileAs(formats.MD, "Document");
    });

    await test.step("Download Document as .odt", async () => {
      await myDocuments.downloadFileAs(formats.ODT, "Document");
    });

    await test.step("Download Document as .ott", async () => {
      await myDocuments.downloadFileAs(formats.OTT, "Document");
    });

    await test.step("Download Document as .pdf", async () => {
      await myDocuments.downloadFileAs(formats.PDF, "Document");
    });

    await test.step("Download Document as .pdfa", async () => {
      await myDocuments.downloadFileAs(formats.PDFA, "Document");
    });

    await test.step("Download Document as .png", async () => {
      await myDocuments.downloadFileAs(formats.PNG, "Document", ".zip");
    });

    await test.step("Download Document as .rtf", async () => {
      await myDocuments.downloadFileAs(formats.RTF, "Document");
    });

    await test.step("Download Document as .txt", async () => {
      await myDocuments.downloadFileAs(formats.TXT, "Document");
    });

    await test.step("Download Spreadsheet as .csv", async () => {
      await myDocuments.downloadFileAs(formats.CSV, "Spreadsheet");
    });

    await test.step("Download Spreadsheet as .ods", async () => {
      await myDocuments.downloadFileAs(formats.ODS, "Spreadsheet");
    });

    await test.step("Download Spreadsheet as .ots", async () => {
      await myDocuments.downloadFileAs(formats.OTS, "Spreadsheet");
    });

    await test.step("Download Spreadsheet as .tsv", async () => {
      await myDocuments.downloadFileAs(formats.TSV, "Spreadsheet");
    });

    await test.step("Download Spreadsheet as .xlsm", async () => {
      await myDocuments.downloadFileAs(formats.XLSM, "Spreadsheet");
    });

    await test.step("Download Spreadsheet as .xltm", async () => {
      await myDocuments.downloadFileAs(formats.XLTM, "Spreadsheet");
    });

    await test.step("Download Spreadsheet as .xltx", async () => {
      await myDocuments.downloadFileAs(formats.XLTX, "Spreadsheet");
    });

    await test.step("Download Presentation as .odp", async () => {
      await myDocuments.downloadFileAs(formats.ODP, "Presentation");
    });

    await test.step("Download Presentation as .otp", async () => {
      await myDocuments.downloadFileAs(formats.OTP, "Presentation");
    });

    await test.step("Download Presentation as .potm", async () => {
      await myDocuments.downloadFileAs(formats.POTM, "Presentation");
    });

    await test.step("Download Presentation as .potx", async () => {
      await myDocuments.downloadFileAs(formats.POTX, "Presentation");
    });

    await test.step("Download Presentation as .ppsm", async () => {
      await myDocuments.downloadFileAs(formats.PPSM, "Presentation");
    });

    await test.step("Download Presentation as .ppsx", async () => {
      await myDocuments.downloadFileAs(formats.PPSX, "Presentation");
    });

    await test.step("Download Presentation as .pptm", async () => {
      await myDocuments.downloadFileAs(formats.PPTM, "Presentation");
    });

    await test.step("Download Presentation as .txt", async () => {
      await myDocuments.downloadFileAs(formats.TXT, "Presentation");
    });

    await test.step("Download Blank as .docx", async () => {
      await myDocuments.downloadFileAs(formats.DOCX, "Blank");
    });

    await test.step("Download Blank as .md", async () => {
      await myDocuments.downloadFileAs(formats.MD, "Blank");
    });
  });
});

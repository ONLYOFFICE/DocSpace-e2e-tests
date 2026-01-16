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
    // Document gets exhaustive coverage across all conversion formats.
    await test.step("Download Document as Original format", async () => {
      await myDocuments.downloadFileAs(formats.ORIGINAL);
    });
    await test.step("Download Document as .bmp", async () => {
      // Image conversion downloads arrive as archived ZIP payloads.
      await myDocuments.downloadFileAs(formats.BMP, "Document", ".zip");
    });
    await test.step("Download Document as .docm", async () => {
      await myDocuments.downloadFileAs(formats.DOCM);
    });
    await test.step("Download Document as .dotm", async () => {
      await myDocuments.downloadFileAs(formats.DOTM);
    });
    await test.step("Download Document as .dotx", async () => {
      await myDocuments.downloadFileAs(formats.DOTX);
    });
    await test.step("Download Document as .epub", async () => {
      await myDocuments.downloadFileAs(formats.EPUB);
    });
    await test.step("Download Document as .fb2", async () => {
      await myDocuments.downloadFileAs(formats.FB2);
    });
    await test.step("Download Document as .gif", async () => {
      // Image conversion downloads arrive as archived ZIP payloads.
      await myDocuments.downloadFileAs(formats.GIF, "Document", ".zip");
    });
    await test.step("Download Document as .html", async () => {
      await myDocuments.downloadFileAs(formats.HTML);
    });
    await test.step("Download Document as .jpg", async () => {
      // Image conversion downloads arrive as archived ZIP payloads.
      await myDocuments.downloadFileAs(formats.JPG, "Document", ".zip");
    });
    await test.step("Download Document as .odt", async () => {
      await myDocuments.downloadFileAs(formats.ODT);
    });
    await test.step("Download Document as .ott", async () => {
      await myDocuments.downloadFileAs(formats.OTT);
    });
    await test.step("Download Document as .pdf", async () => {
      await myDocuments.downloadFileAs(formats.PDF);
    });
    await test.step("Download Document as .pdfa", async () => {
      await myDocuments.downloadFileAs(formats.PDFA);
    });
    await test.step("Download Document as .png", async () => {
      // Image conversion downloads arrive as archived ZIP payloads.
      await myDocuments.downloadFileAs(formats.PNG, "Document", ".zip");
    });
    await test.step("Download Document as .rtf", async () => {
      await myDocuments.downloadFileAs(formats.RTF);
    });
    await test.step("Download Document as .txt", async () => {
      await myDocuments.downloadFileAs(formats.TXT);
    });

    // Spreadsheet smoke coverage via PDF conversion.
    await test.step("Download Spreadsheet as .pdf", async () => {
      await myDocuments.downloadFileAs(formats.PDF, "Spreadsheet");
    });

    // Presentation smoke coverage via PDF conversion.
    await test.step("Download Presentation as .pdf", async () => {
      await myDocuments.downloadFileAs(formats.PDF, "Presentation");
    });

    // Blank is originally PDF, so convert it to DOCM for coverage.
    await test.step("Download Blank as .docm", async () => {
      await myDocuments.downloadFileAs(formats.DOCM, "Blank");
    });
  });
});

import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";

const DOCX_FILE = "data/documents/test-document.docx";
const DOCX_FILE_NAME = "test-document";
const UPLOAD_FOLDER = "data/documents/upload-folder";
const UPLOAD_FOLDER_NAME = "upload-folder";
const EMPTY_FOLDER_NAME = "empty-dnd-folder";

test.describe("My Documents: File upload", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
    await files.open();
  });

  test("Upload file via file picker", async () => {
    await test.step("Upload docx via Actions > Upload files", async () => {
      await files.filesNavigation.uploadFiles(DOCX_FILE);
    });

    await test.step("Verify uploaded file appears in the table", async () => {
      await files.filesTable.checkRowExist(DOCX_FILE_NAME);
    });
  });

  test("Upload file via drag & drop", async () => {
    await test.step("Drag and drop docx onto the section", async () => {
      await files.uploadFileByDragAndDrop(DOCX_FILE);
    });

    await test.step("Verify uploaded file appears in the table", async () => {
      await files.filesTable.checkRowExist(DOCX_FILE_NAME);
    });
  });

  test("Upload folder via file picker", async () => {
    await test.step("Upload folder via Actions > Upload folder", async () => {
      await files.filesNavigation.uploadFolder(UPLOAD_FOLDER);
    });

    await test.step("Verify folder appears in the table", async () => {
      await files.filesTable.checkRowExist(UPLOAD_FOLDER_NAME);
    });
  });

  test.skip("Upload empty folder via drag & drop", async () => {
    // Skipped: DocSpace has a known issue where the loader icon hangs after
    // dragging an empty folder — the upload-complete callback is never fired
    // because there are no files to upload. Tracked as a potential product bug.
    await test.step("Drag and drop empty folder onto the section", async () => {
      await files.uploadFolderByDragAndDrop(EMPTY_FOLDER_NAME);
    });

    await test.step("Verify empty folder appears in the table", async () => {
      await files.filesTable.checkRowExist(EMPTY_FOLDER_NAME);
    });
  });

  test("Upload folder with files via drag & drop", async () => {
    await test.step("Drag and drop folder with files onto the section", async () => {
      await files.uploadFolderWithFilesByDragAndDrop(UPLOAD_FOLDER);
    });

    await test.step("Verify folder appears in the table", async () => {
      await files.filesTable.checkRowExist(UPLOAD_FOLDER_NAME);
    });
  });

  test("Upload duplicate file shows conflict dialog", async ({ apiSdk }) => {
    await test.step("Pre-upload file via API", async () => {
      await apiSdk.files.uploadToMyDocuments("owner", DOCX_FILE);
      await files.open();
      await files.filesTable.checkRowExist(DOCX_FILE_NAME);
    });

    await test.step("Upload same file again via UI", async () => {
      await files.filesNavigation.uploadFiles(DOCX_FILE);
    });

    await test.step("Resolve conflict by creating a copy", async () => {
      await files.conflictResolveDialog.resolveWith("Create file copy");
    });

    await test.step("Both original and copy exist in the table", async () => {
      await files.filesTable.checkRowExist(DOCX_FILE_NAME);
      await files.filesTable.checkRowExist(`${DOCX_FILE_NAME} (1)`);
    });
  });
});

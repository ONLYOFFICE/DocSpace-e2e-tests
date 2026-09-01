import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import { plainTextFile } from "@/src/utils/constants/files";

// A word that appears in the fixture's CONTENT but NOT in its file name, so a
// match proves full-text (by content) search rather than a title match.
const CONTENT_WORD = "behaviour";

test.describe.skip("My Documents: full-text search by content", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
  });

  test("Finds a file by its content in My Documents", async ({ apiSdk }) => {
    await apiSdk.files.uploadToMyDocuments("owner", plainTextFile.path);

    await files.open();
    await files.filesFilter.fillFilesSearchInputAndCheckRequest(CONTENT_WORD);
    await files.filesTable.expectItemVisible(plainTextFile.name);
  });

  test("Finds a file by its content inside a subfolder", async ({ apiSdk }) => {
    const myDocsId = await apiSdk.folders.getMyDocumentsFolderId("owner");
    const folderBody = await (
      await apiSdk.folders.createFolder("owner", myDocsId, {
        title: "Search Content Folder",
      })
    ).json();
    await apiSdk.files.uploadToFolder(
      "owner",
      folderBody.response.id,
      plainTextFile.path,
    );

    await files.open();
    await files.filesFilter.fillFilesSearchInputAndCheckRequest(CONTENT_WORD);
    await files.filesTable.expectItemVisible(plainTextFile.name);
  });
});

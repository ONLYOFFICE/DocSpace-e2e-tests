import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import MyDocuments from "@/src/objects/files/MyDocuments";
import FileVersionHistory from "@/src/objects/files/FileVersionHistory";
import DocumentEditor from "@/src/objects/files/DocumentEditor";

const FILE_NAME = "VersionHistoryTest";

test.describe("My Documents: Version History", () => {
  let myDocuments: MyDocuments;
  let versionHistory: FileVersionHistory;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    versionHistory = new FileVersionHistory(page);
    await login.loginToPortal();
    await myDocuments.open();
  });

  test("Open version history and verify initial version", async () => {
    await myDocuments.createDocumentFile(FILE_NAME);
    await myDocuments.openVersionHistory(FILE_NAME);

    await versionHistory.checkFileNameVisible(FILE_NAME);
    await versionHistory.checkVersionsVisible();
    await versionHistory.checkVersionCount(1);
  });

  test("Create new version by editing in editor", async () => {
    const editor = await myDocuments.createDocumentAndOpenEditor(FILE_NAME);
    await editor.editAndClose(
      "This is a new version of the document with updated content for testing version history",
    );
    await myDocuments.open();
    await myDocuments.openVersionHistory(FILE_NAME);

    await versionHistory.checkVersionsVisible();
    await versionHistory.checkVersionCount(2);
  });

  test("Edit version comment", async () => {
    const commentText = "Updated via e2e test";
    await myDocuments.createDocumentFile(FILE_NAME);
    await myDocuments.openVersionHistory(FILE_NAME);

    await versionHistory.editComment(0, commentText);
    await versionHistory.checkComment(0, commentText);
  });

  test("Restore older version", async () => {
    const editor = await myDocuments.createDocumentAndOpenEditor(FILE_NAME);
    await editor.editAndClose(
      "This is a new version of the document with updated content for testing version history functionality",
    );
    await myDocuments.open();
    await myDocuments.openVersionHistory(FILE_NAME);

    const earliestIndex = await versionHistory.getEarliestVersionIndex();
    await versionHistory.restoreVersion(earliestIndex);
    await versionHistory.checkVersionCount(3);
  });

  test("Download version", async ({ page }) => {
    await myDocuments.createDocumentFile(FILE_NAME);
    await myDocuments.openVersionHistory(FILE_NAME);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      versionHistory.downloadVersion(0),
    ]);
    expect(download.suggestedFilename().toLowerCase()).toContain(".docx");
    await download.delete();
  });

  test("Open older version opens in view mode", async ({ page }) => {
    const editor = await myDocuments.createDocumentAndOpenEditor(FILE_NAME);
    await editor.editAndClose(
      "This is a new version of the document with updated content for testing version history",
    );
    await myDocuments.open();
    await myDocuments.openVersionHistory(FILE_NAME);

    const earliestIndex = await versionHistory.getEarliestVersionIndex();
    const [versionPage] = await Promise.all([
      page.context().waitForEvent("page"),
      versionHistory.clickVersionMenuOption(earliestIndex, "Open"),
    ]);
    const viewEditor = new DocumentEditor(versionPage);
    viewEditor.setupConsoleCapture();
    await viewEditor.waitForLoad();
    await viewEditor.checkViewMode();
    await viewEditor.close();
  });

  test("Delete older version", async () => {
    const editor = await myDocuments.createDocumentAndOpenEditor(FILE_NAME);
    await editor.editAndClose(
      "This is a new version of the document with updated content for testing version history functionality",
    );
    await myDocuments.open();
    await myDocuments.openVersionHistory(FILE_NAME);

    const earliestIndex = await versionHistory.getEarliestVersionIndex();
    await versionHistory.deleteVersion(earliestIndex);
    await versionHistory.checkVersionCount(1);
  });
});

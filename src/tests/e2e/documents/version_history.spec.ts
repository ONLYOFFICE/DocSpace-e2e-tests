import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import FileVersionHistory from "@/src/objects/files/FileVersionHistory";
import DocumentEditor from "@/src/objects/files/DocumentEditor";

const FILE_NAME = "VersionHistoryTest";

test.describe("My Documents: Version History", () => {
  let files: Files;
  let versionHistory: FileVersionHistory;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    versionHistory = new FileVersionHistory(page);
    await login.loginToPortal();
    await files.open();
  });

  test("Open version history and verify initial version", async () => {
    await files.createDocumentFile(FILE_NAME);
    await files.openVersionHistory(FILE_NAME);

    await versionHistory.checkFileNameVisible(FILE_NAME);
    await versionHistory.checkVersionsVisible();
    await versionHistory.checkVersionCount(1);
  });

  test("Create new version by editing in editor", async () => {
    const editor = await files.createDocumentAndOpenEditor(FILE_NAME);
    await editor.editAndClose(
      "This is a new version of the document with updated content for testing version history",
    );
    await files.open();
    await files.openVersionHistory(FILE_NAME);

    await versionHistory.checkVersionsVisible();
    await versionHistory.checkVersionCount(2);
  });

  test("Edit version comment", async () => {
    const commentText = "Updated via e2e test";
    await files.createDocumentFile(FILE_NAME);
    await files.openVersionHistory(FILE_NAME);

    await versionHistory.editComment(0, commentText);
    await versionHistory.checkComment(0, commentText);
  });

  test("Restore older version", async () => {
    const editor = await files.createDocumentAndOpenEditor(FILE_NAME);
    await editor.editAndClose(
      "This is a new version of the document with updated content for testing version history functionality",
    );
    await files.open();
    await files.openVersionHistory(FILE_NAME);

    const earliestIndex = await versionHistory.getEarliestVersionIndex();
    await versionHistory.restoreVersion(earliestIndex);
    await versionHistory.checkVersionCount(3);
  });

  test("Download version", async ({ page }) => {
    await files.createDocumentFile(FILE_NAME);
    await files.openVersionHistory(FILE_NAME);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      versionHistory.downloadVersion(0),
    ]);
    expect(download.suggestedFilename().toLowerCase()).toContain(".docx");
    await download.delete();
  });

  test("Open older version opens in view mode", async ({ page }) => {
    const editor = await files.createDocumentAndOpenEditor(FILE_NAME);
    await editor.editAndClose(
      "This is a new version of the document with updated content for testing version history",
    );
    await files.open();
    await files.openVersionHistory(FILE_NAME);

    const earliestIndex = await versionHistory.getEarliestVersionIndex();
    const [versionPage] = await Promise.all([
      page.context().waitForEvent("page"),
      versionHistory.clickVersionMenuOption(earliestIndex, "Open"),
    ]);
    await versionPage.waitForLoadState("load");
    await versionPage.reload(); // Bug 81446 — editor may not init if tab is inactive on load
    await versionPage.waitForLoadState("load");
    const viewEditor = new DocumentEditor(versionPage);
    viewEditor.setupConsoleCapture();
    await viewEditor.waitForLoad();
    await viewEditor.checkViewMode();
    await viewEditor.close();
  });

  test("Delete older version", async () => {
    const editor = await files.createDocumentAndOpenEditor(FILE_NAME);
    await editor.editAndClose(
      "This is a new version of the document with updated content for testing version history functionality",
    );
    await files.open();
    await files.openVersionHistory(FILE_NAME);

    const earliestIndex = await versionHistory.getEarliestVersionIndex();
    await versionHistory.deleteVersion(earliestIndex);
    await versionHistory.checkVersionCount(1);
  });
});

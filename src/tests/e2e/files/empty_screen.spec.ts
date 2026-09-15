import Files from "@/src/objects/files/Files";
import { test } from "@/src/fixtures";

test.describe("Files: empty view welcome screen", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
    await files.open();
    await files.deleteAllDocs();
  });

  test("Shows title, subtitle, all action items and the header AI Chat button", async () => {
    await test.step("Title and subtitle", async () => {
      await files.filesEmptyView.checkNoDocsTextExist();
      await files.filesEmptyView.checkEmptyViewSubtitleExist();
    });

    await test.step("Action items, including AI Chat", async () => {
      await files.filesEmptyView.checkEmptyViewItemsExist();
    });

    await test.step("Header AI Chat button is visible", async () => {
      await files.checkAiChatButtonVisible();
    });
  });
});

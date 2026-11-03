import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import FilesPlugins from "@/src/objects/files/FilesPlugins";
import {
  pluginFileActions,
  pluginTestFiles,
  systemPlugins,
} from "@/src/utils/constants/plugins";
import { setupPlugin } from "@/src/utils/helpers/plugins";

const BOOK = pluginTestFiles.book;
// The reader titles the dialog with the book's metadata title; the test EPUB
// has none
const DIALOG_TITLE = "Unknown Title";
// Text of the only section of data/documents/test-epub.epub
const BOOK_TEXT = "test document";

test.describe("Plugins: Book reader", () => {
  let files: Files;
  let filesPlugins: FilesPlugins;

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    files = new Files(page, api.portalDomain);
    filesPlugins = new FilesPlugins(page, files);

    await setupPlugin({
      page,
      api,
      apiSdk,
      login,
      plugin: systemPlugins.bookReader,
      files: [BOOK.path],
    });
    await files.open();
  });

  test("Book packed in a zip opens in the reader", async () => {
    await test.step("Open in Reader shows the book", async () => {
      await filesPlugins.runFileAction(
        BOOK.title,
        pluginFileActions.openInReader,
      );
      await filesPlugins.expectDialogOpened(DIALOG_TITLE);
      await filesPlugins.expectDialogText(DIALOG_TITLE, BOOK_TEXT);
    });
  });
});

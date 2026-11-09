import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import FilesPlugins from "@/src/objects/files/FilesPlugins";
import {
  pluginFileActions,
  pluginTestFiles,
  pluginToasts,
  systemPlugins,
} from "@/src/utils/constants/plugins";
import { setupPlugin } from "@/src/utils/helpers/plugins";

const ARCHIVE = pluginTestFiles.archive;
const DOCX = pluginTestFiles.docx;
const VIEWER_TITLE = "Archive viewer";
// Entries of data/filter/archive.zip
const ARCHIVE_ENTRIES = ["plugin.js", "config.json"];

test.describe("Plugins: ZIP archives", () => {
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
      plugin: systemPlugins.zipArchives,
      files: [ARCHIVE.path, DOCX.path],
    });
    await files.open();
  });

  test("Archive opens in the viewer and extracts, a file is packed into a new archive", async () => {
    await test.step("Clicking a .zip opens the archive viewer with its entries", async () => {
      await filesPlugins.openFileInPlugin(ARCHIVE.title, VIEWER_TITLE);
      for (const entry of ARCHIVE_ENTRIES) {
        await filesPlugins.expectDialogText(VIEWER_TITLE, entry);
      }
    });

    await test.step("Extract the archive creates a folder next to it", async () => {
      await filesPlugins.clickDialogButton(VIEWER_TITLE, "Extract the archive");
      await filesPlugins.expectFileCount(ARCHIVE.title, 2);
    });

    await test.step("Archive selected item packs a file into a new archive", async () => {
      await filesPlugins.runFileAction(DOCX.title, pluginFileActions.archive);
      await files.checkToastMessage(pluginToasts.zipSaved);
      await files.open();
      await filesPlugins.expectFileInList("New archive");
    });
  });
});

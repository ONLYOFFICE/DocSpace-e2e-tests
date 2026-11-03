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

const DOCX = pluginTestFiles.docx;

test.describe("Plugins: Convert to Markdown", () => {
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
      plugin: systemPlugins.convertToMarkdown,
      files: [DOCX.path],
    });
    await files.open();
  });

  test("DOCX is converted to a Markdown file next to it", async () => {
    await test.step("Convert to Markdown", async () => {
      await filesPlugins.runFileAction(
        DOCX.title,
        pluginFileActions.convertToMarkdown,
      );
      await files.checkToastMessage(pluginToasts.created(`${DOCX.title}.md`));
    });

    await test.step("The .md file appears next to the source", async () => {
      await filesPlugins.expectFileCount(DOCX.title, 2);
    });
  });
});

import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import FilesPlugins from "@/src/objects/files/FilesPlugins";
import {
  pluginCreateItems,
  pluginFileActions,
  pluginTestFiles,
  systemPlugins,
} from "@/src/utils/constants/plugins";
import { setupPlugin } from "@/src/utils/helpers/plugins";

const MD_FILE = pluginTestFiles.markdown;
const DIALOG_TITLE = "markdown.md";
const NEW_FILE = "Plugin notes";

test.describe("Plugins: Markdown", () => {
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
      plugin: systemPlugins.markdown,
      files: [MD_FILE.path],
    });
    await files.open();
  });

  test("Markdown file opens in the plugin editor, preview renders it and New > More creates a new one", async () => {
    await test.step("Clicking a .md file opens it in the plugin editor", async () => {
      await filesPlugins.openFileInPlugin(MD_FILE.title, DIALOG_TITLE);
      await filesPlugins.expectDialogText(DIALOG_TITLE, "**markdown**");
      await filesPlugins.closeDialog(DIALOG_TITLE);
    });

    await test.step("Preview markdown renders the file", async () => {
      await filesPlugins.runFileAction(
        MD_FILE.title,
        pluginFileActions.previewMarkdown,
      );
      await filesPlugins.expectDialogText(DIALOG_TITLE, "Plugin test");
      await filesPlugins.closeDialog(DIALOG_TITLE);
    });

    await test.step("New > More > Markdown creates a markdown file", async () => {
      await filesPlugins.createFromMoreMenu(pluginCreateItems.markdown);
      await filesPlugins.fillCreateDialog("Create markdown", NEW_FILE);
      await files.open();
      await filesPlugins.expectFileInList(NEW_FILE);
    });
  });
});

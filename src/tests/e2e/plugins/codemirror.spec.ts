import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import FilesPlugins from "@/src/objects/files/FilesPlugins";
import {
  pluginCreateItems,
  pluginFileActions,
  pluginTestFiles,
  pluginToasts,
  systemPlugins,
} from "@/src/utils/constants/plugins";
import { setupPlugin } from "@/src/utils/helpers/plugins";

const JS_FILE = pluginTestFiles.script;
const DIALOG_TITLE = "script.js";
const NEW_FILE = "Plugin text file";
// The name must carry an extension CodeMirror edits ("File extension must be
// provided"); .txt is refused as "not supported by Codemirror plugin"
const NEW_FILE_NAME = `${NEW_FILE}.js`;

test.describe("Plugins: CodeMirror", () => {
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
      plugin: systemPlugins.codemirror,
      files: [JS_FILE.path],
    });
    await files.open();
  });

  test("Code file opens and saves in CodeMirror, New > More creates a text file", async () => {
    await test.step("Edit file with Codemirror shows the code", async () => {
      await filesPlugins.runFileAction(
        JS_FILE.title,
        pluginFileActions.editWithCodemirror,
      );
      await filesPlugins.expectDialogOpened(DIALOG_TITLE);
      await filesPlugins.expectDialogText(DIALOG_TITLE, "plugin test");
    });

    await test.step("Save writes the file", async () => {
      await filesPlugins.clickDialogButton(DIALOG_TITLE, "Save");
      await files.checkToastMessage(pluginToasts.fileSaved);
    });

    await test.step("New > More > Text file creates a text file", async () => {
      await files.open();
      await filesPlugins.createFromMoreMenu(pluginCreateItems.textFile);
      await filesPlugins.fillCreateDialog("Create text file", NEW_FILE_NAME);
      await files.open();
      await filesPlugins.expectFileInList(NEW_FILE);
    });
  });
});

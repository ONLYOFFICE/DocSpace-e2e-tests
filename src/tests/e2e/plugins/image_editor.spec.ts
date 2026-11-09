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

const IMAGE = pluginTestFiles.image;
const DIALOG_TITLE = "image.png";

test.describe("Plugins: Image editor", () => {
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
      plugin: systemPlugins.imageEditor,
      files: [IMAGE.path],
    });
    await files.open();
  });

  test("Image opens in the editor and is saved", async () => {
    await test.step("Edit image opens the editor with the picture", async () => {
      await filesPlugins.runFileAction(
        IMAGE.title,
        pluginFileActions.editImage,
      );
      await filesPlugins.expectDialogOpened(DIALOG_TITLE);
      await filesPlugins.expectDialogImage(DIALOG_TITLE);
    });

    await test.step("Save and exit saves the image", async () => {
      await filesPlugins.clickDialogButton(DIALOG_TITLE, "Save and exit");
      await files.checkToastMessage(pluginToasts.imageSaved);
    });
  });
});

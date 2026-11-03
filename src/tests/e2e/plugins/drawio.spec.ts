import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import FilesPlugins from "@/src/objects/files/FilesPlugins";
import {
  pluginCreateItems,
  systemPlugins,
} from "@/src/utils/constants/plugins";
import { setupPlugin } from "@/src/utils/helpers/plugins";

const NEW_DIAGRAM = "Plugin diagram";
const EDITOR_URL = /embed\.diagrams\.net/;

test.describe("Plugins: draw.io", () => {
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
      plugin: systemPlugins.drawIo,
    });
    await files.open();
  });

  test("New > More > draw.io creates a diagram and opens the draw.io editor", async () => {
    await test.step("Create a diagram", async () => {
      await filesPlugins.createFromMoreMenu(pluginCreateItems.drawIo);
      await filesPlugins.fillCreateDialog("Create diagram", NEW_DIAGRAM);
    });

    await test.step("The draw.io editor opens", async () => {
      await filesPlugins.expectFrameOpened(EDITOR_URL);
    });

    await test.step("The diagram file is in My Documents", async () => {
      await files.open();
      await filesPlugins.expectFileInList(NEW_DIAGRAM);
    });
  });
});

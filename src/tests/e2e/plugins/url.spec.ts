import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import FilesPlugins from "@/src/objects/files/FilesPlugins";
import {
  pluginCreateItems,
  systemPlugins,
} from "@/src/utils/constants/plugins";
import { setupPlugin } from "@/src/utils/helpers/plugins";

const LINK_URL = "https://www.onlyoffice.com";
const LINK_TITLE = "ONLYOFFICE site";

test.describe("Plugins: URL", () => {
  let files: Files;
  let filesPlugins: FilesPlugins;

  test.beforeEach(async ({ page, api, apiSdk, login }) => {
    files = new Files(page, api.portalDomain);
    filesPlugins = new FilesPlugins(page, files);

    await setupPlugin({ page, api, apiSdk, login, plugin: systemPlugins.url });
    await files.open();
  });

  test("New > More > New URL creates a link file", async () => {
    await test.step("Create a link", async () => {
      await filesPlugins.createFromMoreMenu(pluginCreateItems.url);
      await filesPlugins.createUrlFile(LINK_URL, LINK_TITLE);
    });

    await test.step("The link file is in My Documents", async () => {
      await files.open();
      await filesPlugins.expectFileInList(LINK_TITLE);
    });
  });
});

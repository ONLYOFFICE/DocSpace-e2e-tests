import { test } from "@/src/fixtures";
import config from "@/config";
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
const DIALOG_TITLE = "Convert file to PDF";

test.describe("Plugins: PDF converter", () => {
  test.skip(!config.PDF_CONVERTER_KEY, "PDF_CONVERTER_KEY is not set");

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
      plugin: systemPlugins.pdfConverter,
      files: [DOCX.path],
      // The converter calls an external service with this API key
      configure: async (plugins) => {
        await plugins.openPdfConverterSettings();
        await plugins.fillPdfConverterToken();
        await plugins.closePluginSettings();
      },
    });
    await files.open();
  });

  // Skipped: the PDF_CONVERTER_KEY in .env is rejected by convertapi.com
  // (403, "Wrong API token" toast). Remove .skip once the key is renewed.
  test.skip("DOCX is converted to a PDF next to it", async () => {
    await test.step("Convert to PDF", async () => {
      await filesPlugins.runFileAction(
        DOCX.title,
        pluginFileActions.convertToPdf,
      );
      await filesPlugins.expectDialogOpened(DIALOG_TITLE);
      await filesPlugins.clickDialogButton(DIALOG_TITLE, "Convert file");
    });

    await test.step("The PDF appears next to the source", async () => {
      await filesPlugins.expectFileCount(DOCX.title, 2, {
        timeout: 120000,
        failOnToast: pluginToasts.wrongApiToken,
      });
    });
  });
});

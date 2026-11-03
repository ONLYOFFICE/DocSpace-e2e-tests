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

const SPEECH = pluginTestFiles.speech;

test.describe("Plugins: Speech to text", () => {
  test.skip(!config.SPEECH_TO_TEXT_KEY, "SPEECH_TO_TEXT_KEY is not set");

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
      plugin: systemPlugins.speechToText,
      files: [SPEECH.path],
      // Recognition runs on an external service with this API key
      configure: async (plugins) => {
        await plugins.openSpeechToTextSettings();
        await plugins.fillSpeechToTextToken();
        await plugins.closePluginSettings();
      },
    });
    await files.open();
  });

  test("Audio is transcribed into a text file next to it", async () => {
    await test.step("Convert to text", async () => {
      await filesPlugins.runFileAction(
        SPEECH.title,
        pluginFileActions.convertToText,
      );
      await files.checkToastMessage(pluginToasts.convertedToText, 180000);
    });

    await test.step("The transcript appears next to the audio", async () => {
      await filesPlugins.expectFileCount(SPEECH.title, 2);
    });
  });
});

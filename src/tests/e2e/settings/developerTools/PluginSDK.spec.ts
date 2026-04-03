import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import PluginSDK from "@/src/objects/settings/developerTools/PluginSDK";

test.describe("Plugin SDK tests", () => {
  let pluginSDK: PluginSDK;

  test.beforeEach(async ({ page, login }) => {
    pluginSDK = new PluginSDK(page);

    await login.loginToPortal();
    await pluginSDK.open();
  });

  test("Read Instructions and plugin repository links", async ({ page }) => {
    await pluginSDK.checkPluginsLoaded();

    // Read Instructions
    const instructionsPromise = page.waitForEvent("popup", { timeout: 30000 });
    await pluginSDK.readInstructionsButton.click();
    const instructionsPage = await instructionsPromise;
    await expect(instructionsPage).toHaveURL(/plugins-sdk/);
    await instructionsPage.close();

    // zip-archives
    const zipPromise = page.waitForEvent("popup", { timeout: 30000 });
    await pluginSDK.zipArchivesRepoButton.click();
    const zipPage = await zipPromise;
    await expect(zipPage).toHaveURL(/docspace-plugins.*archives/);
    await zipPage.close();

    // speech-to-text
    const speechPromise = page.waitForEvent("popup", { timeout: 30000 });
    await pluginSDK.speechToTextRepoButton.click();
    const speechPage = await speechPromise;
    await expect(speechPage).toHaveURL(/docspace-plugins.*speech-to-text/);
    await speechPage.close();

    // pdf-converter
    const pdfPromise = page.waitForEvent("popup", { timeout: 30000 });
    await pluginSDK.pdfConverterRepoButton.click();
    const pdfPage = await pdfPromise;
    await expect(pdfPage).toHaveURL(/docspace-plugins.*pdf-converter/);
    await pdfPage.close();

    // markdown
    const markdownPromise = page.waitForEvent("popup", { timeout: 30000 });
    await pluginSDK.markdownRepoButton.click();
    const markdownPage = await markdownPromise;
    await expect(markdownPage).toHaveURL(/docspace-plugins.*markdown/);
    await markdownPage.close();

    // image-editor
    const imagePromise = page.waitForEvent("popup", { timeout: 30000 });
    await pluginSDK.imageEditorRepoButton.click();
    const imagePage = await imagePromise;
    await expect(imagePage).toHaveURL(/docspace-plugins.*image-editor/);
    await imagePage.close();

    // draw.io
    const drawIoPromise = page.waitForEvent("popup", { timeout: 30000 });
    await pluginSDK.drawIoRepoButton.click();
    const drawIoPage = await drawIoPromise;
    await expect(drawIoPage).toHaveURL(/docspace-plugins.*draw/);
    await drawIoPage.close();

    // codemirror
    const codemirrorPromise = page.waitForEvent("popup", { timeout: 30000 });
    await pluginSDK.codemirrorRepoButton.click();
    const codemirrorPage = await codemirrorPromise;
    await expect(codemirrorPage).toHaveURL(/docspace-plugins.*codemirror/);
    await codemirrorPage.close();
  });
});

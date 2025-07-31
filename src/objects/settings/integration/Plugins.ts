import { Page, Locator } from "@playwright/test";
import BasePage from "../../common/BasePage";
import config from "@/config";
import Screenshot from "../../common/Screenshot";
import { toastMessages } from "@/src/utils/constants/settings";

export class Plugins extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get forwardToPlugins(): Locator {
    return this.page.getByText("Plugins");
  }

  get navigateToIntegration(): Locator {
    return this.page.getByRole("link", {
      name: "Integration",
    });
  }

  get markdownArea(): Locator {
    return this.page.getByText("markdown 1.1.0DocSpace plugin");
  }

  get markdownSettingsButton(): Locator {
    return this.markdownArea
      .locator(".plugin-controls .icon-button_svg")
      .first();
  }

  get markdownEnableSwitch(): Locator {
    return this.markdownArea.locator("circle");
  }

  get drawIoArea(): Locator {
    return this.page.getByText("draw.io 1.1.0A tool for");
  }

  get drawIoSettingsButton(): Locator {
    return this.drawIoArea.locator(".plugin-controls .icon-button_svg").first();
  }

  get drawIoEnableSwitch(): Locator {
    return this.drawIoArea.locator("circle");
  }

  get speechToTextArea(): Locator {
    return this.page.getByText("speech-to-text 1.0.2Speech to");
  }

  get speechToTextSettingsButton(): Locator {
    return this.speechToTextArea
      .locator(".plugin-controls .icon-button_svg")
      .first();
  }

  get speechToTextEnableSwitch(): Locator {
    return this.speechToTextArea.locator("circle");
  }

  get pdfConverterArea(): Locator {
    return this.page.getByText("pdf-converter 1.0.2A plugin");
  }

  get pdfConverterSettingsButton(): Locator {
    return this.pdfConverterArea
      .locator(".plugin-controls .icon-button_svg")
      .first();
  }

  get pdfConverterEnableSwitch(): Locator {
    return this.pdfConverterArea.locator("circle");
  }
  get guideLink(): Locator {
    return this.page.getByTestId("link");
  }

  get languageCombobox(): Locator {
    return this.page.getByTestId("combobox").locator("div").first();
  }

  get selectLanguage(): Locator {
    return this.page.locator("div").filter({ hasText: /^English$/ });
  }

  get offlineModeSwitch(): Locator {
    return this.page.locator("#modal-scroll circle").first();
  }

  get librariesSwitch(): Locator {
    return this.page.locator("#modal-scroll circle").nth(1);
  }

  get saveButton(): Locator {
    return this.page.getByRole("button", { name: "Save" });
  }

  get textInput(): Locator {
    return this.page.getByTestId("text-input");
  }

  get pluginLogo(): Locator {
    return this.page.locator(".plugin-logo");
  }

  get pluginInfo(): Locator {
    return this.page.locator(".plugin-info");
  }

  async getMaskPluginLocators() {
    return Promise.all([
      ...(await this.pluginLogo.all()),
      ...(await this.pluginInfo.all()),
    ]);
  }

  async closePluginSettings() {
    await this.page.mouse.click(1, 1);
  }

  async enableMarkdown() {
    await this.markdownArea.click();
    await this.markdownEnableSwitch.click();
    await this.removeToast(toastMessages.pluginEnabled);
  }
  async enableDrawIo() {
    await this.drawIoArea.click();
    await this.drawIoEnableSwitch.click();
    await this.removeToast(toastMessages.pluginEnabled);
  }

  async openMarkdownSettings(screenshot?: Screenshot) {
    await this.markdownArea.click();
    await this.markdownSettingsButton.click();

    const maskPluginLocators = await this.getMaskPluginLocators();
    await screenshot?.expectHaveScreenshot("markdown_settings", true, {
      mask: maskPluginLocators,
    });
  }
  async enableSpeechToText() {
    await this.speechToTextArea.click();
    await this.speechToTextEnableSwitch.click();
    await this.removeToast(toastMessages.pluginEnabled);
  }

  async enablePdfConverter() {
    await this.pdfConverterArea.click();
    await this.pdfConverterEnableSwitch.click();
    await this.removeToast(toastMessages.pluginEnabled);
  }

  async disableMarkdown() {
    await this.markdownArea.click();
    await this.markdownEnableSwitch.click();
    await this.removeToast(toastMessages.pluginDisabled);
  }

  async disableDrawIo() {
    await this.drawIoArea.click();
    await this.drawIoEnableSwitch.click();
    await this.removeToast(toastMessages.pluginDisabled);
  }

  async disableSpeechToText() {
    await this.speechToTextArea.click();
    await this.speechToTextEnableSwitch.click();
    await this.removeToast(toastMessages.pluginDisabled);
  }

  async disablePdfConverter() {
    await this.pdfConverterArea.click();
    await this.pdfConverterEnableSwitch.click();
    await this.removeToast(toastMessages.pluginDisabled);
  }

  async openDrawIoSettings(screenshot?: Screenshot) {
    await this.drawIoArea.click();
    await this.drawIoSettingsButton.click();

    const maskPluginLocators = await this.getMaskPluginLocators();
    await screenshot?.expectHaveScreenshot("draw_io_settings", true, {
      mask: maskPluginLocators,
    });
  }

  async openSpeechToTextSettings(screenshot?: Screenshot) {
    await this.speechToTextArea.click();
    await this.speechToTextSettingsButton.click();

    const maskPluginLocators = await this.getMaskPluginLocators();
    await screenshot?.expectHaveScreenshot("speech_to_text_settings", true, {
      mask: maskPluginLocators,
    });
  }

  async openPdfConverterSettings(screenshot?: Screenshot) {
    await this.pdfConverterArea.click();
    await this.pdfConverterSettingsButton.click();

    const maskPluginLocators = await this.getMaskPluginLocators();
    await screenshot?.expectHaveScreenshot("pdf_converter_settings", true, {
      mask: maskPluginLocators,
    });
  }

  async guidePopup() {
    const page1 = this.page.waitForEvent("popup");
    await this.guideLink.click();
    return page1;
  }

  async changeDrawIoSettings(screenshot?: Screenshot) {
    const maskPluginLocators = await this.getMaskPluginLocators();
    await this.languageCombobox.click();
    await screenshot?.expectHaveScreenshot(
      "draw_io_settings_language_dropdown",
      true,
      {
        mask: maskPluginLocators,
      },
    );
    await this.selectLanguage.click();
    await this.offlineModeSwitch.click();
    await this.librariesSwitch.click();
    await this.saveButton.click();
  }

  async fillSpeechToTextToken() {
    if (!config.SPEECH_TO_TEXT_KEY) {
      throw new Error("Speech to text key is not defined");
    }

    await this.textInput.fill(config.SPEECH_TO_TEXT_KEY);
    await this.saveButton.click();
    await this.removeToast(toastMessages.tokenSaved);
  }

  async fillPdfConverterToken() {
    if (!config.PDF_CONVERTER_KEY) {
      throw new Error("Pdf converter key is not defined");
    }

    await this.textInput.fill(config.PDF_CONVERTER_KEY);
    await this.saveButton.click();
    await this.removeToast(toastMessages.tokenSaved);
  }
}

import { Page, Locator } from "@playwright/test";
import BasePage from "../../common/BasePage";
import config from "@/config";
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
    return this.page.getByTestId("plugin_markdown");
  }

  get markdownSettingsButton(): Locator {
    return this.markdownArea
      .locator('[data-testid="open_settings_icon_button"]')
      .first();
  }

  get markdownEnableSwitch(): Locator {
    return this.markdownArea.locator(
      '[data-testid="enable_plugin_toggle_button"]',
    );
  }

  get drawIoArea(): Locator {
    return this.page.getByTestId("plugin_draw.io");
  }

  get drawIoSettingsButton(): Locator {
    return this.drawIoArea
      .locator('[data-testid="open_settings_icon_button"]')
      .first();
  }

  get drawIoEnableSwitch(): Locator {
    return this.drawIoArea.locator(
      '[data-testid="enable_plugin_toggle_button"]',
    );
  }

  get speechToTextArea(): Locator {
    return this.page.getByTestId("plugin_speech-to-text");
  }

  get speechToTextSettingsButton(): Locator {
    return this.speechToTextArea
      .locator('[data-testid="open_settings_icon_button"]')
      .first();
  }

  get speechToTextEnableSwitch(): Locator {
    return this.speechToTextArea.locator(
      '[data-testid="enable_plugin_toggle_button"]',
    );
  }

  get pdfConverterArea(): Locator {
    return this.page.getByTestId("plugin_pdf-converter");
  }

  get pdfConverterSettingsButton(): Locator {
    return this.pdfConverterArea
      .locator('[data-testid="open_settings_icon_button"]')
      .first();
  }

  get pdfConverterEnableSwitch(): Locator {
    return this.pdfConverterArea.locator(
      '[data-testid="enable_plugin_toggle_button"]',
    );
  }
  get guideLink(): Locator {
    return this.page.getByTestId("plugin_home_page_link");
  }

  get languageCombobox(): Locator {
    return this.page
      .locator("#modal-dialog")
      .getByTestId("combobox")
      .locator("div")
      .first();
  }

  get selectLanguage(): Locator {
    return this.page.locator("div").filter({ hasText: /^English$/ });
  }

  get offlineModeSwitch(): Locator {
    return this.page
      .locator("#modal-dialog")
      .getByTestId("toggle-button")
      .first();
  }

  get librariesSwitch(): Locator {
    return this.page
      .locator("#modal-dialog")
      .getByTestId("toggle-button")
      .nth(1);
  }

  get saveButton(): Locator {
    return this.page
      .locator("#modal-dialog")
      .getByTestId("settings_plugin_save_button");
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

  async openMarkdownSettings() {
    await this.markdownArea.click();
    await this.markdownSettingsButton.click();
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

  async openDrawIoSettings() {
    await this.drawIoArea.click();
    await this.drawIoSettingsButton.click();
  }

  async openSpeechToTextSettings() {
    await this.speechToTextArea.click();
    await this.speechToTextSettingsButton.click();
  }

  async openPdfConverterSettings() {
    await this.pdfConverterArea.click();
    await this.pdfConverterSettingsButton.click();
  }

  async guidePopup() {
    const page1 = this.page.waitForEvent("popup");
    await this.guideLink.click();
    return page1;
  }

  async changeDrawIoSettings() {
    await this.languageCombobox.click();
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

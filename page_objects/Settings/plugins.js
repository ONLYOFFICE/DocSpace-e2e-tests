import MainPage from "../mainPage.js";
import config from "../../config/config.js";

export class Plugins extends MainPage {
  constructor(page) {
    super(page);
    this.page = page;
    this.forwardToPlugins = page.getByText("Plugins");
    this.navigateToIntegration = page.getByRole("link", {
      name: "Integration",
    });
    this.markdownArea = page.getByText("markdown 1.0.1DocSpace plugin");
    this.markdownSettingsButton = this.markdownArea.locator(
      ".plugin-controls > .sc-fqkvVR > .icon-button_svg > div > .injected-svg",
    );
    this.markdownEnableSwitch = this.markdownArea.locator("circle");
    this.drawIoArea = page.getByText("draw.io 1.0.2A tool for");
    this.drawIoSettingsButton = this.drawIoArea.locator(
      ".plugin-controls > .sc-fqkvVR > .icon-button_svg > div > .injected-svg",
    );
    this.drawIoEnableSwitch = this.drawIoArea.locator("circle");
    this.speechToTextArea = page.getByText("speech-to-text 1.0.2Speech to");
    this.speechToTextSettingsButton = this.speechToTextArea.locator(
      ".plugin-controls > .sc-fqkvVR > .icon-button_svg > div > .injected-svg",
    );
    this.speechToTextEnableSwitch = this.speechToTextArea.locator("circle");
    this.pdfConverterArea = page.getByText("pdf-converter 1.0.2A plugin");
    this.pdfConverterSettingsButton = this.pdfConverterArea.locator(
      ".plugin-controls > .sc-fqkvVR > .icon-button_svg > div > .injected-svg",
    );
    this.pdfConverterEnableSwitch = this.pdfConverterArea.locator("circle");
    this.guideLink = page.getByTestId("link");
    this.languageCombobox = page.getByTestId("combobox").locator("div").first();
    this.selectLanguage = page.locator("div").filter({ hasText: /^English$/ });
    this.offlineModeSwitch = page.locator("#modal-scroll circle").first();
    this.librariesSwitch = page.locator("#modal-scroll circle").nth(1);
    this.saveButton = page.getByRole("button", { name: "Save" });
    this.textInput = page.getByTestId("text-input");
  }

  async navigateToPlugins() {
    await this.navigateToIntegration.click();
    await this.forwardToPlugins.click();
  }

  async clickMarkdownSettingsButton() {
    await this.markdownArea.click();
    await this.markdownSettingsButton.click();
  }

  async clickMarkdownEnableSwitch() {
    await this.markdownArea.click();
    await this.markdownEnableSwitch.click();
  }

  async clickDrawIoSettingsButton() {
    await this.drawIoArea.click();
    await this.drawIoSettingsButton.click();
  }

  async clickDrawIoEnableSwitch() {
    await this.drawIoArea.click();
    await this.drawIoEnableSwitch.click();
  }

  async clickSpeechToTextSettingsButton() {
    await this.speechToTextArea.click();
    await this.speechToTextSettingsButton.click();
  }

  async clickSpeechToTextEnableSwitch() {
    await this.speechToTextArea.click();
    await this.speechToTextEnableSwitch.click();
  }

  async clickPdfConverterEnableSwitch() {
    await this.pdfConverterArea.click();
    await this.pdfConverterEnableSwitch.click();
  }

  async clickPdfConverterSettingsButton() {
    await this.pdfConverterArea.click();
    await this.pdfConverterSettingsButton.click();
  }

  async guidePopup() {
    const page1Promise = this.page.waitForEvent("popup");
    await this.guideLink.click();
    const page1 = await page1Promise;
    return page1;
  }

  async changeDrawIoSettings() {
    await this.languageCombobox.click();
    await this.selectLanguage.click();
    await this.offlineModeSwitch.click();
    await this.librariesSwitch.click();
    await this.saveButton.click();
  }

  async fillSpeechToTextToken(token) {
    await this.textInput.fill(config.SPEECH_TO_TEXT_KEY);
    await this.saveButton.click();
  }

  async fillPdfConverterToken(token) {
    await this.textInput.fill(config.PDF_CONVERTER_KEY);
    await this.saveButton.click();
  }
}

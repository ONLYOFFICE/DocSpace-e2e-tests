import { expect, Locator, Page } from "@playwright/test";
import BaseDevTools from "./BaseDevTools";

class PluginSDK extends BaseDevTools {
  constructor(page: Page) {
    super(page);
  }

  get readInstructionsButton(): Locator {
    return this.page.getByTestId("read_instructions_button");
  }

  get pluginList(): Locator {
    return this.page.locator(".plugin-list__item");
  }

  get zipArchivesRepoButton(): Locator {
    return this.page.getByTestId("zip-archives_go_to_repo_button");
  }

  get speechToTextRepoButton(): Locator {
    return this.page.getByTestId("speech-to-text_go_to_repo_button");
  }

  get pdfConverterRepoButton(): Locator {
    return this.page.getByTestId("pdf-converter_go_to_repo_button");
  }

  get markdownRepoButton(): Locator {
    return this.page.getByTestId("markdown_go_to_repo_button");
  }

  get imageEditorRepoButton(): Locator {
    return this.page.getByTestId("image-editor_go_to_repo_button");
  }

  get drawIoRepoButton(): Locator {
    return this.page.getByTestId("draw.io_go_to_repo_button");
  }

  get codemirrorRepoButton(): Locator {
    return this.page.getByTestId("codemirror_go_to_repo_button");
  }

  async open() {
    await this.openDevTools();
    await this.navigateToSection("plugin-sdk");
  }

  async checkPluginsLoaded() {
    await expect(this.pluginList.first()).toBeVisible();
  }
}

export default PluginSDK;

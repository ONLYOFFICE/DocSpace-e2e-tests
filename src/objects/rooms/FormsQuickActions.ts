import { expect, Locator, Page } from "@playwright/test";

const FORM_SPACE_BUTTON = "quick-form-room";
const SPACE_TEMPLATE_BUTTON = "quick-form-space-template";
const TEMPLATE_GALLERY_BUTTON = "quick-form-gallery";
const AI_CHAT_BUTTON = "quick-ai-chat";

// Quick actions panel shown above the room list in the Forms section.
class FormsQuickActions {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get formSpaceButton(): Locator {
    return this.page.getByTestId(FORM_SPACE_BUTTON);
  }

  get spaceTemplateButton(): Locator {
    return this.page.getByTestId(SPACE_TEMPLATE_BUTTON);
  }

  get templateGalleryButton(): Locator {
    return this.page.getByTestId(TEMPLATE_GALLERY_BUTTON);
  }

  get aiChatButton(): Locator {
    return this.page.getByTestId(AI_CHAT_BUTTON);
  }

  async checkAllButtonsExist() {
    await expect(this.formSpaceButton).toBeVisible();
    await expect(this.spaceTemplateButton).toBeVisible();
    await expect(this.templateGalleryButton).toBeVisible();
    await expect(this.aiChatButton).toBeVisible();
  }

  async clickFormSpace() {
    await expect(this.formSpaceButton).toBeVisible();
    await this.formSpaceButton.click();
  }

  async clickSpaceTemplate() {
    await expect(this.spaceTemplateButton).toBeVisible();
    await this.spaceTemplateButton.click();
  }

  async clickTemplateGallery() {
    await expect(this.templateGalleryButton).toBeVisible();
    await this.templateGalleryButton.click();
  }

  async clickAiChat() {
    await expect(this.aiChatButton).toBeVisible();
    await this.aiChatButton.click();
  }
}

export default FormsQuickActions;

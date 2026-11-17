import { expect, Page } from "@playwright/test";
import { aiLimitReachedBanner } from "@/src/utils/constants/ai";

// AI tools > Fill metadata / Generate metadata panel
class MetadataAiPanel {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get panel() {
    return this.page
      .getByTestId("modal-dialog")
      .filter({ has: this.page.getByTestId("metadata_ai_save_button") });
  }

  private get runButton() {
    return this.page.getByTestId("metadata_ai_run_button");
  }

  private get saveButton() {
    return this.page.getByTestId("metadata_ai_save_button");
  }

  private get reviewNotes() {
    return this.page.getByTestId("metadata_ai_review_notes");
  }

  async expectOpened(title: "Fill metadata" | "Generate metadata") {
    await expect(this.panel).toBeVisible();
    await expect(this.panel).toContainText(title);
  }

  // The model answers in tens of seconds, the review replaces the start screen
  async runAi() {
    await this.runButton.click();
    await expect(this.reviewNotes).toBeVisible({ timeout: 120000 });
  }

  // Run when the AI spending limit is reached: the start screen stays with a notice
  async runAiBlockedByLimit() {
    await this.runButton.click();
    await expect(this.limitNotice).toBeVisible({ timeout: 60000 });
    await expect(this.reviewNotes).toBeHidden();
  }

  private get limitNotice() {
    return this.page.getByTestId("metadata_ai_limit_notice");
  }

  async checkLimitNotice(viewer: "admin" | "user") {
    await expect(this.limitNotice).toContainText(aiLimitReachedBanner.title);
    await expect(this.limitNotice).toContainText(
      aiLimitReachedBanner.descriptionStart,
    );
    await expect(this.limitNotice).toContainText(
      aiLimitReachedBanner.descriptionEnd[viewer],
    );
  }

  async clickChangeLimit() {
    await this.page.getByTestId("metadata_ai_change_limit_button").click();
  }

  async checkReviewNote(text: string | RegExp) {
    await expect(this.reviewNotes).toContainText(text);
  }

  async checkReviewHasCustomFields() {
    await expect(
      this.panel.getByTestId("metadata_custom_field_name_input").first(),
    ).toBeVisible();
  }

  async save() {
    await this.saveButton.click();
    await expect(this.saveButton).toBeHidden();
  }
}

export default MetadataAiPanel;

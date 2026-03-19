import { expect, Page } from "@playwright/test";

const TAG_ITEM = (tagName: string) => `tag_item_${tagName}`;
const CREATE_TAG_BUTTON = "create_tag_button";
const CONFIRM_EDIT_BUTTON = "confirm_edit_button";
const CANCEL_EDIT_BUTTON = "cancel_edit_button";
const EDIT_TAG_BUTTON = (tagName: string) => `edit_tag_button_${tagName}`;
const DELETE_TAG_BUTTON = (tagName: string) => `delete_tag_button_${tagName}`;
const DELETE_TAG_SUBMIT_BUTTON = "delete_tag_submit_button";
const DELETE_TAG_CANCEL_BUTTON = "delete_tag_cancel_button";
const DELETE_TAG_CHECKBOX = "delete_tag_checkbox";
const EDIT_TAG_SUBMIT_BUTTON = "edit_tag_submit_button";
const EDIT_TAG_CANCEL_BUTTON = "edit_tag_cancel_button";
const EDIT_TAG_CHECKBOX = "edit_tag_checkbox";
const TAG_ROW = "[class*='TagManagement-module__row']";
const ADD_TAG_INPUT = "add_tag_input";
const EDIT_INPUT_PLACEHOLDER = " ";

// Page Object for the inline tags panel that opens from the + button in the rooms table Tags column
class InlineTagsPanel {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get tagInput() {
    return this.page.getByTestId(ADD_TAG_INPUT);
  }

  // Panel container — scopes locators away from tags visible in the table row
  private get panel() {
    return this.page
      .locator("div")
      .filter({ has: this.page.getByTestId(ADD_TAG_INPUT) });
  }

  // Tag row in the panel list
  private tagRow(tagName: string) {
    return this.page.locator(TAG_ROW).filter({ hasText: tagName });
  }

  async waitForPanel() {
    await expect(this.tagInput).toBeVisible();
  }

  // Type a new tag name and click the create button to create it
  async addTag(tagName: string) {
    await expect(this.tagInput).toBeVisible();
    await this.tagInput.fill(tagName);
    await this.page.getByTestId(CREATE_TAG_BUTTON).click();
  }

  async expectTagInPanel(tagName: string) {
    await expect(this.panel.getByLabel(tagName, { exact: true })).toBeVisible();
  }

  async expectTagNotInPanel(tagName: string) {
    await expect(
      this.panel.getByLabel(tagName, { exact: true }),
    ).not.toBeVisible();
  }

  async closePanel() {
    await this.page.keyboard.press("Escape");
  }

  async typeTagName(tagName: string) {
    await expect(this.tagInput).toBeVisible();
    await this.tagInput.fill(tagName);
  }

  async expectCreateButtonVisible() {
    await expect(this.page.getByTestId(CREATE_TAG_BUTTON)).toBeVisible();
  }

  async expectCreateButtonNotVisible() {
    await expect(this.page.getByTestId(CREATE_TAG_BUTTON)).not.toBeVisible();
  }

  async expectTagDropdownItemVisible(tagName: string) {
    await expect(this.panel.getByTestId(TAG_ITEM(tagName))).toBeVisible();
  }

  async selectTagFromDropdown(tagName: string) {
    await this.panel.getByTestId(TAG_ITEM(tagName)).click();
  }

  async closePanelByClickingOutside() {
    await this.page.mouse.click(10, 300);
    await expect(this.tagInput).not.toBeVisible();
  }

  async expectScrollbarVisible() {
    await expect(
      this.panel.locator(".ScrollbarsCustom-TrackY").first(),
    ).toBeVisible();
  }

  // Hover the tag row, click the edit icon, change the name, confirm inline → confirm in modal
  async editTag(tagName: string, newName: string) {
    const row = this.tagRow(tagName);
    await row.hover();
    await row.getByTestId(EDIT_TAG_BUTTON(tagName)).click();
    // In edit mode the row class changes, so scope to the panel level
    const editInput = this.page.getByPlaceholder(EDIT_INPUT_PLACEHOLDER, {
      exact: true,
    });
    await expect(editInput).toBeVisible();
    await editInput.clear();
    await editInput.fill(newName);
    await this.page.getByTestId(CONFIRM_EDIT_BUTTON).click();
    await this.page.getByTestId(EDIT_TAG_SUBMIT_BUTTON).click();
  }

  // Same as editTag but checks "don't show again" before confirming in modal
  async editTagWithoutConfirm(tagName: string, newName: string) {
    const row = this.tagRow(tagName);
    await row.hover();
    await row.getByTestId(EDIT_TAG_BUTTON(tagName)).click();
    const editInput = this.page.getByPlaceholder(EDIT_INPUT_PLACEHOLDER, {
      exact: true,
    });
    await expect(editInput).toBeVisible();
    await editInput.clear();
    await editInput.fill(newName);
    await this.page.getByTestId(CONFIRM_EDIT_BUTTON).click();
    await this.page.getByTestId(EDIT_TAG_CHECKBOX).click();
    await this.page.getByTestId(EDIT_TAG_SUBMIT_BUTTON).click();
  }

  // Hover the tag row, click the edit icon, cancel via modal cancel button
  async cancelEditTagInModal(tagName: string, newName: string) {
    const row = this.tagRow(tagName);
    await row.hover();
    await row.getByTestId(EDIT_TAG_BUTTON(tagName)).click();
    const editInput = this.page.getByPlaceholder(EDIT_INPUT_PLACEHOLDER, {
      exact: true,
    });
    await expect(editInput).toBeVisible();
    await editInput.clear();
    await editInput.fill(newName);
    await this.page.getByTestId(CONFIRM_EDIT_BUTTON).click();
    await this.page.getByTestId(EDIT_TAG_CANCEL_BUTTON).click();
    // After modal cancel the inline edit input is still active — exit it
    await this.page.getByTestId(CANCEL_EDIT_BUTTON).click();
  }

  // Hover the tag row, click the delete icon, confirm in the modal dialog
  async deleteTag(tagName: string) {
    const row = this.tagRow(tagName);
    await row.hover();
    await row.getByTestId(DELETE_TAG_BUTTON(tagName)).click();
    await this.page.getByTestId(DELETE_TAG_SUBMIT_BUTTON).click();
  }

  // Hover the tag row, click the delete icon, then cancel
  async cancelDeleteTag(tagName: string) {
    const row = this.tagRow(tagName);
    await row.hover();
    await row.getByTestId(DELETE_TAG_BUTTON(tagName)).click();
    await this.page.getByTestId(DELETE_TAG_CANCEL_BUTTON).click();
  }

  // Hover the tag row, click the edit icon, cancel editing
  async cancelEditTag(tagName: string) {
    const row = this.tagRow(tagName);
    await row.hover();
    await row.getByTestId(EDIT_TAG_BUTTON(tagName)).click();
    await this.page.getByTestId(CANCEL_EDIT_BUTTON).click();
  }

  // Check "don't show again" in the delete confirmation dialog, then confirm
  async deleteTagWithoutConfirm(tagName: string) {
    const row = this.tagRow(tagName);
    await row.hover();
    await row.getByTestId(DELETE_TAG_BUTTON(tagName)).click();
    await this.page.getByTestId(DELETE_TAG_CHECKBOX).click();
    await this.page.getByTestId(DELETE_TAG_SUBMIT_BUTTON).click();
  }

  // Click delete icon — no confirmation dialog expected (after "don't show again" was checked)
  async deleteTagNoModal(tagName: string) {
    const row = this.tagRow(tagName);
    await row.hover();
    await row.getByTestId(DELETE_TAG_BUTTON(tagName)).click();
  }

  // Edit tag and confirm inline only — no modal expected (after "don't show again" was checked)
  async editTagNoModal(tagName: string, newName: string) {
    const row = this.tagRow(tagName);
    await row.hover();
    await row.getByTestId(EDIT_TAG_BUTTON(tagName)).click();
    const editInput = this.page.getByPlaceholder(EDIT_INPUT_PLACEHOLDER, {
      exact: true,
    });
    await expect(editInput).toBeVisible();
    await editInput.clear();
    await editInput.fill(newName);
    await this.page.getByTestId(CONFIRM_EDIT_BUTTON).click();
  }
}

export default InlineTagsPanel;

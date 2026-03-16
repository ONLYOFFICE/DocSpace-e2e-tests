import { expect, Page } from "@playwright/test";

const TAG_ITEM = "tag_item";
const TAG_ROW = "[class*='TagManagement-module__row']";
// const TAG_ACCEPT_ICON = "[class*='IconButton-module__notSelectable']";
const TAG_DELETE_ICON = "[class*='TagManagement-module__deleteIcon']";
const TAG_CROSS_ICON = "[class*='TagManagement-module__crossIcon']";
const ICON_BUTTON = "[class*='IconButton-module__iconButton']";
const MODAL_DIALOG = "modal-dialog";
const ADD_TAG_INPUT = "Add a tag";
const EDIT_INPUT_PLACEHOLDER = " ";
const SAVE_BUTTON = "Save";
const DELETE_BUTTON = "Delete";
const CANCEL_BUTTON = "Cancel";

// Page Object for the inline tags panel that opens from the + button in the rooms table Tags column
class InlineTagsPanel {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get tagInput() {
    return this.page.getByRole("textbox", { name: ADD_TAG_INPUT });
  }

  // Panel container — scopes locators away from tags visible in the table row
  private get panel() {
    return this.page
      .locator("div")
      .filter({ has: this.page.getByRole("textbox", { name: ADD_TAG_INPUT }) });
  }

  // Dropdown item that appears when typing a new tag name
  private tagDropdownItem(tagName: string) {
    return this.page.getByTestId(TAG_ITEM).filter({ hasText: tagName });
  }

  // Tag row in the panel list
  private tagRow(tagName: string) {
    return this.page.locator(TAG_ROW).filter({ hasText: tagName });
  }

  async waitForPanel() {
    await expect(this.tagInput).toBeVisible();
  }

  // Type a new tag name and click the dropdown item to create it
  async addTag(tagName: string) {
    await expect(this.tagInput).toBeVisible();
    await this.tagInput.fill(tagName);
    await this.tagDropdownItem(tagName).click();
  }

  async expectTagInPanel(tagName: string) {
    await expect(this.panel.getByLabel(tagName, { exact: true })).toBeVisible();
  }

  async expectTagNotInPanel(tagName: string) {
    await expect(
      this.panel.getByLabel(tagName, { exact: true }),
    ).not.toBeVisible();
  }

  // Hover the tag row and click the edit icon (first icon button), change the name, confirm
  async editTag(tagName: string, newName: string) {
    const row = this.tagRow(tagName);
    await row.hover();
    await row.locator(ICON_BUTTON).first().click();
    // In edit mode the row class changes, so scope to the panel level
    const editInput = this.page.getByPlaceholder(EDIT_INPUT_PLACEHOLDER, {
      exact: true,
    });
    await expect(editInput).toBeVisible();
    await editInput.clear();
    await editInput.fill(newName);
    await this.page.keyboard.press("Enter");
    // await this.page.locator(TAG_ACCEPT_ICON).first().click();
    await this.page.getByRole("button", { name: SAVE_BUTTON }).click();
  }

  // Hover the tag row and click the delete icon, confirm in the modal dialog
  async deleteTag(tagName: string) {
    const row = this.tagRow(tagName);
    await row.hover();
    await row.locator(TAG_DELETE_ICON).click();
    await this.page
      .getByTestId(MODAL_DIALOG)
      .getByRole("button", { name: DELETE_BUTTON })
      .click();
  }

  // Hover the tag row and click the delete icon, then cancel
  async cancelDeleteTag(tagName: string) {
    const row = this.tagRow(tagName);
    await row.hover();
    await row.locator(TAG_DELETE_ICON).click();
    await this.page
      .getByTestId(MODAL_DIALOG)
      .getByRole("button", { name: CANCEL_BUTTON })
      .click();
  }

  // Hover the tag row and click the delete icon, cancel editing via the cross icon
  async cancelEditTag(tagName: string) {
    const row = this.tagRow(tagName);
    await row.hover();
    await row.locator(ICON_BUTTON).first().click();
    await row.locator(TAG_CROSS_ICON).click();
  }
}

export default InlineTagsPanel;

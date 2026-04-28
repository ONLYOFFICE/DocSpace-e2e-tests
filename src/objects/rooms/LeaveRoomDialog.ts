import { expect, Page } from "@playwright/test";

const ASSIGN_OWNER_BUTTON = "leave_room_modal_submit";
const CANCEL_ASSIGN_OWNER_BUTTON = "leave_room_modal_cancel";
const OWNER_SELECTOR_PANEL = "change_owner_people_selector";
const SELECTOR_SEARCH_INPUT = "selector_search_input";
const SELECTOR_SUBMIT_BUTTON = "selector_submit_button";
const SELECTOR_FOOTER_CHECKBOX = "selector_footer_checkbox";
const SELECTOR_CANCEL_BUTTON = "selector_cancel_button";

class LeaveRoomDialog {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get assignOwnerButton() {
    return this.page.getByTestId(ASSIGN_OWNER_BUTTON);
  }

  private get cancelButton() {
    return this.page.getByTestId(CANCEL_ASSIGN_OWNER_BUTTON);
  }

  private get ownerSelectorPanel() {
    return this.page.getByTestId(OWNER_SELECTOR_PANEL);
  }

  private get ownerSelectorSearchInput() {
    return this.ownerSelectorPanel.getByTestId(SELECTOR_SEARCH_INPUT).locator("input");
  }

  private get ownerSelectorSubmitButton() {
    return this.ownerSelectorPanel.getByTestId(SELECTOR_SUBMIT_BUTTON);
  }

  private get ownerSelectorCancelButton() {
    return this.ownerSelectorPanel.getByTestId(SELECTOR_CANCEL_BUTTON);
  }

  private get ownerSelectorFooterCheckbox() {
    return this.ownerSelectorPanel.getByTestId(SELECTOR_FOOTER_CHECKBOX);
  }

  async checkDialogExist() {
    await expect(this.assignOwnerButton).toBeVisible();
  }

  async submit() {
    await expect(this.assignOwnerButton).toBeVisible();
    await this.assignOwnerButton.click();
  }

  async cancel() {
    await expect(this.cancelButton).toBeVisible();
    await this.cancelButton.click();
  }

  async checkOwnerSelectorExist() {
    await expect(this.ownerSelectorPanel).toBeVisible();
  }

  async searchForUser(name: string) {
    await expect(this.ownerSelectorSearchInput).toBeVisible();
    await this.ownerSelectorSearchInput.fill(name);
  }

  async selectUserByIndex(index: number) {
    const item = this.ownerSelectorPanel.getByTestId(`selector-item-${index}`);
    await expect(item).toBeVisible();
    await item.click();
  }

  async selectUserByName(name: string) {
    const item = this.ownerSelectorPanel
      .locator(`[data-testid^="selector-item-"]`)
      .filter({ hasText: name });
    await expect(item).toBeVisible();
    await item.click();
  }

  async selectUserByAriaLabel(ariaLabel: string) {
    const item = this.ownerSelectorPanel.locator(`[aria-label="${ariaLabel}"]`);
    await expect(item).toBeVisible();
    await item.click();
  }

  async submitOwnerSelection() {
    await expect(this.ownerSelectorSubmitButton).toBeVisible();
    await this.ownerSelectorSubmitButton.click();
  }

  async cancelOwnerSelection() {
    await expect(this.ownerSelectorCancelButton).toBeVisible();
    await this.ownerSelectorCancelButton.click();
  }

  async checkSelectorInfoText(text: string) {
    await expect(this.ownerSelectorPanel).toContainText(text);
  }

  async checkUserVisibleInSelector(name: string) {
    await this.ownerSelectorSearchInput.fill(name);
    const item = this.ownerSelectorPanel
      .locator(`[data-testid^="selector-item-"]`)
      .filter({ hasText: name });
    await expect(item).toBeVisible();
  }

  async checkUserNotVisibleInSelector(name: string) {
    await this.ownerSelectorSearchInput.fill(name);
    const item = this.ownerSelectorPanel
      .locator(`[data-testid^="selector-item-"]`)
      .filter({ hasText: name });
    await expect(item).not.toBeVisible();
  }

  async checkFooterCheckboxIsChecked() {
    const checkbox = this.ownerSelectorFooterCheckbox.locator("input");
    await expect(checkbox).toBeChecked();
  }

  async toggleFooterCheckbox() {
    await expect(this.ownerSelectorFooterCheckbox).toBeVisible();
    await this.ownerSelectorFooterCheckbox.click();
  }
}

export default LeaveRoomDialog;

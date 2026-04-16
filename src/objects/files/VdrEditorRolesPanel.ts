import { expect, Page } from "@playwright/test";

// CSS module classes - partial match, since hash suffix changes per build
const ROLE_SELECTOR_BUTTON = '[class*="FillingRoleSelector_button"]';
const ROLE_SELECTOR_INFO = '[class*="FillingRoleSelector_info"]';
const ROLE_SELECTOR_NAME = '[class*="FillingRoleSelector_name"]';
const PANEL_HEADER = "#modal-header-swipe";
const PANEL_TITLE = "Start filling";
// People selector opened from role selector button (same pattern as EditorStartFillingPanel)
const PEOPLE_SELECTOR_SUBMIT = '[data-testid="selector_submit_button"]';
const START_BUTTON = "#shared_move-to-archived-modal_submit";

class VdrEditorRolesPanel {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get panelHeader() {
    return this.page.locator(PANEL_HEADER);
  }

  private get roleSelectorButton() {
    return this.page.locator(ROLE_SELECTOR_BUTTON);
  }

  private get peopleSelectorSubmit() {
    return this.page.locator(PEOPLE_SELECTOR_SUBMIT);
  }

  async checkPanelVisible() {
    await expect(this.panelHeader).toBeVisible({ timeout: 15000 });
    await expect(
      this.page.getByText(PANEL_TITLE, { exact: true }),
    ).toBeVisible();
  }

  async checkRoleSelectorVisible() {
    await expect(this.roleSelectorButton.first()).toBeVisible();
  }

  async clickRoleSelector(index = 0) {
    await expect(this.roleSelectorButton.nth(index)).toBeVisible();
    await this.roleSelectorButton.nth(index).click();
  }

  async clickRoleSelectorForRole(roleName: string) {
    const button = this.page.locator(ROLE_SELECTOR_BUTTON).filter({
      has: this.page.locator(ROLE_SELECTOR_NAME).filter({ hasText: roleName }),
    });
    await expect(button).toBeVisible({ timeout: 10000 });
    await button.click();
  }

  async selectUserByIndex(itemIndex: number) {
    const item = this.page.getByTestId(`selector-item-${itemIndex}`);
    await expect(item).toBeVisible({ timeout: 10000 });
    await item.click();
  }

  async selectUserByName(name: string) {
    const item = this.page.getByLabel(name, { exact: true });
    await expect(item).toBeVisible({ timeout: 10000 });
    await item.click();
  }

  async submitRoleSelection() {
    await expect(this.peopleSelectorSubmit).toBeVisible();
    await this.peopleSelectorSubmit.click();
  }

  async checkAssignedUserName(name: string) {
    const info = this.page.locator(ROLE_SELECTOR_INFO);
    await expect(info.first()).toContainText(name, { timeout: 10000 });
  }

  async checkAssignedUserNameByIndex(index: number, name: string) {
    const info = this.page.locator(ROLE_SELECTOR_INFO);
    await expect(info.nth(index)).toContainText(name, { timeout: 10000 });
  }

  async clickStart() {
    const button = this.page.locator(START_BUTTON);
    await expect(button).toBeVisible();
    await button.click();
  }
}

export default VdrEditorRolesPanel;

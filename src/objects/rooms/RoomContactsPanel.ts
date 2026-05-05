import { expect, Page } from "@playwright/test";
import { type RoleAccessType } from "../common/BaseRoleAccess";

const MEMBERS_TAB = "0_tab";
const GROUPS_TAB = "1_tab";
const GUESTS_TAB = "2_tab";
const PEOPLE_SELECTOR = "invite_panel_item_access_selector";
const ACCESS_COMBO_BUTTON = '[data-test-id="combo-button"]';
const SELECT_BUTTON = "selector_submit_button";

class RoomContactsPanel {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get membersTab() {
    return this.page.getByTestId(MEMBERS_TAB);
  }

  private get groupsTab() {
    return this.page.getByTestId(GROUPS_TAB);
  }

  private get guestsTab() {
    return this.page.getByTestId(GUESTS_TAB);
  }

  private get searchInput() {
    return this.page.getByPlaceholder("Search");
  }

  private get selectButton() {
    return this.page.getByTestId(SELECT_BUTTON);
  }

  private get accessComboBox() {
    return this.page.getByTestId(PEOPLE_SELECTOR).locator(ACCESS_COMBO_BUTTON);
  }

  async switchToMembersTab() {
    await this.membersTab.click();
  }

  async switchToGroupsTab() {
    await this.groupsTab.click();
  }

  async switchToGuestsTab() {
    await this.guestsTab.click();
  }

  async searchContact(query: string) {
    await this.searchInput.fill(query);
  }

  async selectUserByEmail(email: string) {
    // Find user by aria-label containing email (format: "User: Name, email@example.com")
    const userRow = this.page.locator(`[aria-label*="${email}"]`);
    await expect(userRow).toBeVisible({ timeout: 10000 });
    await userRow.click();
  }

  async selectUserByName(name: string) {
    // Find user by aria-label containing name (format: "User: Name, email@example.com")
    const userRow = this.page.locator(`[aria-label*="${name}"]`);
    await expect(userRow).toBeVisible({ timeout: 10000 });
    await userRow.click();
  }

  async selectGroupByName(name: string) {
    // Group rows have aria-label exactly "Group: <name>"
    const groupRow = this.page.locator(`[aria-label="Group: ${name}"]`);
    await expect(groupRow).toBeVisible({ timeout: 10000 });
    await groupRow.click();
  }

  async clickSelectButton() {
    await expect(this.selectButton).toBeVisible();
    await this.selectButton.click();
  }

  async checkUserVisible(email: string) {
    await this.searchContact(email);
    await expect(this.page.locator(`[aria-label*="${email}"]`)).toBeVisible();
  }

  async checkUserNotVisible(email: string) {
    await this.searchContact(email);
    await expect(
      this.page.locator(`[aria-label*="${email}"]`),
    ).not.toBeVisible();
  }

  async checkGroupVisible(name: string) {
    await this.searchContact(name);
    await expect(
      this.page.locator(`[aria-label="Group: ${name}"]`),
    ).toBeVisible();
  }

  async selectAccessType(accessType: RoleAccessType) {
    // Open access combo box
    await expect(this.accessComboBox).toBeVisible();
    await this.accessComboBox.click();

    // Select the access option by data-key
    const option = this.page.locator(`[data-key="${accessType}"]`);
    await expect(option).toBeVisible();
    await option.click();
  }
}

export default RoomContactsPanel;

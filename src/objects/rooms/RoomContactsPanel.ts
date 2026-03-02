import { expect, Page } from "@playwright/test";

const MEMBERS_TAB = "0_tab";
const GROUPS_TAB = "1_tab";
const GUESTS_TAB = "2_tab";
const PEOPLE_SELECTOR = "people-selector";
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

  async clickSelectButton() {
    await expect(this.selectButton).toBeVisible();
    await this.selectButton.click();
  }

  async checkUserVisible(email: string) {
    await expect(this.page.getByText(email)).toBeVisible();
  }

  // Select access type for FormFilling room
  async selectAccessType(
    accessType: "roomManager" | "contentCreator" | "formFiller",
  ) {
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

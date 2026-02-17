import { expect, Page } from "@playwright/test";

class ContactsPanel {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get membersTab() {
    return this.page.getByTestId("0_tab");
  }

  private get groupsTab() {
    return this.page.getByTestId("1_tab");
  }

  private get guestsTab() {
    return this.page.getByTestId("2_tab");
  }

  private get searchInput() {
    return this.page.getByPlaceholder("Search");
  }

  private get selectButton() {
    return this.page.getByRole("button", { name: "Select" });
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
    const userRow = this.page.locator(".room-members-row_container", {
      hasText: email,
    });
    await expect(userRow).toBeVisible();
    await userRow.click();
  }

  async selectUserByName(name: string) {
    const userRow = this.page.locator(".room-members-row_container", {
      hasText: name,
    });
    await expect(userRow).toBeVisible();
    await userRow.click();
  }

  async clickSelectButton() {
    await expect(this.selectButton).toBeVisible();
    await this.selectButton.click();
  }

  async checkUserVisible(email: string) {
    const userRow = this.page.locator(".room-members-row_container", {
      hasText: email,
    });
    await expect(userRow).toBeVisible();
  }
}

export default ContactsPanel;

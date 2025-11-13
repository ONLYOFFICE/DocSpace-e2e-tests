import { expect, Page } from "@playwright/test";
import InfoPanel from "../common/InfoPanel";

class ContactsInfoPanel extends InfoPanel {
  constructor(page: Page) {
    super(page);
  }

  private get contactsOptions() {
    return this.infoPanel.locator("#info-accounts-options");
  }

  async hideRegistrationDate() {
    await this.infoPanel.getByTitle("Registration date").evaluate((el) => {
      const valueEl = el.nextElementSibling as HTMLElement | null;
      if (valueEl) valueEl.style.display = "none";
      (el as HTMLElement).style.display = "none";
    });
  }

  async openContactsOptions() {
    await this.contactsOptions.click();
    await expect(this.contextMenu.menu).toBeVisible();
  }

  async openGroupsOptions() {
    await this.contactsOptions.click();
    await expect(
      this.dropdown.menu.filter({
        hasText: "Edit group",
      }),
    ).toBeVisible();
  }

  async checkGroupMemberExist() {
    const groupMember = this.infoPanel
      .locator('[data-testid^="selector-item-"]')
      .first();
    await expect(groupMember).toBeVisible();
  }
}
export default ContactsInfoPanel;

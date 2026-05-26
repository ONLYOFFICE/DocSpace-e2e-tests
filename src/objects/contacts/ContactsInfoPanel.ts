import { expect, Page } from "@playwright/test";
import InfoPanel from "../common/InfoPanel";

const ME_LABEL = "[class*='isMeLabel']";
const OWNER_ICON = ".owner_icon";
const ADMIN_ICON = ".admin_icon";
const FIELD_ACCOUNT = "Account";
const FIELD_TYPE = "Type";
const FIELD_REGISTRATION_DATE = "Registration date";
const FIELD_STATUS = "Status";

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

  async checkMeLabel() {
    await expect(this.infoPanel.locator(ME_LABEL)).toBeVisible();
  }

  async checkOwnerIcon() {
    await expect(this.infoPanel.locator(OWNER_ICON)).toBeVisible();
  }

  async checkAdminIcon() {
    await expect(this.infoPanel.locator(ADMIN_ICON)).toBeVisible();
  }

  private fieldValue(fieldTitle: string) {
    return this.infoPanel
      .getByText(fieldTitle, { exact: true })
      .locator("xpath=following-sibling::*[1]");
  }

  async checkAccountStatus(expectedStatus: string) {
    await expect(this.fieldValue(FIELD_ACCOUNT)).toContainText(expectedStatus);
  }

  async checkUserType(expectedType: string) {
    await expect(this.fieldValue(FIELD_TYPE)).toContainText(expectedType);
  }

  async checkStatus(expectedStatus: string) {
    await expect(this.fieldValue(FIELD_STATUS)).toContainText(expectedStatus);
  }

  async checkRegistrationDateVisible() {
    await expect(
      this.infoPanel.getByText(FIELD_REGISTRATION_DATE, { exact: true }),
    ).toBeVisible();
  }
}
export default ContactsInfoPanel;

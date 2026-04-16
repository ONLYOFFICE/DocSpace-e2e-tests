import { expect, Page } from "@playwright/test";

const ASSIGN_ROLE_BUTTON = '[data-testid="submit_assign_role_button"]';
const ASSIGN_ROLE_LATER_BUTTON = '[data-testid="assign_role_later_button"]';

class AssignRoleDialog {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickAssignRole() {
    const button = this.page.locator(ASSIGN_ROLE_BUTTON);
    await expect(button).toBeVisible();
    await button.click();
  }

  async clickLater() {
    const button = this.page.locator(ASSIGN_ROLE_LATER_BUTTON);
    await expect(button).toBeVisible();
    await button.click();
  }
}

export default AssignRoleDialog;

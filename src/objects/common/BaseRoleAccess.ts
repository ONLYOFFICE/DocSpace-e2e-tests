import { expect, Page } from "@playwright/test";

const ROLE_ACCESS_SELECTOR = "link-roles-dropdown";

const ROLE_ACCESS_OPTIONS = {
  roomManager: "roomManager",
  contentCreator: "contentCreator",
  formFiller: "formFiller",
  editor: "editor",
  reviewer: "reviewer",
  commenter: "commenter",
  viewer: "viewer",
} as const;

export type RoleAccessType = keyof typeof ROLE_ACCESS_OPTIONS;

// Base Page Object for role / access level selector
export default class BaseRoleAccess {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get accessSelector() {
    return this.page.getByTestId(ROLE_ACCESS_SELECTOR);
  }

  getRoleAccessOption(accessType: RoleAccessType) {
    return this.page.locator(`[data-key="${ROLE_ACCESS_OPTIONS[accessType]}"]`);
  }

  async selectRoleAccessType(accessType: RoleAccessType) {
    await expect(this.accessSelector).toBeVisible();
    await this.accessSelector.click();
    const option = this.getRoleAccessOption(accessType);
    await expect(option).toBeVisible();
    await option.click();
  }

  async checkRoleAccessTypeDisabled(accessType: RoleAccessType) {
    const option = this.getRoleAccessOption(accessType);
    await expect(option).toBeVisible();
    await expect(option).toBeDisabled();
  }
}

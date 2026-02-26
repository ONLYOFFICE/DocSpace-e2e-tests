import { expect } from "@playwright/test";
import BaseCalendar from "../common/BaseCalendar";
import BaseRoleAccess from "../common/BaseRoleAccess";

const INVITE_LINK_SETTINGS_SAVE_COPY_BUTTON = "link-settings_modal_save_button";
const CANCEL_BUTTON = "edit_link_panel_cancel_button";
const USER_LIMIT_TOGGLE = "toggle-button-icon";
const USER_LIMIT_INPUT = "link-settings_users-limit";

/**
 * Page Object for the "Invite via link" settings panel.
 *
 * Opened by clicking the gear icon on an invite link
 * inside the room's Invite dialog.
 *
 * Contains 3 settings blocks:
 * 1. Access rights — via roleAccess (BaseRoleAccess)
 * 2. User limit — toggle + numeric input
 * 3. Limit by period — date picker / expiration selector (inherited from BaseCalendar)
 */
class InviteLinkSettingsPanel extends BaseCalendar {
  readonly roleAccess: BaseRoleAccess;

  constructor(page: import("@playwright/test").Page) {
    super(page);
    this.roleAccess = new BaseRoleAccess(page);
  }

  // ==================== User Limit ====================

  get userLimitToggle() {
    return this.page.getByTestId(USER_LIMIT_TOGGLE);
  }

  async clickUserLimitToggle() {
    await this.clickElement(this.userLimitToggle);
  }

  get userLimitInput() {
    return this.page.getByTestId(USER_LIMIT_INPUT);
  }

  async fillUserLimit(limit: string) {
    const input = this.userLimitInput;
    await expect(input).toBeVisible();
    await input.clear();
    await input.fill(limit);
  }

  // ==================== Limit by Period (inherited from BaseCalendar) ====================

  // ==================== Action Buttons ====================

  get saveCopyButton() {
    return this.page.getByTestId(INVITE_LINK_SETTINGS_SAVE_COPY_BUTTON);
  }

  async saveAndCopy() {
    await expect(this.saveCopyButton).toBeVisible();
    await this.saveCopyButton.click();
  }

  get cancelButton() {
    return this.page.getByTestId(CANCEL_BUTTON);
  }

  async clickCancel() {
    await expect(this.cancelButton).toBeVisible();
    await this.cancelButton.click();
  }
}

export default InviteLinkSettingsPanel;

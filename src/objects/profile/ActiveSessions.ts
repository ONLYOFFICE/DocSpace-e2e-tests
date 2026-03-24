import { expect, Locator, Page } from "@playwright/test";
import BasePage from "../common/BasePage";
import BaseDialog from "../common/BaseDialog";

class ActiveSessions extends BasePage {
  dialog: BaseDialog;

  constructor(page: Page) {
    super(page);
    this.dialog = new BaseDialog(page);
  }

  private get loginTab(): Locator {
    return this.page.getByTestId("login_tab");
  }

  private get terminateAllLink(): Locator {
    return this.page.getByTestId("terminate_all_sessions_link");
  }

  get sessionRows(): Locator {
    return this.page.locator("[data-testid^='session_row_']");
  }

  private get logoutButton(): Locator {
    return this.page.getByTestId("dialog_logout_button");
  }

  private get cancelButton(): Locator {
    return this.page.getByTestId("dialog_cancel_button");
  }

  async openLoginTab() {
    await this.loginTab.click();
    await expect(this.sessionRows.first()).toBeVisible();
  }

  async getSessionCount(): Promise<number> {
    return this.sessionRows.count();
  }

  async logoutSession(sessionIndex: number) {
    const row = this.sessionRows.nth(sessionIndex);
    await row.hover();
    await row.getByTestId("session_remove_icon_button").click();
    await this.confirmLogout();
  }

  async confirmLogout() {
    await expect(this.logoutButton).toBeVisible();
    await this.logoutButton.click();
  }

  async cancelLogout() {
    await this.cancelButton.click();
  }

  async terminateAllExceptCurrent() {
    await this.terminateAllLink.click();
    await this.confirmLogout();
  }

  async terminateAllSessions() {
    await this.terminateAllLink.click();
    await this.page.getByTestId("dialog_change_password_checkbox").click();
    await this.confirmLogout();
  }

  async checkTerminateAllLinkVisible() {
    await expect(this.terminateAllLink).toBeVisible();
  }

  async checkTerminateAllLinkNotVisible() {
    await expect(this.terminateAllLink).not.toBeVisible();
  }
}

export default ActiveSessions;

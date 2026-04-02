import { expect, Locator, Page } from "@playwright/test";
import BasePage from "@/src/objects/common/BasePage";

class Deletion extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private get deleteDataArticleItem(): Locator {
    return this.page.locator("#portal-settings_catalog-delete");
  }

  private get deactivationTab(): Locator {
    return this.page.getByTestId("deactivation_tab");
  }

  get deletePortalButton(): Locator {
    return this.page.getByTestId("delete_portal_button");
  }

  get deactivatePortalButton(): Locator {
    return this.page.getByTestId("request_deactivate_portal_button");
  }

  async open() {
    await this.navigateToSettings();
    await this.deleteDataArticleItem.click();
    await expect(this.deletePortalButton).toBeVisible();
  }

  async openDeactivationTab() {
    await this.deactivationTab.click();
    await expect(this.deactivatePortalButton).toBeVisible();
  }

  async requestDeletion() {
    await this.deletePortalButton.click();
  }

  async requestDeactivation() {
    await this.openDeactivationTab();
    await this.deactivatePortalButton.click();
  }
}

export default Deletion;

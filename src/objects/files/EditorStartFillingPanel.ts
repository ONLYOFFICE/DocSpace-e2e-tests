import { expect, Page } from "@playwright/test";

const QUICK_SHARING_BUTTON = '[data-testid="share_from_card_quick-sharing"]';
const SHARE_WITH_USERS_BUTTON =
  '[data-testid="share_from_card_share-with-users"]';
const FORM_DATA_COLLECTIONS_BUTTON =
  '[data-testid="share_from_card_form-room"]';
const ROLE_BASED_FILLING_BUTTON =
  '[data-testid="share_from_card_virtual-data-room"]';

class EditorStartFillingPanel {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get quickSharingButton() {
    return this.page.locator(QUICK_SHARING_BUTTON);
  }

  get shareWithUsersButton() {
    return this.page.locator(SHARE_WITH_USERS_BUTTON);
  }

  get formDataCollectionsButton() {
    return this.page.locator(FORM_DATA_COLLECTIONS_BUTTON);
  }

  get roleBasedFillingButton() {
    return this.page.locator(ROLE_BASED_FILLING_BUTTON);
  }

  async clickQuickSharing() {
    await expect(this.quickSharingButton).toBeVisible();
    await this.quickSharingButton.click();
  }

  async clickShareWithUsers() {
    await expect(this.shareWithUsersButton).toBeVisible();
    await this.shareWithUsersButton.click();
  }

  async clickFormDataCollections() {
    await expect(this.formDataCollectionsButton).toBeVisible();
    await this.formDataCollectionsButton.click();
  }

  async clickRoleBasedFilling() {
    await expect(this.roleBasedFillingButton).toBeVisible();
    await this.roleBasedFillingButton.click();
  }

  async verifyAllOptionsVisible() {
    await expect(this.quickSharingButton).toBeVisible();
    await expect(this.shareWithUsersButton).toBeVisible();
    await expect(this.formDataCollectionsButton).toBeVisible();
    await expect(this.roleBasedFillingButton).toBeVisible();
  }
}

export default EditorStartFillingPanel;

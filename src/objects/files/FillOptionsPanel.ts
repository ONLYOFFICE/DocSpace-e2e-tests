import { expect, Page } from "@playwright/test";

const FILL_YOURSELF_BUTTON = '[data-testid="share_from_card_form-yourself"]';
const DATA_COLLECTION_BUTTON =
  '[data-testid="share_from_card_form-data-collection"]';
const ROLE_BASED_FILLING_BUTTON =
  '[data-testid="share_from_card_role-based-filling"]';

class FillOptionsPanel {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get fillYourselfButton() {
    return this.page.locator(FILL_YOURSELF_BUTTON);
  }

  get dataCollectionButton() {
    return this.page.locator(DATA_COLLECTION_BUTTON);
  }

  get roleBasedFillingButton() {
    return this.page.locator(ROLE_BASED_FILLING_BUTTON);
  }

  async clickFillYourself() {
    await expect(this.fillYourselfButton).toBeVisible();
    await this.fillYourselfButton.click();
  }

  async clickDataCollection() {
    await expect(this.dataCollectionButton).toBeVisible();
    await this.dataCollectionButton.click();
  }

  async clickRoleBasedFilling() {
    await expect(this.roleBasedFillingButton).toBeVisible();
    await this.roleBasedFillingButton.click();
  }

  async verifyAllOptionsVisible() {
    await expect(this.fillYourselfButton).toBeVisible();
    await expect(this.dataCollectionButton).toBeVisible();
    await expect(this.roleBasedFillingButton).toBeVisible();
  }
}

export default FillOptionsPanel;

import BasePage from "@/src/objects/common/BasePage";
import navItems from "@/src/utils/constants/settings";
import BaseToast from "../../common/BaseToast";
import { expect, Page } from "@playwright/test";

class StorageManagement extends BasePage {
  protected toast: BaseToast;

  constructor(page: Page) {
    super(page);
    this.toast = new BaseToast(page);
  }

  get navigateToStorageManagement() {
    return this.page.locator('#portal-settings_catalog-portal-storageManagement').click();
  }

  get storageManagementGuideLink() {
    return this.page.locator('[data-testid="link"]');
  }

  get portalCreationDate() {
    return this.page.locator('[data-testid="text"]:has-text("Portal Created date")');
  }

  get recalculateDate() {
    return this.page.locator('[data-testid="text"]:has-text("Last update")');
  }

  get onOffQuotaRoom() {
    return this.page.locator('label').filter({ hasText: 'Define quota per room' }).locator('circle');
  }

  get onOffQuotaUser() {
    return this.page.locator('label').filter({ hasText: 'Define quota per user' }).locator('circle');
  }

  get comboboxRoom() {
    return this.page.getByTestId('combobox').locator('div').first();
  }

  get comboboxUser() {
    return this.page.getByTestId('combobox').locator('div').last();
  }

  get selectKB() {
    return this.page.locator('[data-testid="drop-down-item"]:has-text("KB")');
  }

  get selectMB() {
    return this.page.locator('[data-testid="drop-down-item"]:has-text("MB")');
  }

  get selectGB() {
    return this.page.locator('[data-testid="drop-down-item"]:has-text("GB")');
  }

  get selectTB() {
    return this.page.locator('[data-testid="drop-down-item"]:has-text("TB")');
  }

  get cancelButton() {
    return this.page.locator('[data-testid="cancel-button"]');
  }

  get saveButton() {
    return this.page.locator('[data-testid="save-button"]');
  }

  get textInput() {
    return this.page.locator('[data-testid="text-input"]');
  }



  async open() {
    await this.navigateToSettings();
    await this.navigateToArticle(navItems.storageManagement);
  }

  async checkStorageManagementRender() {
    await expect(this.page.getByTestId('text').getByText('Disk space used')).toBeVisible();
  }

  async hideDate() {
    await this.portalCreationDate.evaluate((el) => (el.style.display = "none"));
    await this.recalculateDate.evaluate((el) => (el.style.display = "none"));
  }

  async QuotaRoomActivate() {
    await this.onOffQuotaRoom.click();
    await this.comboboxRoom.click();
    await this.selectKB.click();
    await this.comboboxRoom.click();
    await this.selectGB.click();
    await this.comboboxRoom.click();
    await this.selectTB.click();
    await this.cancelButton.click();
    await this.onOffQuotaRoom.click();
    await this.textInput.fill('500');
    await this.saveButton.click();
  }

  async QuotaUserActivate() {
    await this.onOffQuotaUser.click();
    await this.comboboxUser.click();
    await this.selectKB.nth(1).click();
    await this.comboboxUser.click();
    await this.selectGB.nth(1).click();
    await this.comboboxUser.click();
    await this.selectTB.nth(1).click();
    await this.cancelButton.nth(1).click();
    await this.onOffQuotaUser.click();
    await this.textInput.nth(1).fill('500');
    await this.saveButton.nth(1).click();
  }

}

export default StorageManagement;
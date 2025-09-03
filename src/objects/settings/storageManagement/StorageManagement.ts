import BasePage from "@/src/objects/common/BasePage";
import { navItems } from "@/src/utils/constants/settings";
import BaseToast from "../../common/BaseToast";
import { expect, Page } from "@playwright/test";

class StorageManagement extends BasePage {
  protected toast: BaseToast;

  constructor(page: Page) {
    super(page);
    this.toast = new BaseToast(page);
  }

  get storageManagementGuideLink() {
    return this.page.getByTestId("help_center_link");
  }

  get portalCreationDate() {
    return this.page.getByTestId("portal_created_date");
  }

  get recalculateDate() {
    return this.page.getByTestId("last_recalculate_date");
  }

  get onOffQuotaRoom() {
    return this.page.getByTestId("quota_room_button");
  }

  get onOffQuotaUser() {
    return this.page.getByTestId("quota_user_button");
  }

  get comboboxRoom() {
    return this.page.getByTestId("quota_room_form_size_combo_box");
  }

  get comboboxUser() {
    return this.page.getByTestId("quota_user_form_size_combo_box");
  }

  get selectByte() {
    return this.page.getByTestId("drop_down_item_0");
  }

  get selectKB() {
    return this.page.getByTestId("drop_down_item_1");
  }

  get selectMB() {
    return this.page.getByTestId("drop_down_item_2");
  }

  get selectGB() {
    return this.page.getByTestId("drop_down_item_3");
  }

  get selectTB() {
    return this.page.getByTestId("drop_down_item_4");
  }

  get cancelButtonRoom() {
    return this.page.getByTestId("quota_room_form_cancel_button");
  }

  get cancelButtonUser() {
    return this.page.getByTestId("quota_user_form_cancel_button");
  }

  get saveButtonRoom() {
    return this.page.getByTestId("quota_room_form_save_button");
  }

  get saveButtonUser() {
    return this.page.getByTestId("quota_user_form_save_button");
  }

  get textInputRoom() {
    return this.page.getByTestId("quota_room_form_input");
  }

  get textInputUser() {
    return this.page.getByTestId("quota_user_form_input");
  }

  async open() {
    await this.navigateToSettings();
    await this.navigateToArticle(navItems.storageManagement);
  }

  async checkStorageManagementRender() {
    await expect(this.page.getByText("Disk space used")).toBeVisible();
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
    await this.cancelButtonRoom.click();
    await this.onOffQuotaRoom.click();
    await this.textInputRoom.fill("500");
    await this.saveButtonRoom.click();
  }

  async QuotaUserActivate() {
    await this.onOffQuotaUser.click();
    await this.comboboxUser.click();
    await this.selectKB.nth(1).click();
    await this.comboboxUser.click();
    await this.selectGB.nth(1).click();
    await this.comboboxUser.click();
    await this.selectTB.nth(1).click();
    await this.cancelButtonUser.click();
    await this.onOffQuotaUser.click();
    await this.textInputUser.fill("500");
    await this.saveButtonUser.click();
  }
}

export default StorageManagement;

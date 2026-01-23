import { expect } from "@playwright/test";
import BaseDialog from "../common/BaseDialog";

const ACCESS_SELECTOR = ".access-selector";
const ROW_ITEM = ".scroll-wrapper .row-item";
const INVITE_USER_BOX = '[class*="inviteUserBox"]';

class BaseInviteDialog extends BaseDialog {
  async checkInviteTitleExist() {
    await this.checkDialogTitleExist("Invite");
  }

  private get accessSelector() {
    return this.dialog.locator(ACCESS_SELECTOR);
  }

  private get dropDownUserList() {
    return this.dialog.locator(".dropdown-container");
  }

  private get accessSelectorOptions() {
    return this.dialog.locator(".dropdown-container");
  }

  async fillSearchInviteInput(value: string) {
    const inviteInput = this.dialog.locator(".invite-input");
    await this.fillInput(inviteInput, value);
  }

  async openAccessOptions() {
    await this.accessSelector.click();
    await expect(this.accessSelectorOptions).toBeVisible();
  }

  async selectAccessOption(value: string) {
    const accessSelectorOptionLocator = this.accessSelectorOptions
      .getByRole("option", { name: value })
      .last();
    await expect(accessSelectorOptionLocator).toBeVisible();
    await accessSelectorOptionLocator.click();
  }

  async selectRemoveAccessOption() {
    await this.selectAccessOption("Remove");
  }

  async openPeopleList() {
    const chooseFromListLinkLocator = this.dialog.getByRole("link", {
      name: "Choose from list",
    });
    await expect(chooseFromListLinkLocator).toBeVisible();
    await chooseFromListLinkLocator.click();
  }

  async checkAddedUserExist(value: string) {
    await expect(
      this.dialog.locator(ROW_ITEM).locator(INVITE_USER_BOX).getByText(value),
    ).toBeVisible();
  }

  async openRowAccessSelector(value: string) {
    const userAccessSelectorLocator = this.dialog
      .locator(ROW_ITEM)
      .locator(ACCESS_SELECTOR)
      .filter({ hasText: value })
      .locator("span");

    await expect(userAccessSelectorLocator).toBeVisible();
    await userAccessSelectorLocator.click();
  }

  async submitInviteDialog() {
    const buttonLocator = this.dialog.getByRole("button", {
      name: "Send invitation",
    });
    this.clickSubmitButton(buttonLocator);
  }

  async checkUserExist(value: string) {
    const userLocator = this.dropDownUserList.getByText(value);
    await expect(userLocator).toBeVisible();
    return userLocator;
  }

  async clickAddUserToInviteList(value: string) {
    const userLocator = await this.checkUserExist(value);
    await userLocator.click();
  }

  async checkAccessSelectionExist(value: string) {
    await expect(
      this.accessSelector.getByRole("button", { name: value }),
    ).toBeVisible();
  }
  async verifyUserRole(email: string, expectedRole: string) {
    const userRow = this.page.locator(ROW_ITEM, { hasText: email });
    await expect(userRow).toContainText(expectedRole);
  }
}

export default BaseInviteDialog;

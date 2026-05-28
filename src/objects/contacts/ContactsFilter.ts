import { expect, Page, Response } from "@playwright/test";
import BaseFilter from "../common/BaseFilter";
import { waitForGetGroupResponse, waitForGetPeopleResponse } from "./api";
import { TContactSort } from "@/src/utils/constants/contacts";

const FILTER_TAG_WITHOUT_GROUP = "filter_tag_withoutGroup";
const FILTER_TAG_OTHER_GROUP = "filter_tag_other";
const GROUP_PICKER_DIALOG = "#modal-dialog";

class ContactsFilter extends BaseFilter {
  private waitForGetResponse: (page: Page) => Promise<Response>;
  constructor(page: Page, isGroup: boolean = false) {
    super(page);
    this.waitForGetResponse = isGroup
      ? waitForGetGroupResponse
      : waitForGetPeopleResponse;
  }

  async applySort(option: TContactSort) {
    const promise = this.waitForGetResponse(this.page);
    await super.applySort(option);
    await promise;
  }

  async applyFilter() {
    const promise = this.waitForGetResponse(this.page);
    await super.applyFilter();
    await promise;
  }

  async clearSearchText() {
    const promise = this.waitForGetResponse(this.page);
    await super.clearSearchText();
    await promise;
  }

  async removeFilter(filterName: string) {
    const promise = this.waitForGetResponse(this.page);
    await super.removeFilter(filterName);
    await promise;
  }

  async clearFilter() {
    const promise = this.waitForGetResponse(this.page);
    await super.clearFilter();
    await promise;
  }

  async selectFilterByAccountStatus(
    status: "Active" | "Disabled" | "Pending invite",
  ) {
    await this.filterDialog.getByText(status, { exact: true }).click();
    await expect(this.filterApplyButton).toBeEnabled({ timeout: 10000 });
  }

  async selectFilterByType(type: "DocSpace admin" | "Room admin" | "User") {
    await this.filterDialog.getByText(type, { exact: true }).click();
    await expect(this.filterApplyButton).toBeEnabled({ timeout: 10000 });
  }

  async selectFilterByWithoutGroup() {
    await this.filterDialog.getByTestId(FILTER_TAG_WITHOUT_GROUP).click();
    await expect(this.filterApplyButton).toBeEnabled({ timeout: 10000 });
  }

  async selectFilterBySpecificGroup(groupName: string) {
    await this.filterDialog.getByTestId(FILTER_TAG_OTHER_GROUP).click();
    const groupPickerModal = this.page.locator(GROUP_PICKER_DIALOG);
    await groupPickerModal
      .getByText(groupName, { exact: true })
      .click({ force: true });
    await groupPickerModal
      .getByRole("button", { name: "Select", exact: true })
      .click({ force: true });
    await expect(this.filterApplyButton).toBeEnabled({ timeout: 10000 });
  }

  async selectFilterByAccount(account: "Paid" | "Free") {
    await this.filterDialog.getByText(account, { exact: true }).click();
    await expect(this.filterApplyButton).toBeEnabled({ timeout: 10000 });
  }

  async selectFilterByLoginType(loginType: "SSO" | "LDAP" | "Standard login") {
    await this.filterDialog.getByText(loginType, { exact: true }).click();
    await expect(this.filterApplyButton).toBeEnabled({ timeout: 10000 });
  }

  async selectFilterByStorageQuota(quota: "Custom quota" | "Default quota") {
    await this.filterDialog.getByText(quota, { exact: true }).click();
    await expect(this.filterApplyButton).toBeEnabled({ timeout: 10000 });
  }

  async fillSearchContactsInputAndCheckRequest(searchValue: string) {
    await this.fillSearchInputAndCheckRequest(searchValue);
  }
}

export default ContactsFilter;

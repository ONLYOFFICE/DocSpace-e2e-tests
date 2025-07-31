import { Page, Response } from "@playwright/test";
import BaseFilter from "../common/BaseFilter";
import { waitForGetGroupResponse, waitForGetPeopleResponse } from "./api";
import { TContactSort } from "@/src/utils/constants/contacts";

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

  async fillSearchContactsInputAndCheckRequest(searchValue: string) {
    await this.fillSearchInputAndCheckRequest(searchValue);
  }
}

export default ContactsFilter;

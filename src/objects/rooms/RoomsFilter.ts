import { Page } from "@playwright/test";
import BaseFilter from "../common/BaseFilter";
import { roomSort, TRoomSort } from "@/src/utils/constants/rooms";
import { waitForGetRoomsResponse } from "./api";

const ROOMS_FILTER = {
  BY_PUBLIC: "#filter_type-public",
} as const;

class RoomsFilter extends BaseFilter {
  constructor(page: Page) {
    super(page);
  }

  async selectSortByType() {
    const promise = waitForGetRoomsResponse(this.page);
    await this.selectSortOptionByText(roomSort.type);
    await promise;
  }

  async applyRoomsSort(option: TRoomSort) {
    const promise = waitForGetRoomsResponse(this.page);
    await this.applySort(option);
    await promise;
  }

  async selectFilterByPublic() {
    const promise = waitForGetRoomsResponse(this.page);
    await this.selectFilterTag(ROOMS_FILTER.BY_PUBLIC);
    await promise;
  }

  async applyFilter() {
    const promise = waitForGetRoomsResponse(this.page);
    await super.applyFilter();
    await promise;
  }

  async clearSearchText() {
    const promise = waitForGetRoomsResponse(this.page);
    await super.clearSearchText();
    await promise;
  }

  async clearFilterByPublic() {
    const promise = waitForGetRoomsResponse(this.page);
    const filterByPublicTag = this.page
      .locator(".selected-item_label")
      .filter({ hasText: "Public room" });

    await filterByPublicTag.click();
    await filterByPublicTag.waitFor({ state: "detached" });
    await promise;
  }

  async fillRoomsSearchInputAndCheckRequest(searchValue: string) {
    await this.fillSearchInputAndCheckRequest(searchValue);
  }

  async checkEmptyViewExist() {
    await this.checkEmptyView("No findings");
  }
}

export default RoomsFilter;

import { Page } from "@playwright/test";
import BaseFilter from "../common/BaseFilter";

const ROOMS_FILTER = {
  BY_PUBLIC: "#filter_type-public",
} as const;

const ROOMS_SORT = {
  BY_TYPE: "#sort-by_room-type",
};

class RoomsFilter extends BaseFilter {
  constructor(page: Page) {
    super(page);
  }

  async clickSortByType() {
    await this.page.locator(ROOMS_SORT.BY_TYPE).click();
  }

  async clickFilterByPublic() {
    await this.clickFilterTag(ROOMS_FILTER.BY_PUBLIC);
  }

  async clearFilterByPublic() {
    await this.page.locator(".selected-item_label").first().click();
    await this.waitForGetResponse("/rooms");
  }

  async fillRoomsSearchInputAndCheckRequest(searchValue: string) {
    await this.fillSearchInputAndCheckRequest(
      searchValue,
      `filterValue=${encodeURIComponent(searchValue)}`,
    );
  }

  async checkEmptyViewExist() {
    await this.checkEmptyView("No findings");
  }
}

export default RoomsFilter;

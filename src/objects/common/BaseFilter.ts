import { expect, Page, test } from "@playwright/test";

export const VIEW_SWITCH = {
  THUMBNAIL: "#view-switch--tile",
  COMPACT: "#view-switch--row",
} as const;

export const SORT = {
  BUTTON: "filter_sort_combobox",
  SORT_OPTION: "filter_sort_option_AZ",
} as const;

export const FILTER = {
  BUTTON: "#filter-button",
  DIALOG: "#modal-dialog",
  APPLY_BUTTON: "filter_apply_button",
  CANCEL_BUTTON: "filter_cancel_button",
  CLEAR_BUTTON: "filter_clear_button",
} as const;

export const SEARCH = {
  INPUT: "Search",
} as const;

export const EMPTY_VIEW = {
  CONTAINER: "[data-testid='empty-view']",
} as const;

class BaseFilter {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get thumbnailViewSwitch() {
    return this.page.locator(VIEW_SWITCH.THUMBNAIL);
  }

  get compactViewSwitch() {
    return this.page.locator(VIEW_SWITCH.COMPACT);
  }

  get sortButton() {
    return this.page.getByTestId(SORT.BUTTON);
  }

  get filterButton() {
    return this.page.locator(FILTER.BUTTON);
  }

  get filterDialog() {
    return this.page.locator(FILTER.DIALOG);
  }

  get filterApplyButton() {
    return this.page.getByTestId(FILTER.APPLY_BUTTON);
  }

  get filterCancelButton() {
    return this.page.getByTestId(FILTER.CANCEL_BUTTON);
  }

  get searchInput() {
    return this.page.getByPlaceholder(SEARCH.INPUT);
  }

  get emptyViewContainer() {
    return this.page.locator(EMPTY_VIEW.CONTAINER);
  }

  get emptyViewClearButton() {
    return this.page
      .locator("#empty-view-filter")
      .filter({ hasText: "Clear filter" });
  }

  async switchToThumbnailView() {
    return test.step("Switch to thumbnail view", async () => {
      if (await this.thumbnailViewSwitch.isHidden()) return;
      await this.thumbnailViewSwitch.click();
      await expect(this.thumbnailViewSwitch).not.toBeVisible();
    });
  }

  async switchToCompactView() {
    return test.step("Switch to compact view", async () => {
      if (await this.compactViewSwitch.isHidden()) return;
      await this.compactViewSwitch.click();
      await expect(this.compactViewSwitch).not.toBeVisible();
    });
  }

  async openDropdownSortBy() {
    return test.step("Open dropdown sort by", async () => {
      await this.sortButton.click();
    });
  }

  protected async selectSortOptionByText(text: string) {
    return test.step("Select sort option by text", async () => {
      await this.page
        .getByTestId(SORT.SORT_OPTION)
        .filter({ hasText: text })
        .click();
    });
  }

  protected async applySort(option: string) {
    await this.openDropdownSortBy();
    await this.selectSortOptionByText(option);
  }

  async openFilterDialog() {
    return test.step("Open filter dialog", async () => {
      await this.filterButton.click();
      await expect(this.filterDialog).toBeVisible();
    });
  }

  async selectFilterTag(tagSelector: string) {
    return test.step("Select filter tag", async () => {
      await this.page.getByTestId(tagSelector).click();
      await expect(this.filterApplyButton).toBeEnabled();
    });
  }

  protected async applyFilter() {
    return test.step("Apply filter", async () => {
      await this.filterApplyButton.click();
      await expect(this.filterDialog).not.toBeVisible();
    });
  }

  async cancelFilter() {
    return test.step("Cancel filter", async () => {
      await this.filterCancelButton.click();
      await expect(this.filterDialog).not.toBeVisible();
    });
  }

  protected async clearFilter() {
    return test.step("Clear filter", async () => {
      await this.emptyViewClearButton.click();
      await expect(this.emptyViewContainer).not.toBeVisible();
    });
  }

  async clearFilterDialog() {
    return test.step("Clear filter dialog", async () => {
      await this.page.locator(FILTER.CLEAR_BUTTON).click();
      await expect(this.filterDialog).toBeVisible();
    });
  }

  protected async fillSearchInputAndCheckRequest(searchValue: string) {
    return test.step("Fill search input and check request", async () => {
      const promise = this.page.waitForResponse((response) => {
        return (
          response
            .url()
            .toLowerCase()
            .includes(
              `filtervalue=${encodeURIComponent(searchValue.toLowerCase())}`,
            ) && response.request().method() === "GET"
        );
      });
      await this.searchInput.fill(searchValue);
      await expect(this.searchInput).toHaveValue(searchValue);
      await promise;
    });
  }

  protected async clearSearchText() {
    return test.step("Clear search text", async () => {
      await this.searchInput.clear();
      await expect(this.searchInput).toHaveValue("");
    });
  }

  protected async removeFilter(filterName: string) {
    return test.step("Remove filter", async () => {
      const filter = this.page
        .locator(".filter-input_selected-row")
        .getByText(filterName);

      await expect(filter).toBeVisible();
      await filter.click();
      await expect(filter).not.toBeVisible();
    });
  }

  async checkEmptyView(expectedText: string) {
    return test.step("Check empty view", async () => {
      await expect(
        this.emptyViewContainer.getByText(expectedText),
      ).toBeVisible();
    });
  }
}

export default BaseFilter;

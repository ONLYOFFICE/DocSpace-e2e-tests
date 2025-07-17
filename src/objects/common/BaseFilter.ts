import { expect, Page } from "@playwright/test";

export const VIEW_SWITCH = {
  THUMBNAIL: "#view-switch--tile",
  COMPACT: "#view-switch--row",
} as const;

export const SORT = {
  BUTTON: "#sort-by-button",
  SORT_OPTION: ".option-item",
  SORT_OPTION: ".option-item",
} as const;

export const FILTER = {
  BUTTON: "#filter-button",
  DIALOG: "#modal-dialog",
  APPLY_BUTTON: "#filter_apply-button",
  CANCEL_BUTTON: "#filter_cancel-button",
  CLEAR_BUTTON: ".additional-icons-container",
} as const;

export const SEARCH = {
  INPUT: "#filter_search-input[data-testid='text-input']",
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
    return this.page.locator(SORT.BUTTON);
  }
 
  get sortBySizeOption() {
    return this.page.locator(SORT.BY_SIZE);
  }

  get filterButton() {
    return this.page.locator(FILTER.BUTTON);
  }

  get filterDialog() {
    return this.page.locator(FILTER.DIALOG);
  }

  get filterApplyButton() {
    return this.page.locator(FILTER.APPLY_BUTTON);
  }

  get filterCancelButton() {
    return this.page.locator(FILTER.CANCEL_BUTTON);
  }

  get searchInput() {
    return this.page.locator(SEARCH.INPUT);
  }

  get emptyViewContainer() {
    return this.page.locator(EMPTY_VIEW.CONTAINER);
  }

  get emptyViewClearButton() {
    return this.page.locator('a:has-text("Clear filter")');
  }

  async switchToThumbnailView() {
    if (await this.thumbnailViewSwitch.isHidden()) return;
    await this.thumbnailViewSwitch.click();
    await expect(this.thumbnailViewSwitch).not.toBeVisible();
  }

  async switchToCompactView() {
    if (await this.compactViewSwitch.isHidden()) return;
    await this.compactViewSwitch.click();
    await expect(this.compactViewSwitch).not.toBeVisible();
  }

  async openDropdownSortBy() {
    await this.sortButton.click();
  }

  protected async selectSortOptionByText(text: string) {
    await this.page.locator(SORT.SORT_OPTION).filter({ hasText: text }).click();
  }

  protected async applySort(option: string) {
    await this.openDropdownSortBy();
    await this.selectSortOptionByText(option);
  protected async selectSortOptionByText(text: string) {
    await this.page.locator(SORT.SORT_OPTION).filter({ hasText: text }).click();
  }

  protected async applySort(option: string) {
    await this.openDropdownSortBy();
    await this.selectSortOptionByText(option);
  }

  async openFilterDialog() {
    await this.filterButton.click();
    await expect(this.filterDialog).toBeVisible();
  }

  async selectFilterTag(tagSelector: string) {
    await this.page.locator(tagSelector).click();
    await expect(this.filterApplyButton).toBeEnabled();
  }

  protected async applyFilter() {
  protected async applyFilter() {
    await this.filterApplyButton.click();
    await expect(this.filterDialog).not.toBeVisible();
  }

  async cancelFilter() {
    await this.filterCancelButton.click();
    await expect(this.filterDialog).not.toBeVisible();
  }

  async clearFilter() {
    await this.emptyViewClearButton.click();
    await expect(this.emptyViewContainer).not.toBeVisible();
  }
  async clearFilterDialog() {
    await this.page.locator(FILTER.CLEAR_BUTTON).click();
    await expect(this.filterDialog).toBeVisible();
  }

  protected async fillSearchInputAndCheckRequest(searchValue: string) {
    const promise = this.page.waitForResponse((response) => {
  protected async fillSearchInputAndCheckRequest(searchValue: string) {
    const promise = this.page.waitForResponse((response) => {
      return (
        response
          .url()
          .toLowerCase()
          .includes(
            `filtervalue=${encodeURIComponent(searchValue.toLowerCase())}`,
          ) && response.request().method() === "GET"
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
  }

  protected async clearSearchText() {
  protected async clearSearchText() {
    await this.searchInput.clear();
    await expect(this.searchInput).toHaveValue("");
  }

  protected async removeFilter(filterName: string) {
  protected async removeFilter(filterName: string) {
    const filter = this.page
      .locator(".filter-input_selected-row")
      .getByText(filterName);

    await expect(filter).toBeVisible();
    await filter.click();
    await expect(filter).not.toBeVisible();
  }

  async checkEmptyView(expectedText: string) {
    await expect(this.emptyViewContainer.getByText(expectedText)).toBeVisible();
  }
}

export default BaseFilter;

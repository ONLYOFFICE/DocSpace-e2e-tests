import { expect, Page } from "@playwright/test";

const THUMBNAIL_VIEW_SWITCH = "#view-switch--tile";
const COMPACT_VIEW_SWITCH = "#view-switch--row";
const SORT_BUTTON = "#sort-by-button";
const FILTER_BUTTON = "#filter-button";
const SEARCH_INPUT = "#filter_search-input[data-testid='text-input']";
const FILES_HEADER = ".folder_header.header-item";

const SORT_BY_SIZE_OPTION = "#sort-by_size";
const FILTER_MODAL_DIALOG = "#modal-dialog";

const FILTER_BY_FOLDERS_TAG = "#filter_type-folders";
const FILTER_BY_MEDIA_TAG = "#filter_type-media";
const FILTER_APPLY_BUTTON = "#filter_apply-button";

const EMPTY_VIEW = "[data-testid='empty-view']";
const EMPTY_VIEW_CLEAR_FILTER_BUTTON = "#empty-view-filter";

class FilesFilter {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private get thumbnailViewSwitch() {
    return this.page.locator(THUMBNAIL_VIEW_SWITCH);
  }

  private get compactViewSwitch() {
    return this.page.locator(COMPACT_VIEW_SWITCH);
  }

  private get sortButton() {
    return this.page.locator(SORT_BUTTON);
  }

  private get filterButton() {
    return this.page.locator(FILTER_BUTTON);
  }

  private get searchInput() {
    return this.page.locator(SEARCH_INPUT);
  }

  private get filesHeader() {
    return this.page.locator(FILES_HEADER);
  }

  private get sortBySizeOption() {
    return this.page.locator(SORT_BY_SIZE_OPTION);
  }

  private get filterModalDialog() {
    return this.page.locator(FILTER_MODAL_DIALOG);
  }

  private get filterByFoldersTag() {
    return this.page.locator(FILTER_BY_FOLDERS_TAG);
  }

  private get filterByMediaTag() {
    return this.page.locator(FILTER_BY_MEDIA_TAG);
  }

  private get filterApplyButton() {
    return this.page.locator(FILTER_APPLY_BUTTON);
  }

  private get emptyView() {
    return this.page.locator(EMPTY_VIEW);
  }

  private get emptyViewClearFilterButton() {
    return this.page.locator(EMPTY_VIEW_CLEAR_FILTER_BUTTON);
  }

  async switchToThumbnailView() {
    await this.thumbnailViewSwitch.click();
    await expect(this.filesHeader).toBeVisible();
  }

  async switchToCompactView() {
    await this.compactViewSwitch.click();
    await expect(this.filesHeader).not.toBeVisible();
  }

  async openDropdownSortBy() {
    await this.sortButton.click();
    await expect(this.sortBySizeOption).toBeVisible();
  }

  async clickSortBySize() {
    await this.sortBySizeOption.click();
  }

  async openFilterDialog() {
    await this.filterButton.click();
    await expect(this.filterModalDialog).toBeVisible();
  }

  async clickFilterByFoldersTag() {
    await this.filterByFoldersTag.click();
    await expect(this.filterApplyButton).toBeEnabled();
  }

  async clickFilterByMediaTag() {
    await this.filterByMediaTag.click();
    await expect(this.filterApplyButton).toBeEnabled();
  }

  async clickApplyFilter() {
    await this.filterApplyButton.click();
    await expect(this.filterModalDialog).not.toBeVisible();
  }

  async clearFilter() {
    await this.emptyViewClearFilterButton.click();
    await expect(this.emptyView).not.toBeVisible();
  }

  async fillSearchInputAndCheckRequest(searchValue: string) {
    await this.searchInput.fill(searchValue);
    await expect(this.searchInput).toHaveValue(searchValue);

    await this.page.waitForResponse((response) => {
      return (
        response.request().method() === "GET" &&
        response
          .url()
          .includes(`filterValue=${encodeURIComponent(searchValue)}`)
      );
    });
  }

  async clearSearchText() {
    await this.searchInput.clear();
    await expect(this.searchInput).toHaveValue("");
  }

  async checkEmptyViewExist() {
    await expect(this.emptyView.getByText("No findings")).toBeVisible();
  }
}

export default FilesFilter;

import { expect, Page } from "@playwright/test";

export const VIEW_SWITCH = {
  THUMBNAIL: "#view-switch--tile",
  COMPACT: "#view-switch--row",
} as const;

export const SORT = {
  BUTTON: "#sort-by-button",
  SORT_OPTION: ".option-item",
} as const;

export const FILTER = {
  BUTTON: "#filter-button",
  DIALOG: "#modal-dialog",
  APPLY_BUTTON: "#filter_apply-button",
  CANCEL_BUTTON: "#filter_cancel-button",
  CLEAR_BUTTON: "filter_clear_button",
} as const;

export const SEARCH = {
  INPUT: "#filter_search-input[data-testid='text-input']",
} as const;

export const EMPTY_VIEW = {
  CONTAINER: "[data-testid='empty-view']",
} as const;

// Metadata filter: Search options -> "Add condition" -> condition form
const METADATA_ADD_CONDITION = "metadata_filter_add_condition";
const METADATA_FILTER_PANEL = "metadata_filter_panel";
const METADATA_FILTER_TEMPLATE = "metadata_filter_template";
const METADATA_FILTER_CONDITION = "metadata_filter_condition";
const METADATA_FILTER_OPERATOR = "metadata_filter_operator";
const METADATA_VALUE_INPUT = "metadata_value_input";
const METADATA_FILTER_APPLY = "metadata_filter_apply";
const METADATA_DIALOG_CHIP = "metadata_filter_chip_metadata-";
const METADATA_SELECTED_CHIP = "filter_selected_item_metadata-";

class BaseFilter {
  page: Page;
  private lastSelectedFilterTag?: string;

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

  get filterButton() {
    return this.page.locator(FILTER.BUTTON);
  }

  get filterDialog() {
    // Workaround: background Sync aside also has #modal-dialog/testid in DOM
    return this.page
      .locator(FILTER.DIALOG)
      .filter({ has: this.page.locator(FILTER.APPLY_BUTTON) });
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
  }

  async openFilterDialog() {
    await this.filterButton.click();
    await expect(this.filterDialog).toBeVisible();
  }

  async selectFilterTag(tagSelector: string) {
    const tag = this.page.locator(tagSelector);
    await tag.click();

    if (!(await this.filterApplyButton.isEnabled())) {
      await this.clearFilterDialog();
      await tag.click();
    }

    await expect(this.filterApplyButton).toBeEnabled({ timeout: 10000 });
    this.lastSelectedFilterTag = tagSelector;
  }

  protected async applyFilter() {
    if (!(await this.filterApplyButton.isEnabled())) {
      if (this.lastSelectedFilterTag) {
        await this.clearFilterDialog();
        await this.page.locator(this.lastSelectedFilterTag).click();
      }
      await expect(this.filterApplyButton).toBeEnabled({ timeout: 10000 });
    }
    await this.filterApplyButton.click();
    try {
      await expect(this.filterDialog).not.toBeVisible();
    } catch {
      if (this.lastSelectedFilterTag) {
        await this.page.locator(this.lastSelectedFilterTag).click();
      }
      await this.filterApplyButton.click();
      await expect(this.filterDialog).not.toBeVisible();
    }
  }

  async cancelFilter() {
    await expect(async () => {
      await this.filterCancelButton.click();
      await expect(this.filterDialog).not.toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 20000 });
  }

  protected async clearFilter() {
    await this.emptyViewClearButton.click();
    await expect(this.emptyViewContainer).not.toBeVisible();
  }

  async clearFilterDialog() {
    await this.page.getByTestId(FILTER.CLEAR_BUTTON).click();
    await expect(this.filterDialog).toBeVisible();
  }

  protected async fillSearchInputAndCheckRequest(searchValue: string) {
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
  }

  protected async clearSearchText() {
    await this.searchInput.clear();
    await expect(this.searchInput).toHaveValue("");
  }

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

  // Fills one condition and returns to Search options; the filter itself is
  // applied with applyFilter(). Operator is the dropdown label, e.g.
  // "greater than".
  async addMetadataCondition(condition: {
    template: string;
    field: string;
    operator: string;
    value: string;
  }) {
    await this.page.getByTestId(METADATA_ADD_CONDITION).click();
    const panel = this.page.getByTestId(METADATA_FILTER_PANEL);
    await panel.getByTestId(METADATA_FILTER_TEMPLATE).click();
    await this.page
      .getByRole("option", { name: condition.template, exact: true })
      .click();
    const row = panel
      .getByTestId(METADATA_FILTER_CONDITION)
      .filter({ hasText: condition.field });
    await row.getByTestId(METADATA_FILTER_OPERATOR).click();
    await this.page
      .getByRole("option", { name: condition.operator, exact: true })
      .click();
    await row.getByTestId(METADATA_VALUE_INPUT).fill(condition.value);
    await panel.getByTestId(METADATA_FILTER_APPLY).click();
    await expect(panel).toBeHidden();
  }

  async checkMetadataConditionChip(fieldId: number, text: string) {
    await expect(
      this.page.getByTestId(`${METADATA_DIALOG_CHIP}${fieldId}`),
    ).toContainText(text);
  }

  async checkMetadataSelectedFilter(fieldId: number, text: string) {
    await expect(
      this.page.getByTestId(`${METADATA_SELECTED_CHIP}${fieldId}`),
    ).toContainText(text);
  }
}

export default BaseFilter;

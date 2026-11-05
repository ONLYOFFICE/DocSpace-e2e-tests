import { expect, Page } from "@playwright/test";
import BaseFilter from "../common/BaseFilter";
import { docSort, TDocSort } from "@/src/utils/constants/files";
import { waitForGetFilesResponse } from "./api";
import { FILTER_TYPE, FILTER_LOCATION } from "@/src/utils/constants/filter";

const TITLE_FOLDERS = "#folder-tile-heading";
const EMPTY_VIEW_FILTER = "#empty-view-filter";
const FILTER_SELECTOR_ADD = "[data-testid='selector-add-button-container']";

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

class FilesFilter extends BaseFilter {
  constructor(page: Page) {
    super(page);
  }

  async applySort(option: TDocSort) {
    const promise = waitForGetFilesResponse(this.page);
    await super.applySort(option);
    await promise;
  }

  async selectSortByName() {
    const promise = waitForGetFilesResponse(this.page);
    await super.selectSortOptionByText(docSort.name);
    await promise;
  }

  async selectFilterByFolders() {
    await super.selectFilterTag(FILTER_TYPE.FOLDERS);
  }

  async selectFilterByMedia() {
    await super.selectFilterTag(FILTER_TYPE.MEDIA);
  }

  async selectFilterByFiles() {
    await super.selectFilterTag(FILTER_TYPE.ALL_FILES);
  }

  async selectFilterByDocuments() {
    await super.selectFilterTag(FILTER_TYPE.DOCUMENTS);
  }

  async selectFilterBySpreadsheets() {
    await super.selectFilterTag(FILTER_TYPE.SPREADSHEETS);
  }

  async selectFilterByPresentations() {
    await super.selectFilterTag(FILTER_TYPE.PRESENTATIONS);
  }

  async selectFilterByPdfDocuments() {
    await super.selectFilterTag(FILTER_TYPE.PDF);
  }

  async selectFilterByPdfForms() {
    await super.selectFilterTag(FILTER_TYPE.FORMS);
  }

  async selectFilterByDiagrams() {
    await super.selectFilterTag(FILTER_TYPE.DIAGRAMS);
  }

  async selectFilterByArchives() {
    await super.selectFilterTag(FILTER_TYPE.ARCHIVE);
  }

  async selectFilterByImages() {
    await super.selectFilterTag(FILTER_TYPE.IMAGES);
  }

  async expectPersonSelectorsNotVisible() {
    await expect(this.filterDialog.locator(FILTER_SELECTOR_ADD)).toHaveCount(0);
  }

  async selectFilterByLocationRooms() {
    await super.selectFilterTag(FILTER_LOCATION.ROOMS);
  }

  async selectFilterByLocationDocuments() {
    await super.selectFilterTag(FILTER_LOCATION.DOCUMENTS);
  }

  async selectFilterByLocationLink() {
    await super.selectFilterTag(FILTER_LOCATION.LINK);
  }

  async applyFilter() {
    const promise = waitForGetFilesResponse(this.page);
    await super.applyFilter();
    await promise;
  }

  async applyFilterNoWait() {
    await super.applyFilter();
  }
  async clearFilter() {
    const promise = waitForGetFilesResponse(this.page);
    await super.clearFilter();
    await promise;
  }

  async clearSearchText() {
    const promise = waitForGetFilesResponse(this.page);
    await super.clearSearchText();
    await promise;
  }

  private get titleFolders() {
    return this.page.locator(TITLE_FOLDERS);
  }

  async fillFilesSearchInputAndCheckRequest(searchValue: string) {
    await super.fillSearchInputAndCheckRequest(searchValue);
  }

  async switchToDocumentsCompactView() {
    await super.switchToCompactView();
  }

  async switchToDocumentsThumbnailView() {
    await super.switchToThumbnailView();
    await expect(this.titleFolders).toBeVisible();
  }

  async checkFilesEmptyViewExist() {
    await super.checkEmptyView("No findings");
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

  async clearFilterFromEmptyView() {
    const promise = waitForGetFilesResponse(this.page);
    await this.page.locator(EMPTY_VIEW_FILTER).click();
    await promise;
  }
}

export default FilesFilter;

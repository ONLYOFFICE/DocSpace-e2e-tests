import { expect, Page } from "@playwright/test";
import BaseFilter from "../common/BaseFilter";
import { docSort, TDocSort } from "@/src/utils/constants/files";
import { waitForGetFilesResponse } from "./api";

const filesFilter = {
  byFolders: "#filter_type-folders",
  byMedia: "#filter_type-media",
} as const;

const TITLE_FOLDERS = "#folder-tile-heading";

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
    await super.selectFilterTag(filesFilter.byFolders);
  }

  async selectFilterByMedia() {
    await super.selectFilterTag(filesFilter.byMedia);
  }

  async applyFilter() {
    const promise = waitForGetFilesResponse(this.page);
    await super.applyFilter();
    await promise;
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
}

export default FilesFilter;
